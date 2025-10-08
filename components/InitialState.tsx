import React from 'react';

const InitialState: React.FC = () => {
  const examples = [
    "Hazme una playlist con temas de 'JC Reyes' y 'Luar La L'",
    "Crea una playlist inspirada en 'Luar La L'",
    "Haz una mezcla con temas tipo 'ROA'",
    "Quiero canciones que suenen como 'JC Reyes'",
  ];

  return (
    <div className="text-center p-8 bg-gray-800/30 border border-dashed border-gray-700 rounded-xl animate-fade-in-up">
      <h3 className="text-2xl font-bold text-gray-300">Tu próxima playlist favorita te espera</h3>
      <p className="mt-2 text-gray-500">
        Usa el campo de arriba para decirle a la IA lo que te apetece.
      </p>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-400">Algunas ideas para empezar:</h4>
        <ul className="mt-3 space-y-2 text-gray-500">
          {examples.map(ex => <li key={ex}>"{ex}"</li>)}
        </ul>
      </div>
    </div>
  );
};

export default InitialState;