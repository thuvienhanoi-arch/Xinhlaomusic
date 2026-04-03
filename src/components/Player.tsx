import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'motion/react';

interface PlayerProps {
  currentSong: any;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: any) => void;
  formatTime: (time: number) => string;
}

export default function Player({ 
  currentSong, isPlaying, progress, currentTime, duration, 
  togglePlay, nextSong, prevSong, handleSeek, formatTime 
}: PlayerProps) {
  return (
    <motion.div 
      key="player"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8"
    >
      <div className="relative">
        <motion.div 
          className={`relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10 ${isPlaying ? 'animate-spin-slow' : ''}`}
        >
          <img 
            src={currentSong?.cover} 
            alt={currentSong?.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 border border-white/20 z-20" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white line-clamp-1">{currentSong?.title || "Chưa có nhạc"}</h2>
        <p className="text-white/60 font-medium text-sm">{currentSong?.artist}</p>
      </div>

      <div className="w-full space-y-2">
        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-400/80"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
        />
        <div className="flex justify-between text-[10px] font-mono text-white/40">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-8">
        <button onClick={prevSong} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
          <SkipBack className="w-5 h-5 fill-current" />
        </button>
        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all border border-white/20"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button onClick={nextSong} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>
    </motion.div>
  );
}
