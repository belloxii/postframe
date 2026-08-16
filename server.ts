import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with increased limit for base64 screenshot uploads
app.use(express.json({ limit: '25mb' }));

// Lazy init Gemini SDK
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// SSRF Protection Helper
function isSafeUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Block loopback, private ranges, metadata servers
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 1. API: Validate Facebook URL
// ----------------------------------------------------
app.post('/api/validate-url', (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ isValid: false, error: 'URL is required' });
    return;
  }

  const isFb = /^(https?:\/\/)?(www\.|m\.|web\.|touch\.)?(facebook\.com|fb\.watch|fb\.me)\/.+/i.test(url.trim());
  if (!isFb) {
    res.json({
      isValid: false,
      error: 'Not a valid Facebook URL. Please provide a link starting with facebook.com or fb.watch',
    });
    return;
  }

  res.json({ isValid: true, cleanUrl: url.trim() });
});

// ----------------------------------------------------
// 2. API: Fetch / Import Facebook Data (OpenGraph / Metadata)
// ----------------------------------------------------
app.post('/api/fetch-facebook', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || !isSafeUrl(url)) {
    res.status(400).json({ success: false, error: 'Invalid or unsafe URL provided' });
    return;
  }

  try {
    // Attempt to extract basic page slug or ID from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    let estimatedAuthor = 'Facebook User';
    if (pathParts.length > 0 && pathParts[0] !== 'permalink.php' && pathParts[0] !== 'watch' && pathParts[0] !== 'story.php') {
      estimatedAuthor = decodeURIComponent(pathParts[0]).replace(/[._]/g, ' ');
      // Capitalize words
      estimatedAuthor = estimatedAuthor.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Try fetching OpenGraph metadata safely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let html = '';
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        html = await response.text();
      }
    } catch {
      clearTimeout(timeoutId);
    }

    // Extract OpenGraph tags if present
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i)?.[1] || '';
    const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i)?.[1] || '';
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i)?.[1] || '';

    // Check if we extracted clean content or if FB hit a login gate
    const hasSufficientData = (ogDesc.length > 10 || ogTitle.length > 10) && !ogTitle.toLowerCase().includes('log into facebook');

    if (hasSufficientData) {
      res.json({
        success: true,
        post: {
          id: `fb-${Date.now()}`,
          source: 'facebook',
          sourceUrl: url,
          author: ogTitle || estimatedAuthor,
          authorAvatarUrl: '',
          verified: false,
          text: ogDesc || ogTitle,
          images: ogImage ? [{ id: `img-1`, url: ogImage }] : [],
          publishedAt: 'Recently on Facebook',
          reactions: 1200,
          comments: 48,
          shares: 19,
          privacy: 'public',
        },
      });
      return;
    }

    // When direct scraping is gated by Meta (Standard Facebook protection),
    // return a transparent payload with helpful instructions & pre-filled baseline
    res.json({
      success: false,
      isRestricted: true,
      requiresManualImport: true,
      warning: 'Facebook requires authentication for direct post access. Use our 1-click Screenshot Scanner or fill in the post details to generate your HD image.',
      prefilled: {
        sourceUrl: url,
        author: estimatedAuthor !== 'Facebook User' ? estimatedAuthor : '',
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      isRestricted: true,
      requiresManualImport: true,
      error: err?.message || 'Could not reach Facebook servers directly.',
    });
  }
});

