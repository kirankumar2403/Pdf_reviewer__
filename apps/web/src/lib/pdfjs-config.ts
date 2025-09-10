/**
 * pdfjs-config.ts
 * Centralized configuration for PDF.js in Next.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Extend GlobalWorkerOptions typing
declare module 'pdfjs-dist' {
  namespace GlobalWorkerOptions {
    let workerSrc: string;
  }
}

// Flag to prevent multiple configurations
let isConfigured = false;

/**
 * Configure PDF.js to use CDN worker and fonts.
 * Only runs on the client-side.
 */
export function configurePdfJs(): void {
  if (isConfigured || typeof window === 'undefined') return;

  try {
    // Set PDF.js worker from CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

    isConfigured = true;

    console.log('PDF.js configured successfully', {
      version: pdfjsLib.version,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
    });
  } catch (error) {
    console.warn('Failed to configure PDF.js:', error);
  }
}

/**
 * Returns PDF.js loading options, including font URLs
 */
export function getPdfLoadingOptions() {
  return {
    // Standard fonts (from CDN)
    standardFontDataUrl: typeof window !== 'undefined'
      ? `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      : undefined,
    disableFontFace: false,
    verbosity: 0,
    useSystemFonts: true,
    disableWebGL: false,
    enableXfa: false,
  };
}

/**
 * Initialize PDF.js (client-side)
 * Call this in your root component or page
 */
export function initializePdfJs(): void {
  if (typeof window !== 'undefined') {
    // Use next tick to avoid SSR issues
    setTimeout(configurePdfJs, 0);
  }
}

export { pdfjsLib };
