
import React from 'react';
import { RoomState, GameStatus } from '../types';
import { Users, Info, ArrowRight } from 'lucide-react';

interface Props {
  room: RoomState;
  currentPlayerId: string;
  onUpdate: (state: Partial<RoomState>) => void;
}

export const LobbyView: React.FC<Props> = ({ room, currentPlayerId, onUpdate }) => {
  const isHost = room.players.find(p => p.id === currentPlayerId)?.isHost;

  const handleStart = () => {
    onUpdate({ status: GameStatus.ADDING_SONGS });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center py-8">
        <h2 className="text-4xl font-black mb-2">Sala de Espera</h2>
        <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30">
          <span className="text-sm font-bold">CÓDIGO:</span>
          <span className="text-2xl font-black tracking-widest">{room.code}</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 border border-white/5 flex-1 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users size={20} className="text-purple-500" /> 
            Jugadores ({room.players.length})
          </h3>
          <span className="text-xs font-mono text-slate-500 italic">Mínimo 2 recomendado</span>
        </div>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-6">
          {room.players.map((player) => (
            <div key={player.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black">
                  {player.nickname[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{player.nickname} {player.id === currentPlayerId && <span className="text-purple-500">(Tú)</span>}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{player.isHost ? 'Host' : 'Jugador'}</p>
                </div>
              </div>
              {player.isHost && <div className="text-yellow-500 text-xs font-bold border border-yellow-500/30 px-2 py-0.5 rounded-full">★ Host</div>}
            </div>
          ))}
        </div>

        <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 mb-8">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-1">
            <Info size={14} /> Reglas de la Partida
          </h4>
          <ul className="text-sm space-y-2 text-slate-300">
            <li>• Cada uno aporta <strong className="text-white">5-10 canciones</strong>.</li>
            <li>• Fragmentos de <strong className="text-white">{room.settings.clipDuration} segundos</strong>.</li>
            <li>• <strong className="text-white">{room.settings.answerTime}s</strong> para responder.</li>
            <li>• No puntúas con tus propias canciones.</li>
          </ul>
        </div>

        {isHost ? (
          <button 
            onClick={handleStart}
            disabled={room.players.length < 1} // Change to 2 for production
            className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:scale-100"
          >
            SIGUIENTE: AGREGAR CANCIONES <ArrowRight size={20} />
          </button>
        ) : (
          <div className="text-center py-4 bg-purple-600/10 rounded-2xl border border-purple-500/20 text-purple-400 font-bold animate-pulse">
            Esperando a que el Host inicie...
          </div>
        )}
      </div>
    </div>
  );
};
