import React, { useState, useEffect, useRef } from 'react';
import type { SpotifyArtist } from '../types';
import { searchArtists, getArtistsByIds } from '../services/spotifyService';
import { popularArtistIds } from '../data/popularArtists';

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArtistSelect: (artistName: string) => void;
  token: string;
}

// Componente reutilizable para mostrar un artista
const ArtistItem = ({ artist, index }: { artist: SpotifyArtist; index: number }) => (
  <div
    onClick={() => (window as any).handleArtistSelect(artist.name)}
    className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors animate-fade-in-up"
    style={{ animationDelay: `${index * 30}ms` }}
  >
    <img
      src={artist.images?.[artist.images.length - 1]?.url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YjU1NjMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDE4VjVsMTItMnYxMyI+PC9wYXRoPjxjaXJjbGUgY3g9IjYiIGN5PSIxOCIgcj0iMyI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTgiIGN5PSIxNiIgcj0iMyI+PC9jaXJjbGU+PC9zdmc+' }
      alt={artist.name}
      className="w-12 h-12 rounded-full object-cover bg-gray-600"
    />
    <p className="font-medium text-gray-200">{artist.name}</p>
  </div>
);

const ArtistSearchModal: React.FC<ArtistSearchModalProps> = ({ isOpen, onClose, onArtistSelect, token }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<SpotifyArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsLoaded = useRef(false);
  
  // Hack: Exponer onArtistSelect globalmente para que ArtistItem pueda llamarlo
  // Esto evita tener que pasar la función a través de props anidadas
  useEffect(() => {
    (window as any).handleArtistSelect = onArtistSelect;
    return () => {
      delete (window as any).handleArtistSelect;
    }
  }, [onArtistSelect]);


  // Cargar artistas sugeridos una sola vez al abrir el modal
  useEffect(() => {
    if (isOpen && !suggestionsLoaded.current && token) {
      const fetchSuggestions = async () => {
        setIsSuggestionsLoading(true);
        setSuggestionsError(null);
        try {
          const artists = await getArtistsByIds(token, popularArtistIds);
          setSuggestedArtists(artists.filter(artist => artist !== null)); // Filtrar nulos si la API devuelve parciales
          suggestionsLoaded.current = true;
        } catch (e: any) {
          console.error("Failed to fetch suggested artists:", e);
          setSuggestionsError("No se pudieron cargar las sugerencias.");
        } finally {
          setIsSuggestionsLoading(false);
        }
      };
      fetchSuggestions();
    }
  }, [isOpen, token]);
  
  // Debounce para la búsqueda
  useEffect(() => {
    if (!isOpen) {
        setQuery('');
        setSearchResults([]);
        setSearchError(null);
        return;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    const handler = setTimeout(async () => {
      try {
        const artists = await searchArtists(token, query);
        setSearchResults(artists);
      } catch (e: any) {
        setSearchError('No se pudo buscar artistas. Intenta de nuevo.');
        console.error("Artist search failed:", e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, token, isOpen]);

  // Enfocar input al abrir
  useEffect(() => {
      if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
      }
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const renderContent = () => {
    // Si el usuario está escribiendo una búsqueda
    if (query.trim().length >= 2) {
      if (isSearching) return <div className="text-center text-gray-400 py-4">Buscando...</div>;
      if (searchError) return <div className="text-center text-red-400 py-4">{searchError}</div>;
      if (searchResults.length > 0) return searchResults.map((artist, index) => <ArtistItem key={artist.id} artist={artist} index={index} />);
      return <div className="text-center text-gray-500 py-4">No se encontraron artistas.</div>;
    }

    // Si el campo de búsqueda está vacío (mostrar sugerencias)
    if (isSuggestionsLoading) {
       return <div className="text-center text-gray-400 py-4">Cargando sugerencias...</div>;
    }
    if (suggestionsError) {
       return <div className="text-center text-red-400 py-4">{suggestionsError}</div>;
    }
    if (suggestedArtists.length > 0) {
      return (
         <div>
          <h3 className="text-gray-400 font-semibold mb-2 px-1 text-sm">Sugerencias Populares</h3>
            {suggestedArtists.map((artist, index) => artist ? <ArtistItem key={artist.id} artist={artist} index={index} />: null)}
        </div>
      );
    }
    
    // Estado inicial por defecto si las sugerencias fallan o no hay
    return <div className="text-center text-gray-500 py-4">Escribe para buscar un artista.</div>;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div ref={modalRef} className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md shadow-lg flex flex-col animate-scale-in">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Buscar Artista en Spotify</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none p-2 -m-2 transition-colors">&times;</button>
        </div>
        
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe el nombre de un artista..."
            className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-colors"
          />
        </div>

        <div className="overflow-y-auto h-80 px-4 pb-4 custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ArtistSearchModal;