import * as pdfjsLib from 'pdfjs-dist';

let isConfigured = false;

export function configurePdfJs(): void {
  if (isConfigured || typeof window === 'undefined') return;

  try {
    // Set the worker source
    // @ts-ignore
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

export function getPdfLoadingOptions() {
  return {
    // Only pass the URL when loading the document
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

export function initializePdfJs(): void {
  if (typeof window !== 'undefined') {
    setTimeout(configurePdfJs, 0);
  }
}

export { pdfjsLib };
