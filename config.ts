// --- CONFIGURACIÓN DE CLAVES ---
// Para desarrollo local, reemplaza los siguientes valores con tus propias claves.
// Para producción (Vercel), la aplicación usará automáticamente las variables de entorno.
export const API_KEY = process.env.API_KEY || 'AIzaSyBbVozJ3ADuP34BmiBXCMSITYfNdpDd4EA';
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'f99639a42c1d4868ae0dd5ba0c14c060';


// --- (Requerido) Configuración de Verificación de Discord ---
// Rellena estos valores para activar la verificación de servidor. Sin ellos, nadie podrá usar la app.
// 1. DISCORD_CLIENT_ID: Crea una App en https://discord.com/developers/applications -> OAuth2 -> General -> Client ID
// 2. DISCORD_GUILD_ID: Activa el Modo Desarrollador en Discord (Ajustes > Avanzado), luego haz clic derecho en tu servidor -> Copiar ID del servidor
// 3. DISCORD_INVITE_URL: Crea un enlace de invitación permanente para tu servidor.
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1412026180470571100'; 
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1412114615634231499';
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL || 'https://discord.gg/AA8ZbjwGkc';


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
 * La URI de redirección para la autenticación de Spotify y Discord.
 * IMPORTANTE: Esta URL DEBE estar en la lista blanca de "Redirect URIs"
 * en la configuración de tu aplicación en los paneles de desarrollador correspondientes.
 * Para esta aplicación, debe ser: https://nexis-playlists.vercel.app/
 */
export const REDIRECT_URI = 'https://nexis-playlists.vercel.app/';
export const SPOTIFY_SCOPES = "playlist-modify-public playlist-modify-private";
