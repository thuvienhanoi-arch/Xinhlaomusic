import { motion } from 'motion/react';

interface PlaylistProps {
  songs: any[];
  currentSongIndex: number;
  isPlaying: boolean;
  setCurrentSongIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setShowPlaylist: (show: boolean) => void;
}

export default function Playlist({ songs, currentSongIndex, isPlaying, setCurrentSongIndex, setIsPlaying, setShowPlaylist }: PlaylistProps) {
  return (
    <motion.div 
      key="playlist"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col"
    >
      <h3 className="text-lg font-bold mb-6 text-white/80">Playlist ({songs.length})</h3>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
        {songs.map((song, idx) => (
          <button
            key={song.id}
            onClick={() => {
              setCurrentSongIndex(idx);
              setIsPlaying(true);
              setShowPlaylist(false);
            }}
            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
              currentSongIndex === idx ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <img src={song.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-white">{song.title}</p>
                <p className="text-xs text-white/40">{song.artist}</p>
              </div>
            </div>
            {currentSongIndex === idx && isPlaying && (
              <div className="flex space-x-1 items-end h-5 ml-4">
                <div className="wave-bar bg-blue-400" />
                <div className="wave-bar bg-blue-400" />
                <div className="wave-bar bg-blue-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
