/**
 * PDF.js Configuration Utility
 * 
 * This file centralizes PDF.js configuration to resolve font loading warnings
 * and ensure proper setup across the application.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Flag to track if PDF.js has been configured
let isConfigured = false;

/**
 * Configure PDF.js with proper worker and font settings
 * Should only be called on the client side
 */
export function configurePdfJs(): void {
  // Only configure once and only on client side
  if (isConfigured || typeof window === 'undefined') {
    return;
  }

  try {
    // Set the worker source - use CDN for reliability
    // @ts-ignore - PDF.js global options shape
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    // @ts-ignore - PDF.js global options shape
    //pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = standardFontDataUrl;

    

    console.log('PDF.js configured successfully', {
      version: pdfjsLib.version,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
      standardFontDataUrl: pdfjsLib.GlobalWorkerOptions.standardFontDataUrl,
    });
  } catch (error) {
    console.warn('Failed to configure PDF.js:', error);
  }
}

/**
 * Get PDF.js document loading options with font handling
 */
export function getPdfLoadingOptions() {
  return {
    // Handle font loading errors gracefully
    standardFontDataUrl: typeof window !== 'undefined' 
      ? `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      : undefined,
    // Don't disable font faces - let PDF.js handle fallbacks
    disableFontFace: false,
    // Minimal verbosity to reduce console noise
    verbosity: 0, // 0 = errors only, 1 = warnings, 5 = all
    // Enable automatic font substitution
    useSystemFonts: true,
    // Disable web fonts if there are loading issues
    disableWebGL: false,
    // Enable font range requests for better performance
    enableXfa: false,
  };
}

/**
 * Initialize PDF.js on application start
 * Call this from your main app component
 */
export function initializePdfJs(): void {
  if (typeof window !== 'undefined') {
    // Configure on next tick to ensure DOM is ready
    setTimeout(configurePdfJs, 0);
  }
}

export { pdfjsLib };
