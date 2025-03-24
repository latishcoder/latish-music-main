export interface Song {
	_id: string;
	title: string;
	artist: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	mood: string; // Added mood property
	createdAt: string;
	updatedAt: string;
  }
  
  export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[]; // Uses the updated Song interface
  }
  
  export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
  }
  
  export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
  }
  
  export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
  }
  