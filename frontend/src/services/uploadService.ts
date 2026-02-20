// Upload Service using Supabase Storage
import { supabase } from '@/lib/supabase';

export const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Image upload failed:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
};

// Delete image from storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/);

    if (pathMatch) {
        const filePath = pathMatch[1];
        const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);

        if (error) {
            console.error('Image delete failed:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }
};
