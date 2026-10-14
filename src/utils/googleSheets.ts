import { defaultGoogleSheetUrl } from '../config/sheetConfig';

const GOOGLE_SHEET_STORAGE_KEY = 'decision_quiz_google_sheet_url';

/**
 * Normalizes any Google Sheets URL into a direct, live CSV export URL.
 * Handles:
 * - Standard share links: https://docs.google.com/spreadsheets/d/{ID}/edit... -> /export?format=csv
 * - Published to web links: https://docs.google.com/spreadsheets/d/e/{ID}/pub... -> /pub?output=csv
 * - Direct export links: preserves and adds cache-busting
 */
export function normalizeGoogleSheetsUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    // 1. Published to web link (pub?output=csv or pubhtml)
    if (trimmed.includes('/pub')) {
      const base = trimmed.split('?')[0];
      return `${base}?output=csv&t=${Date.now()}`;
    }

    // 2. Standard Google Sheets URL (https://docs.google.com/spreadsheets/d/{SHEET_ID}/...)
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];

      // Extract gid if specific sheet tab is selected
      const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}&t=${Date.now()}`;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Gets saved Google Sheet URL from localStorage, URL params, or config
 */
export function getStoredGoogleSheetUrl(): string {
  try {
    if (typeof window !== 'undefined') {
      // 1. Check URL parameters (?sheet=... or ?sheet_url=...)
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('sheet') || params.get('sheet_url');
      if (fromUrl) return fromUrl;

      // 2. Check localStorage
      const saved = localStorage.getItem(GOOGLE_SHEET_STORAGE_KEY);
      if (saved && saved.trim()) return saved.trim();
    }
  } catch {
    // Fallback
  }

  // 3. Fallback to default in sheetConfig.ts
  return defaultGoogleSheetUrl || '';
}

/**
 * Saves or clears Google Sheet URL in localStorage
 */
export function saveStoredGoogleSheetUrl(url: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (url.trim()) {
        localStorage.setItem(GOOGLE_SHEET_STORAGE_KEY, url.trim());
      } else {
        localStorage.removeItem(GOOGLE_SHEET_STORAGE_KEY);
      }
    }
  } catch (err) {
    console.error('Failed to save Google Sheet URL:', err);
  }
}

/**
 * Fetches live CSV data from a Google Sheet with cache-busting
 */
export async function fetchLiveGoogleSheetCSV(rawUrl: string): Promise<string | null> {
  const normalized = normalizeGoogleSheetsUrl(rawUrl);
  if (!normalized) return null;

  try {
    const response = await fetch(normalized, {
      cache: 'no-store',
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const text = await response.text();
      // Ensure it returned actual CSV data, not a Google sign-in HTML page
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error(
          'Google Sheet is private. Please set sharing to "Anyone with the link can view" or use "File > Share > Publish to web".'
        );
      }
      return text;
    }
  } catch (err) {
    console.warn('Failed to fetch from Google Sheets:', err);
    throw err;
  }
  return null;
}
