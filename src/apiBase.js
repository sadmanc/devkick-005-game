// Where the game's backend lives. Empty on the web (same origin as the page); the native app build
// sets VITE_API_BASE to the hosted site, because inside the app relative URLs hit the app's own files.
const base = (import.meta.env?.VITE_API_BASE || '').replace(/\/+$/, '');

export const apiUrl = (path) => (base ? `${base}/${path}` : path);
