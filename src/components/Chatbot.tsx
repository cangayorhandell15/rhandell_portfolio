/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Bot, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status === 'streaming';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Bot size={18} />
              </div>
              <p className="text-sm font-bold dark:text-white text-zinc-900 uppercase tracking-tight">RCDC AI</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {error && (
              <div className="text-center py-2 text-red-600 dark:text-red-400">
                Error: {error.message}
              </div>
            )}
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Bot className="mx-auto text-zinc-300" size={32} />
                <p className="text-xs text-zinc-500 font-medium">How can I help you today?</p>
              </div>
            )}
            
            {messages.map((m: any) => {
              const textContent = m.parts
                ?.filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('') || (typeof m.content === 'string' ? m.content : '');

              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {textContent}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const text = input.trim();
              if (!text) return;

              try {
                await sendMessage({ text });
                setInput('');
              } catch (sendError) {
                console.error('Chat sendMessage failed', sendError);
              }
            }}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="relative flex items-center">
              <input
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-900 dark:text-white focus:ring-1 ring-blue-500/50 transition-all"
                value={input}
                placeholder="Ask something about Rhandell..."
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-30 hover:bg-blue-700 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group border-2 border-white/10"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} className="group-hover:rotate-12 transition-transform" />}
        {!isOpen && <span className="font-black text-xs uppercase tracking-widest pr-1">Chat with RCDC AI</span>}
      </button>
    </div>
  );
}