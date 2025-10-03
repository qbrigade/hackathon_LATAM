import { PE_DISTRICTS } from '@common/data/geo';
import type { SupabaseClient } from '@supabase/supabase-js';

export const IS_TAURI = '__TAURI_INTERNALS__' in window;

/**
 * Formats a date-like type to a human-readable format used and loved by Peruanistas.
 */
export function formatDate(rawDate: number | string | Date) {
  const date = new Date(rawDate);

  let weekday = new Intl.DateTimeFormat(navigator.language, { weekday: 'short' }).format(date);
  const month = new Intl.DateTimeFormat(navigator.language, { month: 'short' }).format(date);
  const day = date.getDate();

  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const timeFormat = new Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);

  return `${weekday}, ${month} ${day} · ${timeFormat}`;
}

/**
 * Formats a date-like type to a human-readable format used and loved by Peruanistas.
 * Same as formatDate but with an alternative format
 */
export function formatDate2(rawDate: number | string | Date) {
  const date = new Date(rawDate);

  const month = new Intl.DateTimeFormat(navigator.language, { month: 'short' }).format(date);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

//Eliminar esto al reemplazar todos los usos de PE_DEPARTMENTS y PE_DISTRICTS
export function getDistrictsForDepartment(departmentCode: string) {
  return Object.entries(PE_DISTRICTS).filter(([, district]) => {
    return district.code.startsWith(departmentCode);
  });
}

/**
 * This function throws on upload errors with a supabase StorageEror
 */
export async function pushBlobToStorage(client: SupabaseClient, bucketname: string, file: File) {
  const filename = `public/${file.name}+${Date.now().toString()}`;

  const bucket_ret = await client.storage
    .from(bucketname)
    .upload(filename, file);

  if (bucket_ret.error) throw bucket_ret.error;

  const { data } = client.storage
    .from(bucketname)
    .getPublicUrl(filename);

  return data.publicUrl;
}

export function mergeAndShuffle<T>(a: T[], b: T[]): T[] {
  const merged = [...a, ...b];
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  return merged;
}

export function getRedirectURL() {
  let url = IS_TAURI ? 'https://peruanista.pe/' : import.meta.env.DEV ? 'http://localhost:5173/' : 'https://peruanista.pe/';
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};

// Re-export geo update tracker utilities
export {
  canUpdateGeoLocation,
  getDaysUntilNextGeoUpdate,
  getNextGeoUpdateDate,
} from './utils/geo_update_tracker';
