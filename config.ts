// --- CONFIGURACIÓN DE CLAVES ---
// Para desarrollo local, reemplaza los siguientes valores con tus propias claves.
// Para producción (Vercel), la aplicación usará automáticamente las variables de entorno.
export const API_KEY = process.env.API_KEY || 'AIzaSyBbVozJ3ADuP34BmiBXCMSITYfNdpDd4EA';
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'f99639a42c1d4868ae0dd5ba0c14c060';


// --- (Opcional) Configuración de Webhook de Discord ---
// ADVERTENCIA: Exponer una URL de webhook en una aplicación de cliente (frontend)
// es un RIESGO DE SEGURIDAD. Cualquiera puede encontrar la URL en el código
// fuente de tu web y enviarle peticiones no deseadas (spam).
// Para producción, se recomienda encarecidamente usar una función de servidor
// (serverless function) como intermediario.
// Si entiendes el riesgo, pega tu URL aquí. Si se deja en blanco, esta función se desactivará.
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1425564352995397825/AuY7UXM_JPePXJCC8Fwukjw5JSBEwYijNX_QcGo4XUJn2LtpgVJoseUjKj_RYMyjN8nL';


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
