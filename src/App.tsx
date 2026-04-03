/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Play, Pause, SkipBack, SkipForward, Send, Music, MessageSquare, Volume2, ListMusic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Player from './components/Player';
import Chat from './components/Chat';
import Playlist from './components/Playlist';

interface Song {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover: string;
}

const API_KEY = "AIzaSyB6Bw7_M0WXcWovc3lMs3muVsywPNlWrrg";
const FOLDER_ID = "167xYED5mEmnl0-N9FDt2vO-SMhAYpNJW";
const BACKGROUND_IMAGE = "https://i.postimg.cc/kM2xbdYk/XINHLAO.jpg";

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Chào mừng bạn đến với XinhLao! Tôi đang tải nhạc từ Google Drive của bạn..." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const loadSongsFromDrive = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,mimeType)&key=${API_KEY}`
        );
        const data = await res.json();
        console.log(data.files);

        if (data.files && data.files.length > 0) {
          const loadedSongs = data.files
            .filter((file: any) => file.mimeType && file.mimeType.includes("audio"))
            .map((file: any) => ({
              id: file.id,
              title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              artist: "Xin chào, đây là nơi “Thanh lý nỗi buồn, giữ lại bình yên.” là nơi mất tiền để cảm xúc được thả trôi.”",
              src: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`,
              cover: BACKGROUND_IMAGE // Using the main image as cover for all for that "PRO" look
            }));

          if (loadedSongs.length === 0) {
            setMessages(prev => [...prev, { role: 'ai', text: "Không tìm thấy file nhạc nào trong thư mục này 😢" }]);
          } else {
            setSongs(loadedSongs);
            setMessages(prev => [...prev, { role: 'ai', text: `Đã tải xong ${loadedSongs.length} bài hát. Bạn muốn nghe bài nào?` }]);
          }
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: "Thư mục Google Drive đang trống." }]);
        }
      } catch (error) {
        console.error("Drive API Error:", error);
        setMessages(prev => [...prev, { role: 'ai', text: "Lỗi kết nối với Google Drive 🚨 Vui lòng kiểm tra lại cấu hình." }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSongsFromDrive();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setUserInput("");

    const lowerText = userText.toLowerCase();
    
    // Music control logic
    if (lowerText.includes("phát bài") || lowerText.includes("nghe bài")) {
      const match = lowerText.match(/bài (\d+)/);
      if (match) {
        const songNum = parseInt(match[1]);
        if (songNum >= 1 && songNum <= songs.length) {
          setCurrentSongIndex(songNum - 1);
          setIsPlaying(true);
          const msg = `Đang phát bài ${songNum}: ${songs[songNum - 1].title}`;
          setMessages(prev => [...prev, { role: 'ai', text: msg }]);
          speak(msg);
          return;
        }
      }
    }

    if (lowerText.includes("dừng") || lowerText.includes("tạm dừng")) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      const msg = "Đã tạm dừng nhạc cho bạn.";
      setMessages(prev => [...prev, { role: 'ai', text: msg }]);
      speak(msg);
      return;
    }

    if (lowerText.includes("tiếp theo") || lowerText.includes("bài mới")) {
      nextSong();
      const msg = "Đã chuyển sang bài tiếp theo.";
      setMessages(prev => [...prev, { role: 'ai', text: msg }]);
      speak(msg);
      return;
    }

    // AI logic for general questions
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userText,
        config: {
          systemInstruction: "Bạn là một trợ lý âm nhạc vui vẻ. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. Nếu người dùng muốn nghe nhạc, hãy hướng dẫn họ dùng các câu lệnh như 'phát bài 1', 'dừng nhạc', 'bài tiếp theo'."
        }
      });
      const aiMsg = response.text || "Xin lỗi, tôi không hiểu ý bạn.";
      setMessages(prev => [...prev, { role: 'ai', text: aiMsg }]);
      speak(aiMsg);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Tôi đang gặp chút sự cố kết nối. Hãy thử lại sau nhé!" }]);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 blur-sm"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />

      {/* Main Player Container */}
      <main className="relative z-10 w-full max-w-md h-full md:h-[90vh] md:rounded-[35px] overflow-hidden flex flex-col glass shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <button 
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ListMusic className="w-6 h-6 text-white/80" />
          </button>
          <div className="text-center">
            <pre className="text-[6px] text-white/40 font-mono leading-none">
              {`╔═╗╦ ╦╔╗╔╦ ╦╦  ╔═╗╔═╗
╚═╗╠═╣║║║╠═╣║  ╠═╣║ ║
╚═╝╩ ╩╝╚╝╩ ╩╩═╝╩ ╩╚═╝
      XinhLao`}
            </pre>
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-white/80" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col px-8 pb-8">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4"
              >
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                <p className="text-white/60 font-medium">Đang tải nhạc từ Drive...</p>
              </motion.div>
            ) : !showPlaylist && !isChatOpen ? (
              <Player 
                currentSong={currentSong}
                isPlaying={isPlaying}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                togglePlay={togglePlay}
                nextSong={nextSong}
                prevSong={prevSong}
                handleSeek={handleSeek}
                formatTime={formatTime}
              />
            ) : showPlaylist ? (
              <Playlist 
                songs={songs}
                currentSongIndex={currentSongIndex}
                isPlaying={isPlaying}
                setCurrentSongIndex={setCurrentSongIndex}
                setIsPlaying={setIsPlaying}
                setShowPlaylist={setShowPlaylist}
              />
            ) : (
              <Chat 
                messages={messages}
                userInput={userInput}
                setUserInput={setUserInput}
                handleSendMessage={handleSendMessage}
                chatEndRef={chatEndRef}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="px-8 py-6 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-white/40" />
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white/40" />
            </div>
          </div>
          <pre className="text-[6px] font-mono text-white/20 leading-none">
            {`╔═╗╦ ╦╔╗╔╦ ╦╦  ╔═╗╔═╗
╚═╗╠═╣║║║╠═╣║  ╠═╣║ ║
╚═╝╩ ╩╝╚╝╩ ╩╩═╝╩ ╩╚═╝
      XinhLao`}
          </pre>
        </footer>

        {/* Audio Element */}
        {currentSong && (
          <audio
            ref={audioRef}
            src={currentSong.src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={nextSong}
            autoPlay={isPlaying}
          />
        )}
      </main>
    </div>
  );
}
