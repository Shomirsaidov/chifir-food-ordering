/**
 * Image helper utility for handling both internal and external images
 */

/**
 * Determines if an image location is an external URL
 * @param imageLoc - The image location string
 * @returns true if external URL, false if internal
 */
export function isExternalImage(imageLoc: string | null | undefined): boolean {
    if (!imageLoc) return false
    return imageLoc.startsWith('http://') || imageLoc.startsWith('https://')
}

/**
 * Gets the full image URL for rendering
 * @param imageLoc - The image location from database (URL or filename)
 * @returns Full URL or import path for the image
 */
export function getImageUrl(imageLoc: string | null | undefined): string | null {
    if (!imageLoc) return null

    // External URL - return as is
    if (isExternalImage(imageLoc)) {
        return imageLoc
    }

    // Internal image - construct path to assets
    try {
        // Use Vite's import.meta.glob for dynamic imports
        return new URL(`../assets/images/${imageLoc}`, import.meta.url).href
    } catch (error) {
        console.warn(`Failed to load internal image: ${imageLoc}`, error)
        return null
    }
}

/**
 * Preloads an image to check if it exists
 * @param imageLoc - The image location
 * @returns Promise that resolves to true if image loads successfully
 */
export async function validateImage(imageLoc: string | null | undefined): Promise<boolean> {
    const url = getImageUrl(imageLoc)
    if (!url) return false

    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
    })
}
