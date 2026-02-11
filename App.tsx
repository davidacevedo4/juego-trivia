
import React, { useState, useEffect } from 'react';
import { GameStatus, RoomState, Player, GameSettings, RoundStatus } from './types';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { AddSongsView } from './components/AddSongsView';
import { GameLoopView } from './components/GameLoopView';
import { FinalResultsView } from './components/FinalResultsView';
import { Disc3, Users } from 'lucide-react';

const App: React.FC = () => {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('tune_guess_player_id');
    if (savedId) {
      setCurrentPlayerId(savedId);
    } else {
      const newId = `p-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tune_guess_player_id', newId);
      setCurrentPlayerId(newId);
    }

    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        setSpotifyToken(token);
        window.history.pushState("", document.title, window.location.pathname);
      }
    }
  }, []);

  const createRoom = (nickname: string, settings: GameSettings) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host: Player = {
      id: currentPlayerId,
      nickname,
      isHost: true,
      score: 0,
      ready: false,
      songsContributed: []
    };
    
    setRoom({
      code,
      status: GameStatus.LOBBY,
      settings,
      players: [host],
      trackPool: [],
      currentRound: 0,
      roundStatus: RoundStatus.COUNTDOWN,
      activeTrack: null,
      roundAnswers: []
    });
  };

  const joinRoom = (code: string, nickname: string) => {
    if (code === 'DEMO12' || code.length === 6) {
       createRoom(nickname, {
         clipDuration: 3,
         answerTime: 10,
         numRounds: 10,
         flexibleMode: true,
         artistRequired: false
       });
    } else {
      alert("Sala no encontrada. Usa un código de 6 letras o 'DEMO12'.");
    }
  };

  const updateRoom = (newState: Partial<RoomState>) => {
    setRoom(prev => prev ? ({ ...prev, ...newState }) : null);
  };

  if (!room) {
    return <HomeView onCreate={createRoom} onJoin={joinRoom} spotifyToken={spotifyToken} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 overflow-hidden shadow-2xl">
      <header className="flex justify-between items-center px-6 py-5 bg-slate-900/50 border-b border-white/5 pt-10">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-xl">
            <Disc3 className="text-green-500 animate-spin-slow" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">BeatReto</h1>
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Spotify Edition</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <span className="text-xs font-black tracking-widest">{room.code}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 mt-1">
            <Users size={12} />
            <span className="text-[10px] font-bold">{room.players.length} JUGADORES</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {room.status === GameStatus.LOBBY && (
          <LobbyView room={room} currentPlayerId={currentPlayerId} onUpdate={updateRoom} />
        )}
        {room.status === GameStatus.ADDING_SONGS && (
          <AddSongsView room={room} currentPlayerId={currentPlayerId} onUpdate={updateRoom} spotifyToken={spotifyToken} />
        )}
        {room.status === GameStatus.PLAYING && (
          <GameLoopView room={room} currentPlayerId={currentPlayerId} onUpdate={updateRoom} />
        )}
        {room.status === GameStatus.FINISHED && (
          <FinalResultsView room={room} onRestart={() => updateRoom({ status: GameStatus.LOBBY, trackPool: [], players: room.players.map(p => ({ ...p, score: 0, ready: false, songsContributed: [] })) })} />
        )}
      </main>
    </div>
  );
};

export default App;
