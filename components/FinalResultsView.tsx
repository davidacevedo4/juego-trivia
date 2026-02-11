
import React from 'react';
import { RoomState } from '../types';
import { Trophy, Home, RotateCcw, Medal } from 'lucide-react';

interface Props {
  room: RoomState;
  onRestart: () => void;
}

export const FinalResultsView: React.FC<Props> = ({ room, onRestart }) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex-1 flex flex-col py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-30 animate-pulse"></div>
          <Trophy className="text-yellow-500 relative" size={120} />
          <div className="absolute -top-4 -right-4 bg-white text-slate-950 w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shadow-xl">
            1
          </div>
        </div>
        <h2 className="text-4xl font-black mb-1 italic">¡VICTORIA PARA!</h2>
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 uppercase tracking-tighter">
          {winner?.nickname}
        </p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 border border-white/5 flex-1 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Tabla de Clasificación</h3>
        
        <div className="space-y-2">
          {sortedPlayers.map((player, idx) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50 scale-105 my-2 shadow-lg shadow-yellow-900/10' : 'bg-slate-950 border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  idx === 0 ? 'bg-yellow-500 text-slate-950' : 
                  idx === 1 ? 'bg-slate-300 text-slate-950' : 
                  idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-black text-lg">{player.nickname}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{player.songsContributed.length} canciones aportadas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-400">{player.score}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">PUNTOS</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button 
          onClick={onRestart}
          className="bg-purple-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-900/20"
        >
          <RotateCcw size={20} /> REPETIR
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-800 text-slate-300 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
        >
          <Home size={20} /> INICIO
        </button>
      </div>
    </div>
  );
};
