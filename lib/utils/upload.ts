import { instructorApi } from '../api/instructor';

/**
 * Utility to upload an image and return the URL.
 * Currently uses the course thumbnail endpoint as a proxy for 'generic' uploads 
 * if a specific standalone upload endpoint is not available.
 * 
 * @param courseId The course ID (needed for current backend requirement)
 * @param file The file to upload
 * @returns Promise<string> The uploaded image URL
 */
export const uploadImage = async (courseId: string, file: File): Promise<string> => {
    const response = await instructorApi.uploadThumbnail(courseId, file);
    return response.thumbnail as string; // Based on Course return type in backend
};
