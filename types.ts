
export enum GameStatus {
  LOBBY = 'LOBBY',
  ADDING_SONGS = 'ADDING_SONGS',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum RoundStatus {
  COUNTDOWN = 'COUNTDOWN',
  PLAYING_CLIP = 'PLAYING_CLIP',
  ANSWERING = 'ANSWERING',
  REVEAL = 'REVEAL'
}

export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  score: number;
  ready: boolean;
  songsContributed: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  albumArt: string;
  ownerId: string;
}

export interface GameSettings {
  clipDuration: 3 | 4 | 5;
  answerTime: 8 | 10 | 12;
  numRounds: number;
  flexibleMode: boolean;
  artistRequired: boolean;
}

export interface Answer {
  playerId: string;
  text: string;
  isCorrect: boolean;
  isArtistCorrect: boolean;
  responseTime: number;
}

export interface RoomState {
  code: string;
  status: GameStatus;
  settings: GameSettings;
  players: Player[];
  trackPool: Track[];
  currentRound: number;
  roundStatus: RoundStatus;
  activeTrack: Track | null;
  roundAnswers: Answer[];
}
