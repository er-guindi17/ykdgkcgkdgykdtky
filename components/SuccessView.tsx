import React from 'react';
import SpotifyIcon from './icons/SpotifyIcon';

interface SuccessViewProps {
  playlistName: string;
  playlistUrl: string;
  onReset: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ playlistName, playlistUrl, onReset }) => {
  const subtitleHtml = `"<span class="font-semibold text-white">${playlistName}</span>" ya está en tu biblioteca de Spotify.`;

  return (
    <div className="text-center p-8 bg-gray-800/50 border border-green-700 rounded-xl animate-scale-in">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-200">¡Playlist Creada!</h3>
      <p className="mt-2 text-lg text-gray-400" dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100"
        >
          <SpotifyIcon />
          Abrir en Spotify
        </a>
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          Crear Otra Playlist
        </button>
      </div>
    </div>
  );
};

export default SuccessView;