import React from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, userName }) => {
  return (
    <header className="text-center relative">
       <div className="absolute top-0 right-0 animate-fade-in z-10 flex items-center gap-3">
        {isLoggedIn && userName && (
          <div className="hidden sm:flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-sm font-medium">{userName}</span>
          </div>
        )}
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="group relative bg-gray-800/60 backdrop-blur-sm hover:bg-red-600/90 border border-gray-700/50 hover:border-red-600/50 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 text-sm shadow-lg hover:shadow-red-600/20 transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Cerrar Sesión</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
      </div>
      <div className="relative inline-block">
        <div className="absolute -inset-4 bg-gradient-to-r from-green-400 via-blue-500 to-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <h1 className="relative text-5xl sm:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-500 text-transparent bg-clip-text pt-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Generador de Playlists con IA
        </h1>
      </div>
      <p className="mt-4 text-lg text-gray-400 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '200ms' }}>
        Crea la playlist perfecta para cualquier momento con el poder de la inteligencia artificial.
      </p>
    </header>
  );
};

export default Header;
