import React from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, userName }) => {
  return (
    <header className="text-center relative">
       <div className="absolute top-0 right-0 animate-fade-in z-10 flex items-center gap-4">
        {isLoggedIn && userName && (
          <span className="text-gray-400 text-sm hidden sm:block">
            Hola, <span className="font-semibold text-gray-300">{userName}</span>
          </span>
        )}
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text pt-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        Generador de Playlists con IA
      </h1>
      <p className="mt-2 text-lg text-gray-400 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        Crea la playlist perfecta para cualquier momento.
      </p>
    </header>
  );
};

export default Header;
