import React, { useState, useEffect } from 'react';
import type { Playlist, SpotifyUserProfile, DiscordUserProfile } from './types';
import { generatePlaylist } from './services/geminiService';
import { redirectToSpotifyAuth, handleSpotifyCallback, getStoredToken, createPlaylistOnSpotify, getUserProfile } from './services/spotifyService';
import { redirectToDiscordAuth, handleDiscordCallback, getDiscordStoredToken, getDiscordUserProfile, checkGuildMembership } from './services/discordApiService';
import { sendLoginNotification, sendPlaylistGenerationNotification, sendPlaylistCreationNotification } from './services/discordService';
import { DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from './config';

import Login from './components/Login';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import InitialState from './components/InitialState';
import Loader from './components/Loader';
import PlaylistView from './components/PlaylistView';
import SuccessView from './components/SuccessView';
import DiscordVerification from './components/DiscordVerification';

type AppState = 'auth_check' | 'login' | 'discord_verify' | 'initial' | 'loading_playlist' | 'playlist_view' | 'creating_spotify' | 'success' | 'error';

const SYSTEM_INSTRUCTION = "Eres un experto DJ y musicólogo. Tu tarea es crear una playlist excepcional basada en la petición del usuario. Debes seguir todas las reglas de formato de salida JSON. Sé creativo con los nombres y descripciones de las playlists. La selección de canciones debe ser diversa pero coherente con el tema. Asegúrate de que las canciones existan realmente y sean de los artistas correctos. REGLA IMPORTANTE: Si un nombre de artista en el prompt del usuario está entre comillas dobles (por ejemplo, \"JC Reyes\"), DEBES usar canciones de ESE artista exacto. No uses artistas con nombres similares.";

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [discordToken, setDiscordToken] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('auth_check'); 
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const [discordProfile, setDiscordProfile] = useState<DiscordUserProfile | null>(null);
  const [isVerifiedMember, setIsVerifiedMember] = useState(false);
  
  const performDiscordVerification = async (token: string, spotifyProfile: SpotifyUserProfile) => {
    try {
        const profile = await getDiscordUserProfile(token);
        setDiscordProfile(profile);
        const isMember = await checkGuildMembership(token, DISCORD_GUILD_ID);
        
        if (isMember) {
            setIsVerifiedMember(true);
            setAppState('initial');
            sendLoginNotification(spotifyProfile, profile);
        } else {
            setIsVerifiedMember(false);
            setAppState('discord_verify');
        }
    } catch (e) {
        console.error("Error en la verificación de Discord", e);
        handleDiscordLogout();
        setAppState('discord_verify');
    }
  };


  useEffect(() => {
    const initializeAuth = async () => {
      // --- Handlers de Callback ---
      const spotifyParams = new URLSearchParams(window.location.search);
      const spotifyCode = spotifyParams.get('code');
      const authErrorParam = spotifyParams.get('error');
      
      const discordHashParams = new URLSearchParams(window.location.hash.substring(1));
      const discordAccessToken = discordHashParams.get('access_token');
      
      // Limpiar URL después de leer los parámetros
      if (spotifyCode || authErrorParam || discordAccessToken) {
          window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (authErrorParam) {
        setAuthError("Spotify denegó el acceso. Esto puede ocurrir si no aceptas la solicitud de permisos.");
        setAppState('login');
        return;
      }

      if (spotifyCode) {
        try {
          const token = await handleSpotifyCallback(spotifyCode);
          setSpotifyToken(token);
          const profile = await getUserProfile(token);
          setUserProfile(profile);
          // Ahora, proceder a la verificación de Discord
          const storedDiscordToken = getDiscordStoredToken();
          if (storedDiscordToken) {
              setDiscordToken(storedDiscordToken);
              await performDiscordVerification(storedDiscordToken, profile);
          } else {
              setAppState('discord_verify');
          }
        } catch (e: any) {
          console.error("Error al procesar el callback de Spotify:", e);
          setAuthError("No se pudo completar la autenticación con Spotify. Inténtalo de nuevo.");
          setAppState('login');
        }
        return;
      }
      
      if (discordAccessToken) {
          handleDiscordCallback(discordAccessToken);
          setDiscordToken(discordAccessToken);
          const storedSpotifyToken = getStoredToken();
          if (storedSpotifyToken) {
              const profile = await getUserProfile(storedSpotifyToken);
              setUserProfile(profile);
              await performDiscordVerification(discordAccessToken, profile);
          } else {
              // Si no hay token de spotify, algo va mal. Volver al login.
              handleLogout();
          }
          return;
      }

      // --- Verificación de tokens almacenados ---
      const storedSpotifyToken = getStoredToken();
      if (storedSpotifyToken) {
        setSpotifyToken(storedSpotifyToken);
        const profile = await getUserProfile(storedSpotifyToken);
        setUserProfile(profile);
        
        const storedDiscordToken = getDiscordStoredToken();
        if (storedDiscordToken) {
            setDiscordToken(storedDiscordToken);
            await performDiscordVerification(storedDiscordToken, profile);
        } else {
            setAppState('discord_verify');
        }
      } else {
        setAppState('login');
      }
    };

    if (!DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
        setError("La aplicación no está configurada correctamente. Falta el ID de cliente o de servidor de Discord.");
        setAppState('error');
        return;
    }
    initializeAuth();
  }, []);

  const handleLogin = () => {
    setAuthError(null);
    redirectToSpotifyAuth();
  };

  const handleDiscordLogout = () => {
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_token_expiry');
    setDiscordToken(null);
    setDiscordProfile(null);
    setIsVerifiedMember(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    setSpotifyToken(null);
    setUserProfile(null);
    handleDiscordLogout();
    setAppState('login');
  };
  
  const handlePromptSubmit = async (prompt: string) => {
    if (!isVerifiedMember) {
        setAppState('discord_verify');
        return;
    }
    if (!prompt.trim()) {
        setError("Por favor, introduce una descripción para tu playlist.");
        setAppState('error');
        return;
    }
    setLastPrompt(prompt);
    setAppState('loading_playlist');
    setError(null);
    setPlaylist(null);
    try {
      const generatedPlaylist = await generatePlaylist(prompt, SYSTEM_INSTRUCTION);
      setPlaylist(generatedPlaylist);
      if (userProfile && discordProfile) {
        sendPlaylistGenerationNotification({
          user: userProfile,
          discordUser: discordProfile,
          prompt: prompt,
          playlist: generatedPlaylist,
        });
      }
      setAppState('playlist_view');
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error desconocido.');
      setAppState('error');
    }
  };

  const handleCreateSpotifyPlaylist = async () => {
    if (!playlist || !spotifyToken || !isVerifiedMember) return;

    setAppState('creating_spotify');
    setError(null);
    try {
      const url = await createPlaylistOnSpotify(spotifyToken, playlist);
      setSpotifyPlaylistUrl(url);
      if (userProfile && discordProfile) {
          sendPlaylistCreationNotification({
              user: userProfile,
              discordUser: discordProfile,
              playlist: playlist,
              playlistUrl: url
          });
      }
      setAppState('success');
    } catch (e: any) {
      if (e.message.includes('token expired') || e.message.includes('inválido')) {
          handleLogout();
          return;
      }
      setError(e.message || 'No se pudo crear la playlist en Spotify.');
      setAppState('error');
    }
  };

  const handleRegenerate = () => {
      handlePromptSubmit(lastPrompt);
  };

  const handleReset = () => {
    setPlaylist(null);
    setLastPrompt('');
    setSpotifyPlaylistUrl('');
    setError(null);
    setAppState('initial');
  };
  
  const renderContent = () => {
    switch(appState) {
        case 'loading_playlist':
            return <Loader message="Generando tu playlist... La IA está pensando." />;
        case 'initial':
            return <InitialState />;
        case 'playlist_view':
            return playlist ? <PlaylistView playlist={playlist} onCreateSpotify={handleCreateSpotifyPlaylist} onRegenerate={handleRegenerate} isLoading={false} /> : <InitialState />;
        case 'creating_spotify':
            return playlist ? <PlaylistView playlist={playlist} onCreateSpotify={() => {}} onRegenerate={() => {}} isLoading={true} /> : <Loader message="Creando playlist en Spotify..." />;
        case 'success':
            return <SuccessView playlistName={playlist?.playlistName || 'Tu Playlist'} playlistUrl={spotifyPlaylistUrl} onReset={handleReset} />;
        case 'error':
            return (
                <div className="text-center p-8 bg-red-900/30 border border-red-700 rounded-xl animate-scale-in">
                    <h3 className="text-2xl font-bold text-red-300">¡Ups! Algo salió mal</h3>
                    <p className="mt-2 text-red-400">{error}</p>
                    <button onClick={handleReset} className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Intentar de Nuevo
                    </button>
                </div>
            );
        default:
            return <InitialState />;
    }
  };
  
  if (appState === 'auth_check') {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <Loader message="Verificando autenticación..." />
        </div>
    );
  }

  if (appState === 'login') {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  if (appState === 'discord_verify') {
    return <DiscordVerification 
        onConnect={redirectToDiscordAuth} 
        onCheck={() => userProfile && discordToken && performDiscordVerification(discordToken, userProfile)}
        isMember={isVerifiedMember}
    />;
  }

  if (!spotifyToken || !isVerifiedMember) {
      return <Login onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8">
      <Header 
        isLoggedIn={!!spotifyToken} 
        onLogout={handleLogout} 
        userName={userProfile?.display_name}
        discordUserName={discordProfile?.username} 
      />
      <div className="max-w-3xl mx-auto mt-8 animate-fade-in" style={{ animationDuration: '0.8s' }}>
        <main>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6 shadow-lg">
                <PromptForm 
                    onSubmit={handlePromptSubmit} 
                    isLoading={appState === 'loading_playlist'} 
                    spotifyToken={spotifyToken} 
                    isVerified={isVerifiedMember}
                />
                <hr className="border-gray-700" />
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
