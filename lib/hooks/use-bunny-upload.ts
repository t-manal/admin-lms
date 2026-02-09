'use client';

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

/**
 * BUNNY STREAM DIRECT UPLOAD HOOK
 * 
 * This hook handles direct video uploads to Bunny Stream CDN.
 * Videos go directly from the browser to Bunny - never touching Railway.
 * 
 * Flow:
 * 1. Get upload credentials from our backend
 * 2. PUT video binary directly to Bunny's upload URL
 * 3. Track progress for UI feedback
 * 4. Bunny processes video and sends webhook to our backend
 */

export interface BunnyUploadCredentials {
    videoId: string;
    authorizationSignature: string;
    expirationTime: number;
    libraryId: string;
    uploadUrl: string;
    tusEndpoint: string;
}

export interface BunnyUploadProgress {
    status: 'idle' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
    progress: number; // 0-100
    videoId: string | null;
    error: string | null;
}

export interface UseBunnyUploadOptions {
    onProgress?: (progress: BunnyUploadProgress) => void;
    onComplete?: (videoId: string) => void;
    onError?: (error: string) => void;
}

export function useBunnyUpload(options: UseBunnyUploadOptions = {}) {
    const [uploadState, setUploadState] = useState<BunnyUploadProgress>({
        status: 'idle',
        progress: 0,
        videoId: null,
        error: null
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Update state and trigger callbacks
     */
    const updateState = useCallback((update: Partial<BunnyUploadProgress>) => {
        setUploadState(prev => {
            const newState = { ...prev, ...update };
            options.onProgress?.(newState);
            return newState;
        });
    }, [options]);

    /**
     * Get upload credentials from our backend
     */
    const getCredentials = async (title: string, partLessonId?: string): Promise<BunnyUploadCredentials> => {
        const params = new URLSearchParams({ title });
        if (partLessonId) {
            params.append('partLessonId', partLessonId);
        }

        // apiClient.get already unwraps ApiResponse.data, so we get BunnyUploadCredentials directly
        return apiClient.get<BunnyUploadCredentials>(
            `/uploads/bunny/prepare?${params.toString()}`
        );
    };

    /**
     * Upload file directly to Bunny Stream
     */
    const uploadToBunny = async (
        file: File, 
        credentials: BunnyUploadCredentials,
        signal: AbortSignal
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    updateState({ progress });
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            // Handle AbortController signal
            signal.addEventListener('abort', () => {
                xhr.abort();
            });

            // Open connection to Bunny
            xhr.open('PUT', credentials.uploadUrl, true);

            // Set required headers for Bunny upload
            xhr.setRequestHeader('AuthorizationSignature', credentials.authorizationSignature);
            xhr.setRequestHeader('AuthorizationExpire', credentials.expirationTime.toString());
            xhr.setRequestHeader('VideoId', credentials.videoId);
            xhr.setRequestHeader('LibraryId', credentials.libraryId);

            // Send the file
            xhr.send(file);
        });
    };

    /**
     * Main upload function
     * 
     * @param file - Video file to upload
     * @param title - Video title (shown in Bunny dashboard)
     * @param partLessonId - Optional: Link to PartLesson for webhook matching
     */
    const upload = useCallback(async (
        file: File, 
        title: string, 
        partLessonId?: string
    ): Promise<string | null> => {
        // Cleanup previous abort controller
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        try {
            // Step 1: Prepare
            updateState({ 
                status: 'preparing', 
                progress: 0, 
                videoId: null, 
                error: null 
            });

            const credentials = await getCredentials(title, partLessonId);
            
            updateState({ 
                status: 'uploading', 
                videoId: credentials.videoId 
            });

            // Step 2: Upload directly to Bunny
            await uploadToBunny(file, credentials, abortControllerRef.current.signal);

            // Step 3: Mark as processing (Bunny will send webhook when done)
            updateState({ 
                status: 'processing', 
                progress: 100 
            });

            // After a short delay, mark as complete
            // The actual encoding status will come via webhook
            setTimeout(() => {
                updateState({ status: 'complete' });
                options.onComplete?.(credentials.videoId);
            }, 1000);

            return credentials.videoId;

        } catch (error: any) {
            const errorMessage = error.message || 'Upload failed';
            updateState({ 
                status: 'error', 
                error: errorMessage,
                progress: 0
            });
            options.onError?.(errorMessage);
            return null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateState, options]);

    /**
     * Cancel an in-progress upload
     */
    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
        updateState({ 
            status: 'idle', 
            progress: 0, 
            videoId: null,
            error: null 
        });
    }, [updateState]);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        abortControllerRef.current?.abort();
        setUploadState({
            status: 'idle',
            progress: 0,
            videoId: null,
            error: null
        });
    }, []);

    return {
        upload,
        cancel,
        reset,
        ...uploadState,
        isUploading: uploadState.status === 'uploading' || uploadState.status === 'preparing',
        isProcessing: uploadState.status === 'processing',
        isComplete: uploadState.status === 'complete',
        isError: uploadState.status === 'error'
    };
}
