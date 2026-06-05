/**
 * Utility to resolve API endpoints dynamically.
 * In a split production architecture:
 * - Vercel Frontend calls NEXT_PUBLIC_API_URL (Render backend)
 * - Falls back to hardcoded Render URL for safety in production
 * - Uses relative paths only in local/monolithic dev environments
 */

// Hardcoded Render backend URL as production safety fallback.
// This guarantees image processing always goes to Render (which can handle
// long-running Sharp operations) instead of timing out on Vercel serverless.
const RENDER_BACKEND_URL = 'https://pixelflowai.onrender.com';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Prefer explicit env var (set this in Vercel dashboard)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const cleanBase = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return `${cleanBase}${cleanPath}`;
  }

  // 2. In browser production context (not localhost), use hardcoded Render URL
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return `${RENDER_BACKEND_URL}${cleanPath}`;
  }

  // 3. Local development: use relative path (Next.js route handlers)
  return cleanPath;
}

