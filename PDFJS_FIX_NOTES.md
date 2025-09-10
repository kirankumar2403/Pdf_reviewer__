# PDF.js Font Loading Issues - Resolution

## Problem
The application was showing these PDF.js warnings:
```
Warning: fetchStandardFontData: failed to fetch file "FoxitDingbats.pfb" with "UnknownErrorException: The standard font "baseUrl" parameter must be specified, ensure that the "standardFontDataUrl" API parameter is provided.".
Warning: Cannot load system font: ZapfDingbats, installing it could help to improve PDF rendering.
```

## Root Cause
1. PDF.js was trying to load standard fonts during server-side rendering (SSR)
2. The `standardFontDataUrl` parameter wasn't properly configured with a base URL
3. Font loading configuration was happening on both server and client sides

## Solution Implemented

### 1. Client-Side Only Configuration (`src/lib/pdfjs-config.ts`)
- Created a centralized PDF.js configuration utility
- Ensured configuration only runs on the client side (`typeof window !== 'undefined'`)
- Properly configured `standardFontDataUrl` to point to unpkg CDN

### 2. Updated PdfViewer Component (`src/components/PdfViewer.tsx`)
- Added `'use client'` directive to ensure client-side only execution
- Removed inline PDF.js configuration
- Import configuration from centralized utility
- Enhanced error handling for font loading failures

### 3. Improved Next.js Configuration (`next.config.js`)
- Added webpack rules for handling PDF.js worker files
- Added support for font file handling (.ttf, .otf, .eot, .woff, .woff2)
- Improved asset handling for PDF.js dependencies

### 4. Font Loading Options
The configuration now includes:
- `standardFontDataUrl`: Points to CDN-hosted standard fonts
- `disableFontFace: false`: Allows PDF.js to use web fonts
- `verbosity: 0`: Reduces console noise (errors only)
- `useSystemFonts: true`: Enables automatic font substitution

## Key Changes Made

### Before:
```typescript
// PDF.js configuration was inline and ran on both server and client
pdfjsLib.GlobalWorkerOptions.workerSrc = '...';
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = '...';
```

### After:
```typescript
// Centralized, client-side only configuration
import { configurePdfJs, getPdfLoadingOptions, pdfjsLib } from '@/lib/pdfjs-config';

// In component
useEffect(() => {
  configurePdfJs(); // Only runs on client
  // ... rest of PDF loading logic
}, []);
```

## Benefits
1. ✅ Eliminates font loading warnings
2. ✅ Prevents server-side PDF.js initialization issues
3. ✅ Improves PDF rendering with proper font fallbacks
4. ✅ Centralizes PDF.js configuration for better maintainability
5. ✅ Reduces console noise from PDF.js warnings

## Testing
After implementing these changes:
1. The font loading warnings should no longer appear
2. PDF rendering should work as before or better
3. No server-side errors related to PDF.js
4. Better font handling for PDFs with special characters

## Files Modified
- `src/components/PdfViewer.tsx` - Updated to use centralized config
- `src/lib/pdfjs-config.ts` - New centralized configuration utility
- `next.config.js` - Enhanced webpack configuration
- `PDFJS_FIX_NOTES.md` - This documentation file

## Usage
The PDF viewer component now automatically handles font loading issues and configures PDF.js properly. No additional setup is required from the consumer's perspective.