// ----------------------------------------------------
// 3. API: AI Screenshot Extractor (Multimodal Gemini Vision)
// ----------------------------------------------------
app.post('/api/extract-screenshot', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;

  if (!imageBase64) {
    res.status(400).json({ success: false, error: 'No image data provided.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(500).json({
      success: false,
      error: 'Gemini API key is not configured in the server environment.',
    });
    return;
  }

  try {
    // Strip data url prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Analyze this screenshot of a Facebook post. Extract all available information with extreme fidelity.
Return a structured JSON object containing:
- author: Full name or page title of the poster
- authorHandle: Username or handle if visible (e.g., @NASA)
- verified: boolean whether a verified checkmark badge is visible next to the author's name
- text: Exact full body text of the post. Preserve emojis, line breaks, and hashtags.
- publishedAt: Timestamp or date string shown (e.g. "2 hrs ago", "October 14, 2025 at 3:45 PM", "Yesterday")
- reactions: Estimated or exact total reaction count as an integer number (e.g., 142000 for 142K)
- comments: Estimated or exact comment count as an integer number
- shares: Estimated or exact share count as an integer number
- topReactions: Array of visible reaction types among ["like", "love", "care", "haha", "wow", "sad", "angry"]
- location: Location tag if visible
- hasImageInPost: boolean whether the post itself contains an attached photograph/graphic (distinct from avatar)
- imageCount: number of attached images visible`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType as string,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            author: { type: Type.STRING },
            authorHandle: { type: Type.STRING },
            verified: { type: Type.BOOLEAN },
            text: { type: Type.STRING },
            publishedAt: { type: Type.STRING },
            reactions: { type: Type.INTEGER },
            comments: { type: Type.INTEGER },
            shares: { type: Type.INTEGER },
            topReactions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            location: { type: Type.STRING },
            hasImageInPost: { type: Type.BOOLEAN },
            imageCount: { type: Type.INTEGER },
          },
          required: ['author', 'verified', 'text', 'publishedAt', 'reactions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');

    res.json({
      success: true,
      extracted: parsedJson,
    });
  } catch (err: any) {
    console.error('Screenshot extraction error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to analyze screenshot.',
    });
  }
});

// ----------------------------------------------------
// 4. API: Safe Image Proxy (CORS & SSRF safe)
// ----------------------------------------------------
app.get('/api/proxy-image', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !isSafeUrl(imageUrl)) {
    res.status(400).send('Invalid or restricted URL');
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PostFrame-HD-Renderer/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      res.status(upstream.status).send('Upstream image error');
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      res.status(400).send('Target resource is not an image');
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.length > 20 * 1024 * 1024) {
      res.status(400).send('Image exceeds size limit of 20MB');
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send(`Proxy failed: ${err.message}`);
  }
});

// ----------------------------------------------------
// 5. API: Ephemeral Post Transfer (Chrome Extension ➔ Web App)
// ----------------------------------------------------
interface EphemeralImport {
  id: string;
  post: any;
  createdAt: number;
  expiresAt: number;
}

// In-Memory store with 30-minute auto-expiry
const temporaryImports = new Map<string, EphemeralImport>();
const IMPORT_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Periodic cleanup of expired imports
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of temporaryImports.entries()) {
    if (now > item.expiresAt) {
      temporaryImports.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Endpoint: Create short-lived temporary import
app.post('/api/import', (req: Request, res: Response) => {
  const { post } = req.body;
  if (!post || typeof post !== 'object') {
    res.status(400).json({ success: false, error: 'Valid post object is required.' });
    return;
  }

  // Generate safe random import ID
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const importId = `pf-${Date.now()}-${randomSuffix}`;
  const now = Date.now();

  temporaryImports.set(importId, {
    id: importId,
    post,
    createdAt: now,
    expiresAt: now + IMPORT_TTL_MS,
  });

  res.json({
    success: true,
    importId,
    expiresInSeconds: Math.floor(IMPORT_TTL_MS / 1000),
    url: `/import/${importId}`,
  });
});

// Endpoint: Retrieve temporary import by ID
app.get('/api/import/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = temporaryImports.get(id);

  if (!item) {
    res.status(404).json({
      success: false,
      error: 'Imported post expired or not found. Please capture again using the PostFrame Chrome Extension.',
    });
    return;
  }

  if (Date.now() > item.expiresAt) {
    temporaryImports.delete(id);
    res.status(410).json({
      success: false,
      error: 'This import link has expired. Captured posts are ephemeral for privacy.',
    });
    return;
  }

  res.json({
    success: true,
    post: item.post,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
  });
});

// Endpoint: Download the complete ready-to-load Chrome Extension as a ZIP
app.get('/api/download-extension', async (req: Request, res: Response) => {
  try {
    const extensionDir = path.join(process.cwd(), 'extension');
    if (!fs.existsSync(extensionDir)) {
      res.status(404).send('Extension source folder not found.');
      return;
    }

    const zip = new JSZip();

    // Helper to recursively add files to JSZip
    function addDirToZip(currentDir: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        // Skip node_modules or temp files
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          if (subFolder) addDirToZip(fullPath, subFolder);
        } else {
          const fileData = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, fileData);
        }
      }
    }

    addDirToZip(extensionDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="postframe-chrome-extension.zip"'
    );
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to generate extension ZIP:', err);
    res.status(500).send('Failed to package extension: ' + err.message);
  }
});

// ----------------------------------------------------
// Vite & Static Asset Handling
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PostFrame server running at http://localhost:${PORT}`);
  });
}

startServer();
