
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

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  images: { url: string; width: number; height: number }[];
  external_urls: { spotify: string };
}
