import React from 'react';
import SpotifyIcon from './icons/SpotifyIcon';

interface LoginProps {
  onLogin: () => void;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
            Generador de Playlists con IA
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Convierte tus ideas en playlists de Spotify perfectamente seleccionadas.
          </p>
          <p className="mt-2 text-gray-500">
            Conecta tu cuenta de Spotify para empezar.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
            <p className="font-semibold">Error de Autenticación</p>
            <p className="mt-1 text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={onLogin}
          className="w-full inline-flex items-center justify-center gap-3 bg-[#1DB954] hover:bg-[#1ED760] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
        >
          <SpotifyIcon />
          Conectar con Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;