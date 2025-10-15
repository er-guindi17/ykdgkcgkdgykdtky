
import React, { useState, useRef } from 'react';
import MagicIcon from './icons/MagicIcon';
import UserIcon from './icons/UserIcon';
import ArtistSearchModal from './ArtistSearchModal';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  spotifyToken: string | null;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading, spotifyToken }) => {
  const [prompt, setPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  const handleArtistSelect = (artistName: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const artistText = `"${artistName}" `;
        
        const newPrompt = text.substring(0, start) + artistText + text.substring(end);
        setPrompt(newPrompt);

        // Retraso mínimo para permitir que React actualice el estado antes de enfocar
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + artistText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    } else {
        // Fallback si la referencia no está disponible
        setPrompt(prev => (prev.trim() ? `${prev.trim()} "${artistName}"` : `"${artistName}"`));
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-between items-center">
          <label htmlFor="prompt" className="block text-lg font-semibold text-gray-200 flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            Describe el ambiente de tu playlist...
          </label>
           <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading || !spotifyToken}
            className="group bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500 text-white font-semibold py-2 px-4 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-gray-600/20"
          >
            <UserIcon />
            @ Artistas
          </button>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-30 blur transition-opacity duration-300"></div>
          <textarea
            ref={textareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Quiero una playlist con música tipo 'JC Reyes'"
            className="relative w-full h-32 p-5 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 resize-none text-gray-200 placeholder-gray-500 shadow-inner"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none shadow-lg hover:shadow-green-600/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="relative z-10">Generando tu playlist...</span>
            </>
          ) : (
            <>
              <MagicIcon />
              <span className="relative z-10">Generar Playlist</span>
            </>
          )}
        </button>
      </form>
      {spotifyToken && (
        <ArtistSearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onArtistSelect={handleArtistSelect}
          token={spotifyToken}
        />
      )}
    </>
  );
};

export default PromptForm;
