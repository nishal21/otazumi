export const Prox = (url: string) => {
    // If URL is already a data URL or relative, return as is
    if (!url || url.startsWith('data:') || url.startsWith('/')) {
        return url;
    }

    // If URL is empty or invalid, return placeholder
    if (!url || url === '' || url === 'null' || url === 'undefined') {
        return 'https://via.placeholder.com/300x400/374151/9ca3af?text=No+Image'
    }

    // Clean the URL
    const cleanUrl = url.trim();

    // If it's already a complete URL, try to proxy it
    if (cleanUrl.startsWith('http')) {
        try {
            // Use a more reliable proxy or fallback to direct URL
            return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=300&h=400&fit=cover&output=webp&q=80`;
        } catch {
            return cleanUrl;
        }
    }

    // For any other case, return placeholder
    return 'https://via.placeholder.com/300x400/374151/9ca3af?text=No+Image'
};