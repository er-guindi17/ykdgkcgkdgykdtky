import { REDIRECT_URI, DISCORD_CLIENT_ID } from '../config';
import type { DiscordUserProfile } from '../types';

// --- Lógica de Autenticación de Discord (Implicit Grant) ---

export function redirectToDiscordAuth() {
  if (!DISCORD_CLIENT_ID) {
    throw new Error("El ID de cliente de Discord no está configurado.");
  }

  const params = new URLSearchParams();
  params.append('client_id', DISCORD_CLIENT_ID);
  params.append('response_type', 'token');
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', 'identify guilds');

  window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}


export function handleDiscordCallback(accessToken: string) {
    // El token tiene una validez de 7 días según la documentación de Discord.
    const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('discord_token', accessToken);
    localStorage.setItem('discord_token_expiry', expiryTime.toString());
}

export function getDiscordStoredToken(): string | null {
    const token = localStorage.getItem('discord_token');
    const expiry = localStorage.getItem('discord_token_expiry');

    if (token && expiry && new Date().getTime() < parseInt(expiry, 10)) {
        return token;
    }
    
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_token_expiry');
    return null;
}

// --- Funciones de la API de Discord ---

async function discordApiFetch(endpoint: string, token: string, options: RequestInit = {}) {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido de la API de Discord' }));
        console.error('Discord API Error:', errorData);
        if (response.status === 401) {
            throw new Error('El token de acceso de Discord es inválido o ha expirado.');
        }
        throw new Error(errorData.message || 'Falló la petición a la API de Discord.');
    }
    
    return response.json();
}

export async function getDiscordUserProfile(token: string): Promise<DiscordUserProfile> {
    const profile = await discordApiFetch('/users/@me', token);
    return profile;
}

export async function checkGuildMembership(token: string, guildId: string): Promise<boolean> {
    if (!guildId) {
        console.warn("No se ha proporcionado un ID de servidor de Discord para verificar.");
        return false;
    }
    const guilds = await discordApiFetch('/users/@me/guilds', token);
    return guilds.some((guild: { id: string }) => guild.id === guildId);
}
