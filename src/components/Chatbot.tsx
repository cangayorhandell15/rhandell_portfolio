/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Bot, X, Send, AlertCircle } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [botGreeting, setBotGreeting] = useState('');
  const bubbleSequence = useMemo(() => ['Hi...', 'I’m RCDC...', 'Do you need something?'], []);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Controlled states para sa input at loading indicators
  const [chatInput, setChatInput] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const botGreetings = [
    'Hi, I’m RCDC 🤖 How may I help you today?',
    'Hello from RCDC AI! I’m here to make your day better, ask me anything.',
    'Hey there! I’m RCDC, your friendly robot guide—ready to assist with cool ideas.',
    'Hi, I’m RCDC! Need help or a positive thought? I’ve got your back.',
    'Greetings! RCDC AI here—let’s build something awesome together.'
  ];

  // Gagamitin natin ang reload at setMessages para sa kontroladong processing loop
  const { messages, status, error: sdkError, reload, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => {
      console.error('Chat SDK captured an error:', err);
      setLocalError(err.message || 'Quota Exceeded');
    }
  });
  
  // Dynamic validation para sa system checks
  const activeError = localError || (sdkError?.message || null);
  const isLoading = status === 'sending' || status === 'streaming' || isManualLoading;
  const isTyping = isLoading && !activeError;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping, activeError]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setBubbleIndex((prev) => (prev + 1) % bubbleSequence.length);
      }, 2200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [bubbleIndex, isOpen, bubbleSequence.length]);

  const openChat = () => {
    if (!isOpen) {
      const randomGreeting = botGreetings[Math.floor(Math.random() * botGreetings.length)];
      setBotGreeting(randomGreeting);
      setBubbleIndex(0);
    }
    setIsOpen((prev) => !prev);
  };

  const isQuotaError = useMemo(() => {
    if (!activeError) return false;
    const errorStr = String(activeError).toLowerCase();
    return (
      errorStr.includes('quota') || 
      errorStr.includes('429') || 
      errorStr.includes('exhausted') || 
      errorStr.includes('limit')
    );
  }, [activeError]);

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
            
            {/* Messages rendering */}
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

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[60%] rounded-2xl px-4 py-2.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                    <span>RCDC is typing...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ang magandang error layout block box */}
            {activeError && (
              <div className="flex justify-center p-2 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center gap-2 max-w-[90%] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 rounded-2xl text-center shadow-sm">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">
                    {isQuotaError 
                      ? "Sorry for the inconvenience! The daily free usage limit for this chatbot has been reached. Please try again tomorrow! 😊"
                      : `Connection error: ${activeError}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const text = chatInput.trim();
              if (!text || isLoading) return;

              setChatInput('');
              setLocalError(null);
              setIsManualLoading(true);

              // 1. I-update ang messages array sa ligtas at tamang React status hook convention (Walang direct push mutation)
              const updatedMessages = [
                ...messages,
                {
                  id: Math.random().toString(36).substring(7),
                  role: 'user' as const,
                  content: text,
                  createdAt: new Date()
                }
              ];
              setMessages(updatedMessages);

              try {
                // 2. Tinitest muna natin ang API kung quota-locked bago natin hayaang mag-stream si useChat
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                  }),
                });

                // Kung ang response ay hinarangan ng backend (Hindi naging response.ok)
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  const remoteMsg = errorData?.error || `Server returned status ${response.status}`;
                  
                  if (response.status === 429 || remoteMsg.toLowerCase().includes('quota')) {
                    setLocalError('Quota Exceeded');
                  } else {
                    setLocalError(remoteMsg);
                  }

                  // I-rollback ang messages para matanggal ang sirang huling mensahe sa interface
                  setMessages(messages);
                  setIsManualLoading(false);
                  return;
                }

                // 3. Kung ligtas (200 OK), tawagin ang reload() para simulan ang real-time streaming output
                setIsManualLoading(false);
                if (typeof reload === 'function') {
                  await reload();
                }
              } catch (err: any) {
                console.error("Form transmission failed:", err);
                setLocalError(err?.message || 'Quota Exceeded');
                setMessages(messages); // I-rollback ang messages array
                setIsManualLoading(false);
              }
            }}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="relative flex items-center">
              <input
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none text-foreground focus:ring-1 ring-blue-500/50 transition-all disabled:opacity-50"
                value={chatInput}
                disabled={isLoading || isQuotaError}
                placeholder={isQuotaError ? "Chat locked until tomorrow..." : "Ask something about Rhandell..."}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim() || isQuotaError}
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