
import React, { useState, useRef } from 'react';
import MagicIcon from './icons/MagicIcon';
import UserIcon from './icons/UserIcon';
import ArtistSearchModal from './ArtistSearchModal';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  spotifyToken: string | null;
  isVerified: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading, spotifyToken, isVerified }) => {
  const [prompt, setPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-300">
            Describe el ambiente de tu playlist...
          </label>
           <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading || !spotifyToken || !isVerified}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <UserIcon />
            @ Artistas
          </button>
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Quiero una playlist con música tipo 'JC Reyes'"
            className="w-full h-28 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading || !isVerified}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !isVerified}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <MagicIcon />
              Generar Playlist
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
