/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Bot, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [botGreeting, setBotGreeting] = useState('');
  const bubbleSequence = useMemo(() => ['Hi...', 'I’m RCDC...', 'Do you need something?'], []);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const botGreetings = [
    'Hi, I’m RCDC 🤖 How may I help you today?',
    'Hello from RCDC AI! I’m here to make your day better, ask me anything.',
    'Hey there! I’m RCDC, your friendly robot guide—ready to assist with cool ideas.',
    'Hi, I’m RCDC! Need help or a positive thought? I’ve got your back.',
    'Greetings! RCDC AI here—let’s build something awesome together.'
  ];

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status === 'streaming';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setBubbleIndex((prev) => (prev + 1) % bubbleSequence.length);
      }, 2200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [bubbleIndex, isOpen, bubbleSequence.length]);

  // Set a random greeting when the chat opens
  const openChat = () => {
    if (!isOpen) {
      const randomGreeting = botGreetings[Math.floor(Math.random() * botGreetings.length)];
      setBotGreeting(randomGreeting);
      setBubbleIndex(0); // reset speech cycle when opening
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[460px] sm:h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Bot size={18} />
              </div>
              <p className="text-sm font-bold text-foreground uppercase tracking-tight">RCDC AI</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground transition-colors">
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
              <div className="text-center py-8 space-y-3">
                <img
                  src="/gif/RCDC.gif"
                  alt="RCDC robot"
                  className="mx-auto h-20 w-20 rounded-full border-2 border-blue-500"
                />
                <p className="font-bold text-sm text-blue-600 dark:text-blue-300">{botGreeting || 'Hi, I’m RCDC AI! Ready when you are.'}</p>
                <p className="text-xs text-muted font-medium">Ask me anything about projects, tips, or RCDC services.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[60%] rounded-2xl px-4 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700 animate-pulse">
                  ...
                </div>
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
                      : 'bg-zinc-100 dark:bg-zinc-800 text-foreground dark:text-white rounded-tl-none border border-zinc-200 dark:border-zinc-700'
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
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none text-foreground focus:ring-1 ring-blue-500/50 transition-all"
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

      {/* Toggle Robot Bubble */}
      <div className="relative flex flex-col items-center">
        {!isOpen && (
          <div className="hidden sm:block absolute -top-12 right-0 translate-x-[-10%] w-max max-w-[180px] text-center px-2 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-semibold shadow-lg overflow-hidden text-ellipsis whitespace-nowrap">
            {bubbleSequence[bubbleIndex]}
          </div>
        )}

        <button
          onClick={openChat}
          className="relative overflow-hidden h-16 w-16 bg-transparent rounded-full p-0 border-none shadow-xl hover:scale-110 active:scale-95 transition-transform"
          aria-label={isOpen ? 'Close RCDC chat' : 'Open RCDC chat'}
        >
          <img
            src="/gif/RCDC.gif"
            alt="RCDC robot"
            className="h-full w-full rounded-full"
          />
          {isOpen && (
            <span className="absolute inset-0 bg-black/40 text-xs text-white flex items-center justify-center font-bold">Close</span>
          )}
        </button>
      </div>
    </div>
  );
}