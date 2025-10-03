export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3069').replace(/\/$/, '');

export function resolveUrl(path: string): string {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.replace(/^\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };


