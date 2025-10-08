
export interface Song {
  title: string;
  artist: string;
  album: string;
}

export interface Playlist {
  playlistName: string;
  description: string;
  songs: Song[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
}
