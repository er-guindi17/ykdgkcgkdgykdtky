import React from 'react';
import SpotifyIcon from './icons/SpotifyIcon';

interface LoginProps {
  onLogin: () => void;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-lg w-full text-center animate-fade-in-up">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl space-y-8">
          <div className="space-y-4">
            <div className="inline-block p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full mb-4 animate-scale-in">
              <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-500 text-transparent bg-clip-text animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Generador de Playlists con IA
            </h1>
            <p className="mt-4 text-lg text-gray-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Convierte tus ideas en playlists de Spotify perfectamente seleccionadas.
            </p>
            <p className="mt-2 text-gray-400 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              Conecta tu cuenta de Spotify para empezar.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 backdrop-blur-sm border border-red-700/50 text-red-300 p-4 rounded-xl text-sm animate-scale-in shadow-lg">
              <p className="font-semibold flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Error de Autenticación
              </p>
              <p className="mt-2 text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={onLogin}
            className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#1DB954] hover:bg-[#1ED760] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none shadow-2xl hover:shadow-green-500/30 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <SpotifyIcon />
            <span className="relative z-10">Conectar con Spotify</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Conexión segura con Spotify
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;