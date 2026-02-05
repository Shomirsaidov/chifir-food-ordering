import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Using placeholder values.')
}

// Use placeholder values if not configured (for development without Supabase)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

export const supabase = createClient(url, key, {
    auth: {
        persistSession: false, // Telegram Mini Apps handle auth differently
    },
})

/**
 * Upload image to Supabase Storage with compression
 * @param file - The image file to upload
 * @param bucket - Storage bucket name (default: 'menu-images')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
    file,
    bucket = 'menu-images'
) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (uploadError) {
        throw uploadError
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
}

/**
 * Delete image from Supabase Storage
 * @param url - Public URL of the image
 * @param bucket - Storage bucket name (default: 'menu-images')
 */
export async function deleteImage(
    url,
    bucket = 'menu-images'
) {
    // Extract file path from public URL
    const urlParts = url.split(`/${bucket}/`)
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
        console.error('Error deleting image:', error)
    }
}
