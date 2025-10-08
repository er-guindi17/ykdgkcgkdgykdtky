import { GoogleGenAI, Type } from "@google/genai";
import type { Playlist } from '../types';
import { API_KEY } from '../config';

const playlistSchema = {
  type: Type.OBJECT,
  properties: {
    playlistName: {
      type: Type.STRING,
      description: "Un nombre creativo y apropiado para la playlist, de menos de 50 caracteres."
    },
    description: {
      type: Type.STRING,
      description: "Una descripción breve (1-2 frases) del ambiente y tema de la playlist."
    },
    songs: {
      type: Type.ARRAY,
      description: "Lista de canciones. REGLA CRÍTICA: A menos que el usuario especifique un número exacto de canciones en su petición, esta lista DEBE contener un MÍNIMO ABSOLUTO de 15 canciones y un máximo de 50. No cumplir esta regla es un error. Si el usuario pide un número, la lista debe contener EXACTAMENTE esa cantidad.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "El título de la canción." },
          artist: { type: Type.STRING, description: "El nombre del artista o banda." },
          album: { type: Type.STRING, description: "El nombre del álbum del que proviene la canción." }
        },
        required: ["title", "artist", "album"]
      }
    }
  },
  required: ["playlistName", "description", "songs"]
};

export async function generatePlaylist(prompt: string, systemInstruction: string): Promise<Playlist> {
  // La comprobación de la clave de API se realiza ahora en App.tsx
  // antes de que se pueda llamar a esta función.
    
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `El usuario ha pedido una playlist. Sigue tus reglas de sistema y genera el JSON para este prompt: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: playlistSchema,
      },
    });

    const jsonText = response.text?.trim();
     if (!jsonText) {
        throw new Error("La IA no devolvió ninguna respuesta. Esto puede ocurrir si el modelo está sobrecargado. Inténtalo de nuevo más tarde.");
    }

    let playlistData: Playlist;
    try {
        playlistData = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", jsonText);
        throw new Error("La IA devolvió una respuesta con formato incorrecto. Inténtalo de nuevo.");
    }
    
    if (!playlistData.playlistName || !playlistData.songs || playlistData.songs.length === 0) {
        throw new Error("La IA devolvió datos de playlist incompletos.");
    }

    return playlistData;

  } catch (error) {
    console.error("Error generating playlist with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("La clave de API de Gemini no es válida. Revisa la clave en tu archivo config.ts o en las variables de entorno.");
        }
        throw new Error(`Error de Gemini: ${error.message}`);
    }
    throw new Error("Ocurrió un error desconocido al comunicarse con la API de Gemini.");
  }
}