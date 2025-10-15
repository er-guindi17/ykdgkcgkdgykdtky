import React from 'react';

const InitialState: React.FC = () => {
  const examples = [
    { icon: "🎤", text: "Hazme una playlist con temas de 'JC Reyes' y 'Luar La L'" },
    { icon: "🔥", text: "Crea una playlist inspirada en 'Luar La L'" },
    { icon: "🎧", text: "Haz una mezcla con temas tipo 'ROA'" },
    { icon: "⚡", text: "Quiero canciones que suenen como 'JC Reyes'" },
  ];

  return (
    <div className="text-center p-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl animate-fade-in-up shadow-xl">
      <div className="mb-6">
        <div className="inline-block p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full mb-4">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-200 mb-2">Tu próxima playlist favorita te espera</h3>
        <p className="text-gray-400">
          Usa el campo de arriba para decirle a la IA lo que te apetece.
        </p>
      </div>

      <div className="mt-8">
        <h4 className="font-semibold text-gray-300 mb-4 flex items-center justify-center gap-2">
          <span>💡</span>
          Algunas ideas para empezar
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {examples.map((ex, idx) => (
            <div
              key={ex.text}
              className="group relative bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-green-500/30 rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-default animate-fade-in-up shadow-lg hover:shadow-green-500/10"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              <div className="relative flex items-start gap-3 text-left">
                <span className="text-2xl flex-shrink-0">{ex.icon}</span>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {ex.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InitialState;