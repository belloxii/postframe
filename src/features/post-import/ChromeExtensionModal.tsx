import React, { useState } from 'react';
import {
  X,
  Chrome,
  Download,
  Code2,
  CheckCircle2,
  Play,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { FacebookPostParser } from '../../lib/facebook-parser';
import { Post } from '../../types';
import { SocialPost } from '../../shared/types';

// Sample real-world Facebook HTML fixtures for parser simulation
const SAMPLE_FIXTURES = [
  {
    name: 'NASA - James Webb Telescope (Desktop Post)',
    html: `<div role="article" aria-label="NASA's post">
  <div class="header">
    <a role="link" href="https://www.facebook.com/NASA" class="actor__title">NASA - National Aeronautics and Space Administration</a>
    <svg aria-label="Verified Page" class="verified"></svg>
    <a href="https://www.facebook.com/NASA/posts/101602938491823" aria-label="2 hours ago">2h · 🌐</a>
  </div>
  <div dir="auto" data-ad-preview="message">
    Cosmic wonders unveiled. Look into the deepest infrared view of the universe ever taken by NASA's James Webb Space Telescope. Thousands of galaxies shine in a grain of sand held at arm's length.
  </div>
  <div data-pagelet="Media">
    <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&auto=format&fit=crop&q=80" width="1200" height="800" alt="Deep Field View" />
  </div>
  <div role="toolbar">
    <div aria-label="142K reactions, including like, love, and wow">142K reactions</div>
    <div>12.4K comments</div>
    <div>8.9K shares</div>
  </div>
</div>`,
  },
  {
    name: 'Mark Zuckerberg - Meta Connect (Quote & Media)',
    html: `<div role="article" aria-label="Mark Zuckerberg's post">
  <h2><a href="https://www.facebook.com/zuck">Mark Zuckerberg</a> <svg aria-label="Verified"></svg></h2>
  <a href="https://www.facebook.com/zuck/posts/8492049182" aria-label="Yesterday at 4:30 PM">Yesterday at 4:30 PM</a>
  <div data-ad-comet-preview="message">
    Today we're open-sourcing our next-generation foundation model. It delivers state-of-the-art reasoning while running efficiently on everyday hardware. The future of open technology is brighter than ever.
  </div>
  <div data-visualcompletion="media-vc-image">
    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80" width="1200" height="675" alt="AI Computing Architecture" />
  </div>
  <div>
    <span aria-label="89K reactions">89K reactions</span>
    <span>14K comments</span>
    <span>5.2K shares</span>
  </div>
</div>`,
  },
  {
    name: 'National Geographic - Wildlife Expedition',
    html: `<article class="story_body_container">
  <h3><a href="https://www.facebook.com/natgeo">National Geographic</a> <svg aria-label="Verified account"></svg></h3>
  <time aria-label="5 hours ago">5h</time>
  <div class="userContent">
    A mother grizzly bear and her cubs navigate the pristine waterways of Katmai National Park, Alaska. Protecting these wild habitats ensures biodiversity thrives for generations to come. 🐻🌿
  </div>
  <div data-pagelet="Media">
    <img src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=1200&auto=format&fit=crop&q=80" width="1200" height="800" alt="Grizzly in Katmai" />
  </div>
  <div>
    <span>45K reactions</span>
    <span>1.2K comments</span>
    <span>3.4K shares</span>
  </div>
</article>`,
  },
];

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExtractedPost: (post: Post) => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
  onLoadExtractedPost,
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'simulator' | 'security'>('install');
  const [selectedFixtureIndex, setSelectedFixtureIndex] = useState(0);
  const [customHtml, setCustomHtml] = useState(SAMPLE_FIXTURES[0].html);
  const [extractedPost, setExtractedPost] = useState<SocialPost | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);

  if (!isOpen) return null;

  const handleRunSimulator = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(customHtml, 'text/html');
      const result = FacebookPostParser.detectPost(doc, 'https://www.facebook.com/sample-post');
      setExtractedPost(result);
      setHasSimulated(true);
    } catch (err) {
      console.error('Simulator error:', err);
    }
  };

  const handleApplyToStudio = () => {
    if (!extractedPost) return;

    const webPost: Post = {
      id: `ext-${Date.now()}`,
      source: 'facebook',
      sourceUrl: extractedPost.sourceUrl,
      author: extractedPost.author.name,
      authorAvatarUrl: extractedPost.author.avatarUrl || '',
      authorProfileUrl: extractedPost.author.profileUrl,
      verified: !!extractedPost.author.verified,
      text: extractedPost.text,
      images: extractedPost.images.map((img, i) => ({
        id: `img-${i}`,
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })),
      publishedAt: extractedPost.publishedAt || 'Recently on Facebook',
      reactions: extractedPost.engagement.reactions || 1200,
      comments: extractedPost.engagement.comments || 45,
      shares: extractedPost.engagement.shares || 18,
      topReactions: extractedPost.engagement.topReactions,
      privacy: 'public',
    };

    onLoadExtractedPost(webPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black italic">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  PostFrame Chrome Extension
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-semibold uppercase">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-white/50">
                Capture any Facebook post you are viewing directly in your browser tab
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-[#080808]">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'install'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Install & Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Live DOM Parser Playground</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Privacy</span>
          </button>
        </div>

        {/* Tab 1: Install Instructions */}
        {activeTab === 'install' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Quick Download Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-emerald-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Download Ready-to-Load Extension
                  </h4>
                </div>
                <p className="text-xs text-white/70">
                  Get the complete pre-built extension package in a single <code>.zip</code> file.
                </p>
              </div>

              <a
                href="/api/download-extension"
                download="postframe-chrome-extension.zip"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Extension (.ZIP)</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-white/80 space-y-1">
                <p className="font-semibold text-white">How the extension works:</p>
                <p>
                  The PostFrame extension extracts visible post elements (author, photo, text, stats) straight from your active Facebook tab and passes structured JSON to this web studio with zero cookie access.
                </p>
              </div>
            </div>

            {/* Step by Step */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 font-mono">
                Installation Steps (Chrome / Edge / Brave):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center font-mono">
                    1
                  </div>
                  <h5 className="text-sm font-semibold text-white">Unzip Download</h5>
                  <p className="text-xs text-white/60">
                    Download and extract the <code className="text-blue-400 bg-white/5 px-1 rounded">.zip</code> package to a folder on your computer.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center font-mono">
                    2
                  </div>
                  <h5 className="text-sm font-semibold text-white">Load Unpacked</h5>
                  <p className="text-xs text-white/60">
                    Open <code className="text-blue-400 bg-white/5 px-1 rounded">chrome://extensions</code>, turn on <strong>Developer mode</strong>, and click <strong>Load unpacked</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center font-mono">
                    3
                  </div>
                  <h5 className="text-sm font-semibold text-white">Capture 1-Click</h5>
                  <p className="text-xs text-white/60">
                    Browse to any Facebook post, click the PostFrame icon, and hit <strong>Open in PostFrame HD</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Features summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/60 font-mono">
                Package Contents
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Manifest V3 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Resilient DOM Parser Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Multiple Post Disambiguation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Popup with HD Bridge</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live DOM Parser Playground */}
        {activeTab === 'simulator' && (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-white">Interactive DOM Parser Sandbox</h4>
                <p className="text-xs text-white/50">
                  Test the <code className="text-blue-400">FacebookPostParser</code> against real Facebook HTML fixtures.
                </p>
              </div>

              {/* Fixture Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Fixture:</span>
                <select
                  value={selectedFixtureIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedFixtureIndex(idx);
                    setCustomHtml(SAMPLE_FIXTURES[idx].html);
                    setExtractedPost(null);
                    setHasSimulated(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SAMPLE_FIXTURES.map((f, i) => (
                    <option key={i} value={i} className="bg-slate-900 text-white">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code editor & execution */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70">Raw Facebook DOM Markup:</label>
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="button"
                onClick={handleRunSimulator}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Parser & Extract Structured Data</span>
              </button>
            </div>

            {/* Extraction Results */}
            {hasSimulated && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-white/70 font-mono flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Extraction Output</span>
                  </h5>
                  {extractedPost && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                      {Math.round((extractedPost.extraction?.confidence || 0.9) * 100)}% Confidence Score
                    </span>
                  )}
                </div>

                {extractedPost ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/40 block text-[10px]">Author:</span>
                        <span className="font-semibold text-white">{extractedPost.author.name}</span>
                        {extractedPost.author.verified && <span className="text-blue-400 ml-1">✓</span>}
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/40 block text-[10px]">Reactions:</span>
                        <span className="font-semibold text-white">
                          {extractedPost.engagement.reactions?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/40 block text-[10px]">Comments:</span>
                        <span className="font-semibold text-white">
                          {extractedPost.engagement.comments?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/40 block text-[10px]">Shares:</span>
                        <span className="font-semibold text-white">
                          {extractedPost.engagement.shares?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/40 block text-[10px]">Extracted Text:</span>
                      <p className="text-white/90 line-clamp-2 mt-0.5">{extractedPost.text}</p>
                    </div>

                    {extractedPost.images.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-[10px]">Images found:</span>
                        <span className="px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded font-mono text-[11px]">
                          {extractedPost.images.length} Attached High-Res Media
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleApplyToStudio}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Load this Post into PostFrame Studio</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rose-300">
                    No valid post container detected in this markup.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security & Privacy */}
        {activeTab === 'security' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Strict Security & Non-Intrusive Privacy Architecture</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                PostFrame was architected from the ground up to respect user privacy and adhere strictly to Chrome Extension Manifest V3 security boundaries:
              </p>
              <div className="space-y-2.5 text-xs text-white/80">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Zero Credential Access:</strong> The extension NEVER reads, extracts, or transmits Facebook cookies, passwords, session tokens, or authentication credentials.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Visible DOM Only:</strong> The parser strictly inspects visible HTML elements rendered on the page you are already authorized to view.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Ephemeral Transfers:</strong> Transferred post payloads use short-lived temporary import tokens with automatic TTL expiration.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/api/download-extension"
              download="postframe-chrome-extension.zip"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </a>
            <span className="text-xs text-white/40 hidden sm:inline">
              Pre-built Manifest V3 Package
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
