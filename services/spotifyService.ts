import { REDIRECT_URI, SPOTIFY_SCOPES, SPOTIFY_CLIENT_ID } from '../config';
import type { Playlist, Song, SpotifyArtist, SpotifyUserProfile } from '../types';

// --- Funciones para el flujo de autenticación PKCE ---

// 1. Generar un `code_verifier` aleatorio
function generateCodeVerifier(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// 2. Generar el `code_challenge` a partir del verifier
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Lógica de Autenticación Principal ---

export async function redirectToSpotifyAuth() {
  // La comprobación de la clave de cliente ahora se realiza en App.tsx.
  
  const verifier = generateCodeVerifier(128);
  sessionStorage.setItem('spotify_code_verifier', verifier);
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('response_type', 'code');
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', SPOTIFY_SCOPES);
  params.append('code_challenge_method', 'S256');
  params.append('code_challenge', challenge);
  params.append('show_dialog', 'true');

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback(code: string): Promise<string> {
    const verifier = sessionStorage.getItem('spotify_code_verifier');
    if (!verifier) {
        throw new Error("No se encontró el 'code_verifier' de Spotify. El proceso de autenticación ha fallado.");
    }

    const params = new URLSearchParams();
    params.append('client_id', SPOTIFY_CLIENT_ID);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', verifier);

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });

    const { access_token, expires_in } = await result.json();
    if (!access_token) {
        throw new Error("No se pudo obtener el token de acceso de Spotify.");
    }
    
    // Fix: Used `expires_in` which is destructured from the API response, instead of `expiresIn`.
    const expiryTime = new Date().getTime() + expires_in * 1000;
    localStorage.setItem('spotify_token', access_token);
    localStorage.setItem('spotify_token_expiry', expiryTime.toString());
    sessionStorage.removeItem('spotify_code_verifier');
    
    return access_token;
}


export function getStoredToken(): string | null {
    const token = localStorage.getItem('spotify_token');
    const expiry = localStorage.getItem('spotify_token_expiry');

    if (token && expiry && new Date().getTime() < parseInt(expiry, 10)) {
        return token;
    }
    
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    return null;
}


// --- Funciones de la API de Spotify ---

async function spotifyApiFetch(endpoint: string, token: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido de la API de Spotify' }));
        console.error('Spotify API Error:', errorData);
        if (response.status === 401) {
            throw new Error('El token de acceso de Spotify es inválido o ha expirado.');
        }
        throw new Error(errorData.error?.message || 'Falló la petición a la API de Spotify.');
    }
    
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    return response.json();
}

export async function searchArtists(token: string, query: string): Promise<SpotifyArtist[]> {
    if (!query.trim()) {
        return [];
    }
    const endpoint = `/search?q=${encodeURIComponent(query)}&type=artist&limit=10`;
    const data = await spotifyApiFetch(endpoint, token);
    return data.artists?.items || [];
}

export async function getArtistsByIds(token: string, ids: string[]): Promise<SpotifyArtist[]> {
    if (ids.length === 0) {
        return [];
    }
    const endpoint = `/artists?ids=${ids.join(',')}`;
    const data = await spotifyApiFetch(endpoint, token);
    return data.artists || [];
}

export async function getUserProfile(token: string): Promise<SpotifyUserProfile> {
    const profile = await spotifyApiFetch('/me', token);
    return profile;
}

async function findTrackUri(token: string, song: Song): Promise<string | null> {
    const searchAndGetUri = async (query: string) => {
        const endpoint = `/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
        const data = await spotifyApiFetch(endpoint, token);
        return data.tracks?.items?.[0]?.uri || null;
    };

    // Limpia los strings para eliminar caracteres que puedan interferir con la sintaxis de búsqueda de Spotify.
    const clean = (str: string) => str.replace(/["'()]/g, '');

    const cleanedTitle = clean(song.title);
    const cleanedArtist = clean(song.artist);
    const cleanedAlbum = clean(song.album);
    
    // Intento 1: Búsqueda altamente específica con campos de canción, artista y álbum.
    // Es la que tiene más probabilidades de obtener una coincidencia exacta.
    let query1 = `track:"${cleanedTitle}" artist:"${cleanedArtist}" album:"${cleanedAlbum}"`;
    let uri = await searchAndGetUri(query1);
    if (uri) return uri;

    // Intento 2: Menos específica, sin el álbum. Los nombres de los álbumes a menudo pueden variar (p. ej., ediciones de lujo).
    let query2 = `track:"${cleanedTitle}" artist:"${cleanedArtist}"`;
    uri = await searchAndGetUri(query2);
    if (uri) return uri;
    
    // Intento 3: Búsqueda amplia usando palabras clave. Esto puede ayudar si las búsquedas por campos específicos son demasiado restrictivas
    // o si la IA incluye información extra (p. ej., "feat. Artista").
    let query3 = `${cleanedTitle} ${cleanedArtist}`;
    uri = await searchAndGetUri(query3);
    if (uri) return uri;

    console.warn(`No se pudo encontrar URI para la canción: ${song.title} - ${song.artist}`);
    return null;
}

async function createPlaylist(token: string, userId: string, name: string, description: string): Promise<{id: string; url: string}> {
    const data = await spotifyApiFetch(`/users/${userId}/playlists`, token, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description,
            public: false,
        }),
    });
    return { id: data.id, url: data.external_urls.spotify };
}

async function addTracksToPlaylist(token:string, playlistId: string, trackUris: string[]): Promise<void> {
    for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);
        await spotifyApiFetch(`/playlists/${playlistId}/tracks`, token, {
            method: 'POST',
            body: JSON.stringify({ uris: chunk }),
        });
    }
}

export async function createPlaylistOnSpotify(token: string, playlistData: Playlist): Promise<string> {
    const userProfile = await getUserProfile(token);
    const userId = userProfile.id;
    
    const { id: playlistId, url: playlistUrl } = await createPlaylist(token, userId, playlistData.playlistName, playlistData.description);
    
    const trackUris: string[] = [];
    for (const song of playlistData.songs) {
        const uri = await findTrackUri(token, song);
        if (uri) {
            trackUris.push(uri);
        }
    }

    if (trackUris.length === 0) {
        console.warn("No se encontraron canciones en Spotify para la lista proporcionada.");
        // Devuelve la URL de la playlist vacía para que el usuario al menos la tenga.
        return playlistUrl;
    }

    await addTracksToPlaylist(token, playlistId, trackUris);
    
    return playlistUrl;
}
