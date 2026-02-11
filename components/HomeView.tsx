
import React, { useState } from 'react';
import { GameSettings } from '../types';
import { Play, Plus, Zap, Music, Wifi, AlertCircle } from 'lucide-react';

interface Props {
  onCreate: (nickname: string, settings: GameSettings) => void;
  onJoin: (code: string, nickname: string) => void;
  spotifyToken: string | null;
}

export const HomeView: React.FC<Props> = ({ onCreate, onJoin, spotifyToken }) => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [clipDuration, setClipDuration] = useState<3|4|5>(3);
  const [answerTime, setAnswerTime] = useState<8|10|12>(10);

  const loginSpotify = () => {
    // Client ID de ejemplo (para producción usa el tuyo)
    const clientId = '654a13e63967406691461975e5264b36';
    const redirectUri = window.location.origin + window.location.pathname;
    const scopes = 'user-read-private search';
    
    // Construir URL de auth
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
    
    window.location.href = authUrl;
  };

  const handleCreate = () => {
    if (!nickname) return alert("Ingresa un nickname");
    if (!spotifyToken) return alert("Primero conecta Spotify");
    onCreate(nickname, {
      clipDuration,
      answerTime,
      numRounds: 10,
      flexibleMode: true,
      artistRequired: false
    });
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col p-8 overflow-y-auto no-scrollbar">
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20"></div>
          <Zap className="absolute -top-8 -right-8 text-yellow-400 fill-yellow-400 animate-pulse" size={48} />
          <h1 className="text-7xl font-black tracking-tighter italic text-white leading-none">
            BEAT<span className="text-green-500">RETO</span>
          </h1>
          <p className="text-center text-slate-500 font-bold uppercase tracking-[0.3em] mt-4 text-[10px]">
            El desafío de los 3 segundos
          </p>
        </div>

        <div className="w-full max-w-xs space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Nickname</label>
            <input 
              type="text" 
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ej. Melómano99"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-lg font-black focus:ring-2 focus:ring-green-500/50 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          {!spotifyToken ? (
            <button 
              onClick={loginSpotify}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 btn-active shadow-2xl shadow-green-900/20"
            >
              <Music size={24} fill="black" /> CONECTAR SPOTIFY
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl py-3 px-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest text-center">Spotify Activo</span>
            </div>
          )}

          {!showCreate ? (
            <div className="space-y-4 pt-4">
              <input 
                type="text" 
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                placeholder="CÓDIGO SALA"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-center text-xl font-black tracking-[0.4em] uppercase focus:border-green-500 outline-none transition-all placeholder:text-slate-700"
              />
              <button 
                onClick={() => onJoin(roomCode, nickname)}
                className="w-full bg-white text-slate-950 rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-2 btn-active shadow-xl"
              >
                <Play fill="black" size={20} /> UNIRSE A PARTIDA
              </button>
              <button 
                onClick={() => setShowCreate(true)}
                className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                O CREAR SALA PROPIA
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border border-white/5 space-y-8 animate-in slide-in-from-bottom-10 duration-500">
              <h2 className="text-xl font-black text-center italic tracking-tight">AJUSTES DE RETO</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duración Clip</span>
                   <div className="flex bg-black p-1 rounded-xl">
                     {[3, 4, 5].map(v => (
                       <button key={v} onClick={() => setClipDuration(v as any)} className={`px-4 py-2 rounded-lg text-xs font-black ${clipDuration === v ? 'bg-green-500 text-black' : 'text-slate-500'}`}>{v}s</button>
                     ))}
                   </div>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiempo Respuesta</span>
                   <div className="flex bg-black p-1 rounded-xl">
                     {[8, 10, 12].map(v => (
                       <button key={v} onClick={() => setAnswerTime(v as any)} className={`px-4 py-2 rounded-lg text-xs font-black ${answerTime === v ? 'bg-green-500 text-black' : 'text-slate-500'}`}>{v}s</button>
                     ))}
                   </div>
                </div>
              </div>
              <button onClick={handleCreate} className="w-full bg-green-500 text-black font-black py-5 rounded-2xl text-lg btn-active">
                CREAR SALA
              </button>
              <button onClick={() => setShowCreate(false)} className="w-full text-slate-500 text-xs font-bold uppercase text-center block">Volver</button>
            </div>
          )}

          {/* Botón de Ayuda de Conexión */}
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-center gap-2 text-slate-700 hover:text-slate-500 transition-colors py-4"
          >
            <Wifi size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">¿Problemas de conexión en móvil?</span>
          </button>

          {showHelp && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in duration-200">
               <div className="flex items-start gap-2 text-red-400">
                 <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                 <p className="text-[10px] font-bold leading-tight uppercase">Si no puedes entrar desde el móvil:</p>
               </div>
               <ul className="text-[9px] text-slate-500 space-y-1 ml-6 list-disc font-medium">
                 <li>Asegúrate que móvil y PC están en la **misma red Wi-Fi**.</li>
                 <li>Usa la IP de tu PC (ej: `http://192.168.1.XX:5173`) no `localhost`.</li>
                 <li>Tu firewall de Windows/Mac debe permitir conexiones entrantes en ese puerto.</li>
                 <li>URL detectada actual: <code className="text-slate-300 break-all">{window.location.href}</code></li>
               </ul>
            </div>
          )}
        </div>
      </div>
      
      <footer className="text-center text-slate-800 pb-8 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest">BeatReto v1.0 • Android Optimizado</p>
      </footer>
    </div>
  );
};
