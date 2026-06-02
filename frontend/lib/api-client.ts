/**
 * Utility to resolve API endpoints dynamically.
 * In a split production architecture:
 * - Vercel Frontend calls NEXT_PUBLIC_API_URL (Render backend)
 * - Otherwise falls back to relative API route lines for local/monolithic environments
 */
export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  return path;
}
