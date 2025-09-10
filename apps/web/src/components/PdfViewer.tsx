'use client';

import { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { configurePdfJs, getPdfLoadingOptions, pdfjsLib } from '@/lib/pdfjs-config';

interface PdfViewerProps {
  file: File | string;
  onLoadComplete?: (numPages: number) => void;
}

export default function PdfViewer({ file, onLoadComplete }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const pdfUrlRef = useRef<string | null>(null);

  // Load the PDF document when the file changes
  useEffect(() => {
    // Ensure PDF.js is configured before use
    configurePdfJs();
    
    // Create a flag to track if the component is still mounted
    let isMounted = true;
    
    const loadPdf = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);

        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        // Cancel any ongoing loading task
        if (loadingTaskRef.current) {
          try {
            await loadingTaskRef.current.destroy();
          } catch (e) {
            console.log('Error destroying previous loading task:', e);
          }
          loadingTaskRef.current = null;
        }

        // Revoke previous object URL if it exists
        if (pdfUrlRef.current && typeof file !== 'string') {
          URL.revokeObjectURL(pdfUrlRef.current);
          pdfUrlRef.current = null;
        }

        let pdfUrl: string;
        if (typeof file === 'string') {
          pdfUrl = file;
        } else {
          pdfUrl = URL.createObjectURL(file);
          pdfUrlRef.current = pdfUrl; // Store for cleanup
        }

        // Load the PDF document with proper configuration
        const loadingOptions = {
          url: pdfUrl,
          ...getPdfLoadingOptions(),
        };
        const loadingTask = pdfjsLib.getDocument(loadingOptions);
        loadingTaskRef.current = loadingTask;
        
        try {
          const pdf = await loadingTask.promise;
          
          if (!isMounted) {
            // If component unmounted during loading, clean up and return
            pdf.destroy();
            return;
          }
          
          loadingTaskRef.current = null;
          
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setCurrentPage(1);
          
          if (onLoadComplete) {
            onLoadComplete(pdf.numPages);
          }
        } catch (err) {
          if (!isMounted) return;
          console.error('Error loading PDF:', err);
          setError('Failed to load PDF. Please try again.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in PDF loading process:', err);
        setError('Failed to load PDF. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (file) {
      loadPdf();
    }

    // Cleanup function to revoke object URL and cancel any pending tasks
    return () => {
      isMounted = false;
      
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          console.log('Error canceling render task:', e);
        }
        renderTaskRef.current = null;
      }
      
      // Cancel any ongoing loading task
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch (e) {
          console.log('Error destroying loading task:', e);
        }
        loadingTaskRef.current = null;
      }
      
      // Clean up PDF document
      if (pdfDoc) {
        try {
          pdfDoc.destroy();
        } catch (e) {
          console.log('Error destroying PDF document:', e);
        }
      }
      
      // Revoke object URL
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [file, onLoadComplete]);

  // Render the current page when page or scale changes
  useEffect(() => {
    // Create a flag to track if the component is still mounted
    let isMounted = true;
    
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || !isMounted) return;

      try {
        // Cancel any ongoing render task first
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        // Get the page
        const page = await pdfDoc.getPage(currentPage);
        
        if (!isMounted) return;
        
        // Set the viewport with the current scale
        const viewport = page.getViewport({ scale });

        // Prepare canvas for rendering
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        // Set canvas dimensions to match the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Store the render task reference so we can cancel it if needed
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        try {
          await renderTask.promise;
          if (isMounted) {
            renderTaskRef.current = null; // Clear the reference after successful render
          }
        } catch (err) {
          if (!isMounted) return;
          
          // Only show error if it's not a cancelled render task
          if (err && (err as any).name !== 'RenderingCancelledException') {
            console.error('Error rendering page:', err);
            setError('Failed to render page. Please try again.');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in render process:', err);
        setError('Failed to render page. Please try again.');
      }
    };

    renderPage();

    // Cleanup function to cancel render task when dependencies change
    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          console.log('Error canceling render task in cleanup:', e);
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale]); // Re-render when any of these change

  // Navigation functions
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Zoom functions - fixed to ensure proper scaling
  const zoomIn = () => {
    setScale((prevScale) => {
      const newScale = Math.min(prevScale + 0.2, 3.0);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale - 0.2, 0.5);
      return newScale;
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading PDF...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded-md">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevPage} 
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPage} 
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto border rounded-md p-4 flex justify-center">
        <canvas ref={canvasRef} className="shadow-md" />
      </div>
    </div>
  );
}