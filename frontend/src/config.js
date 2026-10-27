/**
 * Configurarea aplicației frontend.
 *
 * Vite expune în cod DOAR variabilele de mediu care încep cu VITE_.
 * Pentru dezvoltare folosim valoarea implicită (backend-ul local din L2);
 * Pentru publicare (L9) setăm VITE_API_URL pe Vercel.
 */
export const API_URL = import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

// Imaginea afișată când o carte nu are copertă (fișier din /public)
export const PLACEHOLDER_IMAGE = '/book-placeholder.svg';