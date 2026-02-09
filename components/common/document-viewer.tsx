'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface DocumentViewerProps {
    lessonId: string;
    pageCount: number; // Provided by backend metadata
    title?: string;
    className?: string;
}

/**
 * SECURITY: Secure Document Viewer
 * - Fetches pages as blobs via Authorization header (no token in URL)
 * - Uses URL.createObjectURL for display
 * - Strictly cleans up blob URLs on page change and unmount
 */
export function DocumentViewer({ lessonId, pageCount, title, className = '' }: DocumentViewerProps) {
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    
    // Ref to track the current blob URL for cleanup
    const currentBlobUrlRef = useRef<string | null>(null);

    /**
     * SECURITY: Cleanup function to revoke blob URLs
     * Prevents memory leaks and ensures blob URLs are not reusable
     */
    const cleanupBlobUrl = useCallback(() => {
        if (currentBlobUrlRef.current) {
            URL.revokeObjectURL(currentBlobUrlRef.current);
            currentBlobUrlRef.current = null;
        }
    }, []);

    /**
     * SECURITY: Fetch page as blob with Authorization header
     * No token exposure in URL
     */
    const fetchPage = useCallback(async (pageNum: number) => {
        // Cleanup previous blob URL before fetching new one
        cleanupBlobUrl();
        
        setIsLoading(true);
        setError(null);
        setBlobUrl(null);

        try {
            const blob = await apiClient.getBlob(
                `/lessons/${lessonId}/pages/${pageNum}`,
                { abortKey: `document-page-${lessonId}` }
            );
            
            // Create new blob URL
            const url = URL.createObjectURL(blob);
            currentBlobUrlRef.current = url;
            setBlobUrl(url);
            setIsLoading(false);
        } catch (err) {
            // Don't show error for aborted requests
            if (err instanceof Error && err.name === 'CanceledError') {
                return;
            }
            console.error('Failed to fetch document page:', err);
            setError('Failed to load page. Please try refreshing.');
            setIsLoading(false);
        }
    }, [lessonId, cleanupBlobUrl]);

    // Fetch page when page number or lesson changes
    useEffect(() => {
        fetchPage(page);
    }, [page, fetchPage]);

    // Reset to page 1 when lesson changes
    useEffect(() => {
        setPage(1);
    }, [lessonId]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            cleanupBlobUrl();
            // Also abort any pending requests
            apiClient.abortRequest(`document-page-${lessonId}`);
        };
    }, [lessonId, cleanupBlobUrl]);

    const handleNext = () => {
        if (page < pageCount) {
            setPage(p => p + 1);
            // Scroll to top of viewer
            document.getElementById('doc-viewer-container')?.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (page > 1) {
            setPage(p => p - 1);
            document.getElementById('doc-viewer-container')?.scrollTo(0, 0);
        }
    };

    return (
        <div id="doc-viewer-container" className={`relative bg-slate-900 flex flex-col items-center min-h-[500px] select-none ${className}`}>
             {/* Toolbar */}
             <div className="w-full bg-slate-800 p-2 flex items-center justify-between text-white text-sm sticky top-0 z-10 shadow-md">
                <span className="font-medium px-4 truncate max-w-[200px]">{title || 'Document'}</span>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePrev} 
                        disabled={page <= 1}
                        className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span>{page} / {pageCount || '?'}</span>
                    <button 
                        onClick={handleNext} 
                        disabled={page >= pageCount}
                        className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 w-full flex justify-center p-4 overflow-y-auto relative">
                 {isLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20">
                         <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                     </div>
                 )}
                 
                 {error ? (
                     <div className="flex flex-col items-center justify-center text-red-400 gap-2 h-full">
                         <AlertTriangle className="h-8 w-8" />
                         <p>{error}</p>
                     </div>
                 ) : blobUrl ? (
                     <div className="relative shadow-xl max-w-4xl w-full bg-white min-h-[600px]">
                         {/* Watermark Overlay (Frontend Deterrence) */}
                         <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] text-black font-bold text-lg rotate-[-45deg] flex flex-wrap content-center justify-center gap-24 overflow-hidden select-none">
                             {Array.from({ length: 40 }).map((_, i) => (
                                 <span key={i}>PROTECTED CONTENT</span>
                             ))}
                         </div>
                         
                         {/* Page Image - SECURITY: Using blob URL, not raw URL with token */}
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img 
                            src={blobUrl} 
                            alt={`Page ${page}`}
                            className="w-full h-auto block"
                            onContextMenu={(e) => e.preventDefault()} // UX Friction (Contract 10)
                            draggable={false}
                         />
                     </div>
                 ) : null}
             </div>
        </div>
    );
}
