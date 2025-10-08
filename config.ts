// --- CONFIGURACIÓN DE CLAVES ---
// Para desarrollo local, reemplaza los siguientes valores con tus propias claves.
// Para producción (Vercel), la aplicación usará automáticamente las variables de entorno.
export const API_KEY = process.env.API_KEY || 'AIzaSyBbVozJ3ADuP34BmiBXCMSITYfNdpDd4EA';
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'f99639a42c1d4868ae0dd5ba0c14c060';


// =================================================================================
// NO NECESITAS EDITAR NADA DEBAJO DE ESTA LÍNEA
// =================================================================================

/**
 * La URI de redirección para la autenticación de Spotify.
 * IMPORTANTE: Esta URL DEBE estar en la lista blanca de "Redirect URIs"
 * en la configuración de tu aplicación en el panel de desarrollador de Spotify.
 * Para esta aplicación, debe ser: https://nexis-playlists.vercel.app/
 */
export const REDIRECT_URI = 'https://nexis-playlists.vercel.app/';
export const SPOTIFY_SCOPES = "playlist-modify-public playlist-modify-private";