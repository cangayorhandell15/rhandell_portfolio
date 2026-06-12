/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Bot, X, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [botGreeting, setBotGreeting] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bubbleSequence = useMemo(() => ['Hi...', "I'm RCDC...", 'Do you need something?'], []);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

const botGreetings = [
    "Hi, I'm RCDC 🤖 How may I help you today?",
    "Hello from RCDC AI! I'm here to make your day better, ask me anything.",
    "Hey there! I'm RCDC, your friendly robot guide—ready to assist with cool ideas.",
    "Hi, I'm RCDC! Need help or a positive thought? I've got your back.",
    "Greetings! RCDC AI here—let's build something awesome together."
  ];

  const sendChatMessage = async (userMessage: string) => {
    const messageId = Date.now().toString();
    const newUserMessage: Message = {
      id: messageId,
      role: 'user',
      content: userMessage,
    };

    const payloadMessages = [...messages, newUserMessage];
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chat failed';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendChatMessage(text);
    } catch (sendError) {
      console.error('Chat sendMessage failed', sendError);
    }
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {error && (
              <div className="text-center py-2 text-red-600 dark:text-red-400">
                Error: {error}
              </div>
            )}

            {messages.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <img
                  src="/gif/RCDC.gif"
                  alt="RCDC robot"
                  className="mx-auto h-20 w-20 rounded-full border-2 border-blue-500"
                />
            <p className="font-bold text-sm text-blue-600 dark:text-blue-300">
  {botGreeting || "Hi, I'm RCDC AI! Ready when you are."}
</p>
                <p className="text-xs text-muted font-medium">Ask me anything about projects, tips, or RCDC services.</p>
              </div>
            )}

            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-foreground dark:text-white rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[60%] rounded-2xl px-4 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700 animate-pulse flex items-center gap-1">
                  <span>RCDC is typing</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="relative flex items-end">
              <textarea
                ref={textareaRef}
                rows={1}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 pr-10 text-sm outline-none text-foreground focus:ring-1 ring-blue-500/50 transition-all resize-none overflow-y-auto"
                value={input}
                placeholder="Ask something about Rhandell..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const text = input.trim();
                    if (!text || isLoading) return;
                    setInput('');
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                    }
                    sendChatMessage(text);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 bottom-1.5 p-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-30 hover:bg-blue-700 transition-all"
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