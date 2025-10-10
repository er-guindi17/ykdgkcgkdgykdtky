import { DISCORD_WEBHOOK_URL } from '../config';
import type { Playlist, SpotifyUserProfile } from '../types';

/**
 * Sends a formatted payload to the Discord webhook URL.
 * Silently fails if the URL is not configured.
 * @param payload - The Discord webhook payload object.
 */
async function sendToWebhook(payload: object) {
  if (!DISCORD_WEBHOOK_URL) {
    return;
  }
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
  }
}

/**
 * Sends a notification when a user successfully logs in.
 * @param user - The Spotify user profile object.
 */
export function sendLoginNotification(user: SpotifyUserProfile) {
  const payload = {
    embeds: [
      {
        author: {
          name: `Usuario conectado: ${user.display_name}`,
          url: user.external_urls.spotify,
          icon_url: user.images?.[0]?.url || 'https://i.imgur.com/8VAlwRz.png',
        },
        color: 3447003, // Blue
        timestamp: new Date().toISOString(),
      },
    ],
  };
  sendToWebhook(payload);
}

interface PlaylistGenerationParams {
  user: SpotifyUserProfile;
  prompt: string;
  playlist: Playlist;
}

/**
 * Sends a notification when the AI generates a new playlist.
 * @param params - Object containing user, prompt, and playlist data.
 */
export function sendPlaylistGenerationNotification({ user, prompt, playlist }: PlaylistGenerationParams) {
  const payload = {
    embeds: [
      {
        author: {
          name: `${user.display_name} ha generado una playlist`,
          url: user.external_urls.spotify,
          icon_url: user.images?.[0]?.url || 'https://i.imgur.com/8VAlwRz.png',
        },
        title: playlist.playlistName,
        description: playlist.description,
        color: 5763719, // Green
        fields: [
          {
            name: 'Prompt del Usuario',
            value: `\`\`\`${prompt}\`\`\``,
          },
          {
            name: 'Nº de Canciones',
            value: playlist.songs.length.toString(),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
  sendToWebhook(payload);
}

interface PlaylistCreationParams {
  user: SpotifyUserProfile;
  playlist: Playlist;
  playlistUrl: string;
}

/**
 * Sends a notification when a user saves a playlist to their Spotify account.
 * @param params - Object containing user, playlist, and Spotify URL data.
 */
export function sendPlaylistCreationNotification({ user, playlist, playlistUrl }: PlaylistCreationParams) {
  const payload = {
    embeds: [
      {
        author: {
          name: `${user.display_name} ha creado la playlist en Spotify`,
          url: user.external_urls.spotify,
          icon_url: user.images?.[0]?.url || 'https://i.imgur.com/8VAlwRz.png',
        },
        title: `Escuchar "${playlist.playlistName}" en Spotify`,
        url: playlistUrl,
        description: `La playlist con **${playlist.songs.length} canciones** se ha guardado en la biblioteca del usuario.`,
        color: 1947988, // Spotify Green
        timestamp: new Date().toISOString(),
      },
    ],
  };
  sendToWebhook(payload);
}
