import React, { useState, useEffect } from 'react';
import DiscordIcon from './icons/DiscordIcon';
import { DISCORD_INVITE_URL } from '../config';
import Loader from './Loader';

interface DiscordVerificationProps {
  onConnect: () => void;
  onCheck: () => void;
  isMember: boolean;
}

const DiscordVerification: React.FC<DiscordVerificationProps> = ({ onConnect, onCheck, isMember }) => {
  const [status, setStatus] = useState<'initial' | 'checking' | 'not_in_server'>('initial');
  
  useEffect(() => {
    // Si el componente se renderiza y el usuario ya está verificado, no hacemos nada.
    // Si no es miembro, mostramos el mensaje para unirse.
    if (!isMember) {
      setStatus('not_in_server');
    }
  }, [isMember]);


  const handleCheck = () => {
    setStatus('checking');
    onCheck();
    // El estado de la app principal cambiará si la verificación es exitosa.
    // Si no, volverá a renderizar este componente y el useEffect pondrá el estado a 'not_in_server'.
  };

  const renderContent = () => {
    if (status === 'checking') {
        return <Loader message="Verificando membresía..." />;
    }
    
    // Si el token de discord existe pero no es miembro.
    if (status === 'not_in_server') {
        return (
            <>
                <div>
                    <h2 className="text-2xl font-bold text-gray-200">¡Casi listo!</h2>
                    <p className="mt-2 text-gray-400">
                        Parece que has conectado tu cuenta, pero aún no estás en nuestro servidor de Discord.
                    </p>
                     <p className="mt-2 text-gray-400">
                        Por favor, únete y luego haz clic en verificar.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                     <a
                        href={DISCORD_INVITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4f5bda] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 active:scale-100"
                    >
                        <DiscordIcon />
                        Unirse al Servidor
                    </a>
                    <button
                        onClick={handleCheck}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
                    >
                        Verificar de Nuevo
                    </button>
                </div>
            </>
        );
    }

    // Estado inicial: no se ha intentado conectar con discord.
    return (
        <>
            <div>
              <h2 className="text-2xl font-bold text-gray-200">Verificación Requerida</h2>
              <p className="mt-2 text-gray-400">
                Para generar playlists, necesitas ser miembro de nuestro servidor de Discord.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Esto nos ayuda a construir una comunidad y prevenir el abuso del servicio.
              </p>
            </div>
             <button
                onClick={onConnect}
                className="w-full inline-flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4f5bda] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 active:scale-100"
            >
                <DiscordIcon />
                Conectar con Discord
            </button>
        </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-8 animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default DiscordVerification;
