
import React, { useState } from 'react';
import { RoomState, Track, GameStatus } from '../types';
import { Search, Music, Plus, Check, Trash2, Loader2, Disc } from 'lucide-react';

interface Props {
  room: RoomState;
  currentPlayerId: string;
  onUpdate: (state: Partial<RoomState>) => void;
  spotifyToken: string | null;
}

export const AddSongsView: React.FC<Props> = ({ room, currentPlayerId, onUpdate, spotifyToken }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [mySongs, setMySongs] = useState<Track[]>([]);

  const searchSpotify = async () => {
    if (!searchTerm.trim() || !spotifyToken) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=12`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const data = await response.json();
      
      const tracks: Track[] = data.tracks.items
        .filter((item: any) => item.preview_url)
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists[0].name,
          previewUrl: item.preview_url,
          albumArt: item.album.images[0]?.url || '',
          ownerId: currentPlayerId
        }));
      setResults(tracks);
    } catch (error) {
      console.error("Spotify error", error);
      alert("Error buscando en Spotify.");
    } finally {
      setIsSearching(false);
    }
  };

  const addSong = (track: Track) => {
    if (mySongs.length >= 10) return;
    if (mySongs.find(s => s.id === track.id)) return;
    setMySongs([...mySongs, track]);
  };

  const removeSong = (id: string) => {
    setMySongs(mySongs.filter(s => s.id !== id));
  };

  const handleReady = () => {
    if (mySongs.length < 5) return;
    const updatedPlayers = room.players.map(p => p.id === currentPlayerId ? { ...p, ready: true, songsContributed: mySongs } : p);
    const allReady = updatedPlayers.every(p => p.ready);
    
    if (allReady) {
      onUpdate({
        players: updatedPlayers,
        trackPool: updatedPlayers.flatMap(p => p.songsContributed).sort(() => Math.random() - 0.5),
        status: GameStatus.PLAYING,
        currentRound: 1
      });
    } else {
      onUpdate({ players: updatedPlayers });
    }
  };

  const isReady = room.players.find(p => p.id === currentPlayerId)?.ready;

  if (isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-900/40">
          <Check size={48} className="text-slate-950" strokeWidth={4} />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white uppercase">¡Pool Listo!</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Esperando a los otros melómanos...</p>
        <div className="mt-12 w-full space-y-3">
           {room.players.map(p => (
             <div key={p.id} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="font-black text-sm uppercase tracking-tight">{p.nickname}</span>
                {p.ready ? <Check className="text-green-500" size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700 animate-spin border-t-green-500" />}
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
      <div className="px-6 py-4">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchSpotify()}
            placeholder="Busca en Spotify..."
            className="w-full bg-slate-900 border border-white/5 rounded-[1.5rem] pl-14 pr-6 py-5 text-lg font-black focus:ring-4 focus:ring-green-500/10 outline-none transition-all placeholder:text-slate-700"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-32">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Escaneando Spotify...</p>
          </div>
        ) : results.length > 0 ? (
          results.map(track => (
            <div key={track.id} onClick={() => addSong(track)} className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-white/5 active:scale-95 transition-transform group">
              <img src={track.albumArt} className="w-14 h-14 rounded-xl shadow-lg" alt="Cover" />
              <div className="flex-1 min-w-0">
                <p className="font-black truncate text-sm text-white">{track.title}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-tight">{track.artist}</p>
              </div>
              <div className="bg-green-500 p-2 rounded-xl text-black">
                <Plus size={20} strokeWidth={3} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Disc size={80} className="mb-6 animate-pulse" />
            <p className="font-black uppercase tracking-widest text-xs">Busca canciones de Spotify</p>
          </div>
        )}
      </div>

      {/* Floating Panel Inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/10 shadow-3xl">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Tus aportes ({mySongs.length}/10)</h3>
             <div className="bg-green-500 h-1 rounded-full transition-all duration-500" style={{ width: `${(mySongs.length/5)*100}%`, maxWidth: '100px' }}></div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
            {mySongs.map(t => (
              <div key={t.id} className="relative flex-shrink-0">
                <img src={t.albumArt} className="w-16 h-16 rounded-2xl border border-white/10" alt="Art" />
                <button onClick={() => removeSong(t.id)} className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full border-4 border-slate-900">
                  <Trash2 size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - mySongs.length) }).map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-black/40 border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-800">
                <Music size={24} />
              </div>
            ))}
          </div>

          <button 
            onClick={handleReady}
            disabled={mySongs.length < 5}
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-lg btn-active disabled:opacity-20"
          >
            {mySongs.length < 5 ? `Faltan ${5-mySongs.length}` : 'ESTOY LISTO'}
          </button>
        </div>
      </div>
    </div>
  );
};
