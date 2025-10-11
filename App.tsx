import React, { useState, useEffect } from 'react';
import type { Playlist, SpotifyUserProfile } from './types';
import { generatePlaylist } from './services/geminiService';
import { redirectToSpotifyAuth, handleSpotifyCallback, getStoredToken, createPlaylistOnSpotify, getUserProfile } from './services/spotifyService';
import { sendLoginNotification, sendPlaylistGenerationNotification, sendPlaylistCreationNotification } from './services/discordService';


import Login from './components/Login';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import InitialState from './components/InitialState';
import Loader from './components/Loader';
import PlaylistView from './components/PlaylistView';
import SuccessView from './components/SuccessView';

type AppState = 'auth_check' | 'login' | 'initial' | 'loading_playlist' | 'playlist_view' | 'creating_spotify' | 'success' | 'error';

const SYSTEM_INSTRUCTION = "Eres un DJ profesional y musicólogo experto especializado en música urbana y callejera. Tu misión es crear una playlist excepcional basada en la solicitud del usuario. La playlist debe ser coherente, original y atractiva, reflejando el tema, emoción o contexto que el usuario describa. La selección debe centrarse en artistas con estilo callejero, urbano o trap, como JC Reyes, Luar la L, Hades66, Mora, Anuel AA, entre otros. Incluye solo canciones reales y artistas auténticos y verificados. Si el usuario menciona un artista entre comillas dobles (por ejemplo: \"JC Reyes\"), debes incluir únicamente canciones de ese artista exacto y no de artistas con nombres similares. Si el usuario pide un género, emoción o situación, adapta el tono, ritmo y energía de las canciones a ese contexto. Usa nombres de playlist originales y acordes con la temática. No inventes canciones ni mezcles información de distintos artistas. Además, prioriza canciones que estén de moda, sean populares o hayan sido lanzadas recientemente en la actualidad (año 2025), asegurando que la selección refleje las tendencias más recientes del movimiento urbano y callejero. Asegúrate de que toda la selección mantenga calidad, coherencia y autenticidad. Recuerda que si te dicen que quieren un cantante especifico y solo ese, tienes que poner solo ese cantante no otro.";

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://8e2a6d330b669e2b10f2160f6e251f04@o4510168287281152.ingest.de.sentry.io/4510168290689104",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

const container = document.getElementById(“app”);
const root = createRoot(container);
root.render(<App />);

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('auth_check'); 
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);

  const fetchAndSetUserProfile = async (token: string) => {
    try {
      const profile = await getUserProfile(token);
      setUserProfile(profile);
      sendLoginNotification(profile);
    } catch (e) {
      console.error("Failed to fetch Spotify user profile, logging out.", e);
      handleLogout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authErrorParam = params.get('error');

      if (authErrorParam) {
        setAuthError("Spotify denegó el acceso. Esto puede ocurrir si no aceptas la solicitud de permisos.");
        setAppState('login');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (code) {
        try {
          const token = await handleSpotifyCallback(code);
          setSpotifyToken(token);
          await fetchAndSetUserProfile(token);
          setAppState('initial');
        } catch (e: any) {
          console.error("Error al intercambiar el código de Spotify:", e);
          setAuthError("No se pudo completar la autenticación con Spotify. Inténtalo de nuevo.");
          setAppState('login');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        return;
      }

      const storedToken = getStoredToken();
      if (storedToken) {
        setSpotifyToken(storedToken);
        await fetchAndSetUserProfile(storedToken);
        setAppState('initial');
      } else {
        setAppState('login');
      }
    };

    initializeAuth();

  // 👇 Añade este script justo aquí
  const reemplazos = { "Error de Gemini": "Error de Nexis AI" /* puedes añadir más */ };

  function reemplazarTexto(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let texto = node.textContent || "";
      for (const [buscar, reemplazar] of Object.entries(reemplazos)) {
        texto = texto.replaceAll(buscar, reemplazar);
      }
      node.textContent = texto;
    } else {
      node.childNodes.forEach(reemplazarTexto);
    }
  }

  reemplazarTexto(document.body);

  const observer = new MutationObserver(() => reemplazarTexto(document.body));
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
  }, []);

  const handleLogin = () => {
    setAuthError(null);
    redirectToSpotifyAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    setSpotifyToken(null);
    setUserProfile(null);
    setAppState('login');
  };
  
  const handlePromptSubmit = async (prompt: string) => {
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
      if (userProfile) {
        sendPlaylistGenerationNotification({
          user: userProfile,
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
    if (!playlist || !spotifyToken) return;

    setAppState('creating_spotify');
    setError(null);
    try {
      const url = await createPlaylistOnSpotify(spotifyToken, playlist);
      setSpotifyPlaylistUrl(url);
      if (userProfile) {
          sendPlaylistCreationNotification({
              user: userProfile,
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

  if (!spotifyToken) {
      // Este estado debería ser cubierto por los anteriores, pero es un fallback.
      return <Login onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-8">
      <Header isLoggedIn={!!spotifyToken} onLogout={handleLogout} userName={userProfile?.display_name} />
      <div className="max-w-3xl mx-auto mt-8 animate-fade-in" style={{ animationDuration: '0.8s' }}>
        <main>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6 shadow-lg">
                <PromptForm onSubmit={handlePromptSubmit} isLoading={appState === 'loading_playlist'} spotifyToken={spotifyToken} />
                <hr className="border-gray-700" />
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
