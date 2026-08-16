import { toPng, toBlob } from 'html-to-image';
import confetti from 'canvas-confetti';

export interface ExportOptions {
  resolutionMultiplier?: number;
  filename?: string;
  width?: number;
  height?: number;
}

/**
 * Trigger celebratory confetti effect on successful export/copy
 */
export function triggerConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#1877F2', '#00A3FF', '#6366F1', '#EC4899'],
    });
  } catch {
    // Ignore in non-supported environments
  }
}

/**
 * Renders the Card DOM node to high-res PNG and initiates download
 */
export async function downloadCardImage(
  node: HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const pixelRatio = options.resolutionMultiplier || 2;

    const dataUrl = await toPng(node, {
      pixelRatio,
      cacheBust: true,
      skipFonts: false,
      quality: 0.98,
      backgroundColor: undefined,
    });

    const link = document.createElement('a');
    const cleanName = (options.filename || 'postframe-hd-post')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    link.download = `${cleanName}-${pixelRatio}x.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerConfetti();
    return { success: true };
  } catch (err: any) {
    console.error('Export error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to render high-resolution image.',
    };
  }
}

/**
 * Copies the rendered card directly into the system clipboard as a PNG image
 */
export async function copyCardToClipboard(
  node: HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const pixelRatio = options.resolutionMultiplier || 2;

    const blob = await toBlob(node, {
      pixelRatio,
      cacheBust: true,
      skipFonts: false,
      quality: 0.98,
    });

    if (!blob) {
      throw new Error('Could not create image blob');
    }

    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard image writing is not supported in this browser.');
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    triggerConfetti();
    return { success: true };
  } catch (err: any) {
    console.error('Clipboard copy error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to copy image to clipboard.',
    };
  }
}
