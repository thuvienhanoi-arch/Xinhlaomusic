import React from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatProps {
  messages: { role: 'user' | 'ai', text: string }[];
  userInput: string;
  setUserInput: (input: string) => void;
  handleSendMessage: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function Chat({ messages, userInput, setUserInput, handleSendMessage, chatEndRef }: ChatProps) {
  return (
    <motion.div 
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex-1 flex flex-col glass-dark rounded-3xl p-4"
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/80'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Hỏi AI hoặc yêu cầu nhạc..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button 
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded-xl hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
