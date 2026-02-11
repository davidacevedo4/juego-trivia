
import React, { useState, useEffect, useRef } from 'react';
import { RoomState, RoundStatus, Answer, GameStatus } from '../types';
import { Timer, Mic, Send, AlertTriangle, Disc, ArrowRight } from 'lucide-react';
import { validateAnswer } from '../utils/stringUtils';

interface Props {
  room: RoomState;
  currentPlayerId: string;
  onUpdate: (state: Partial<RoomState>) => void;
}

export const GameLoopView: React.FC<Props> = ({ room, currentPlayerId, onUpdate }) => {
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentTrack = room.trackPool[room.currentRound - 1];
  const isMyTrack = currentTrack?.ownerId === currentPlayerId;

  useEffect(() => {
    let interval: any;
    if (room.roundStatus === RoundStatus.COUNTDOWN) {
      setCountdown(3);
      setHasSubmitted(false);
      setAnswerText('');
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onUpdate({ roundStatus: RoundStatus.PLAYING_CLIP });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [room.roundStatus]);

  useEffect(() => {
    if (room.roundStatus === RoundStatus.PLAYING_CLIP && audioRef.current) {
      const clipStart = Math.random() * 20; 
      audioRef.current.currentTime = clipStart;
      audioRef.current.play().catch(() => {
          // Fallback if autoplay is blocked
          console.warn("Audio play blocked");
      });

      const timer = setTimeout(() => {
        audioRef.current?.pause();
        onUpdate({ roundStatus: RoundStatus.ANSWERING });
        setTimer(room.settings.answerTime);
      }, room.settings.clipDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [room.roundStatus]);

  useEffect(() => {
    if (room.roundStatus === RoundStatus.ANSWERING && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onUpdate({ roundStatus: RoundStatus.REVEAL });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [room.roundStatus, timer]);

  const handleSubmit = () => {
    if (hasSubmitted || isMyTrack) return;
    
    const isCorrect = validateAnswer(answerText, currentTrack.title, room.settings.flexibleMode);
    
    const newAnswer: Answer = {
      playerId: currentPlayerId,
      text: answerText,
      isCorrect,
      isArtistCorrect: false,
      responseTime: room.settings.answerTime - timer
    };

    if (isCorrect) {
      const bonus = timer > (room.settings.answerTime / 2) ? 0.5 : 0;
      const updatedPlayers = room.players.map(p => 
        p.id === currentPlayerId ? { ...p, score: p.score + 1 + bonus } : p
      );
      onUpdate({ 
        players: updatedPlayers,
        roundAnswers: [...room.roundAnswers, newAnswer] 
      });
    } else {
      onUpdate({ roundAnswers: [...room.roundAnswers, newAnswer] });
    }
    setHasSubmitted(true);
  };

  const nextRound = () => {
    if (room.currentRound < room.trackPool.length) {
      onUpdate({
        currentRound: room.currentRound + 1,
        roundStatus: RoundStatus.COUNTDOWN,
        roundAnswers: []
      });
    } else {
      onUpdate({ status: GameStatus.FINISHED });
    }
  };

  return (
    <div className="flex-1 flex flex-col py-4">
      <audio ref={audioRef} src={currentTrack?.previewUrl} preload="auto" />
      
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/5 font-black text-xs uppercase tracking-widest text-purple-400">
          Ronda {room.currentRound} / {room.trackPool.length}
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-white/5">
          <Timer className={timer < 4 ? "text-red-500 animate-pulse" : "text-slate-400"} size={16} />
          <span className="font-mono font-black text-xl text-white">{timer}s</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {room.roundStatus === RoundStatus.COUNTDOWN && (
          <div className="text-center scale-up-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Prepárate...</h3>
            <div className="text-9xl font-black italic text-purple-500 drop-shadow-2xl">{countdown}</div>
          </div>
        )}

        {room.roundStatus === RoundStatus.PLAYING_CLIP && (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
               <div className="absolute inset-0 bg-purple-500 blur-[80px] opacity-20 animate-pulse rounded-full"></div>
               <Disc className="text-purple-500 animate-spin-slow w-48 h-48 drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]" />
            </div>
            <p className="text-2xl font-black italic tracking-widest animate-pulse uppercase text-white">¡Escucha!</p>
          </div>
        )}

        {(room.roundStatus === RoundStatus.ANSWERING || room.roundStatus === RoundStatus.REVEAL) && (
          <div className="w-full max-w-sm px-4">
            {room.roundStatus === RoundStatus.REVEAL ? (
               <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
                  <div className="relative inline-block">
                    <img src={currentTrack.albumArt} className="w-52 h-52 rounded-[2rem] shadow-2xl border-4 border-white/10" alt="Album" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-1">{currentTrack.title}</h2>
                    <p className="text-xl text-purple-400 font-bold">{currentTrack.artist}</p>
                    <p className="text-[10px] text-slate-500 mt-4 font-black uppercase tracking-tighter">
                      Sugerida por: <span className="text-slate-300">{room.players.find(p => p.id === currentTrack.ownerId)?.nickname}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center py-4">
                     {room.roundAnswers.map((ans, i) => (
                       <div key={i} className={`px-4 py-1.5 rounded-2xl text-xs font-black border ${ans.isCorrect ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                         {room.players.find(p => p.id === ans.playerId)?.nickname} {ans.isCorrect ? '✓' : '✗'}
                       </div>
                     ))}
                  </div>

                  <button 
                    onClick={nextRound}
                    className="w-full bg-white text-slate-950 font-black py-4 rounded-3xl text-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl shadow-white/10"
                  >
                    CONTINUAR <ArrowRight size={24} />
                  </button>
               </div>
            ) : (
              <div className="space-y-6">
                {isMyTrack ? (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-[2.5rem] text-center space-y-4">
                     <AlertTriangle className="mx-auto text-yellow-500 animate-bounce" size={48} />
                     <h3 className="text-2xl font-black italic text-white uppercase">Tu Turno de Callar</h3>
                     <p className="text-sm text-yellow-500/70 font-bold uppercase tracking-widest">Es tu canción. Espera a que los demás fallen.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-full animate-pulse">
                        <Mic className="text-purple-500" size={40} />
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="text"
                        value={answerText}
                        onChange={e => setAnswerText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        disabled={hasSubmitted}
                        placeholder="Nombre de la canción..."
                        className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl px-6 py-6 text-xl font-black focus:border-purple-500 outline-none disabled:opacity-40 transition-all text-center placeholder:text-slate-700"
                        autoFocus
                      />
                      <button 
                        onClick={handleSubmit}
                        disabled={hasSubmitted || !answerText.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 p-4 rounded-2xl disabled:opacity-0 transition-opacity"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                    {hasSubmitted && (
                      <p className="text-center text-xs font-black text-slate-500 animate-pulse uppercase tracking-widest">Respuesta capturada...</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-4 px-2 no-scrollbar">
        {room.players.sort((a,b) => b.score - a.score).map((p, idx) => (
          <div key={p.id} className="flex-shrink-0 flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-2xl border border-white/5">
            <span className={`text-xs font-black ${idx === 0 ? 'text-yellow-500' : 'text-slate-500'}`}>#{idx+1}</span>
            <span className="text-sm font-bold text-white whitespace-nowrap">{p.nickname}</span>
            <span className="text-xs font-black bg-purple-600/30 text-purple-400 px-2 py-0.5 rounded-lg">{Math.floor(p.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
