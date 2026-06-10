'use client';

import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

interface DiscordEmbedProps {
  clientId: string;
  open: boolean;
}

type DiscordBackendPresence = {
  status: 'online' | 'idle' | 'invisible' | 'unknown';
  activity: string | null;
  listening: boolean;
  updatedAt: string;
};

export default function DiscordEmbed({ clientId, open }: DiscordEmbedProps) {
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInDiscord, setIsInDiscord] = useState(false);
  const [backendPresence, setBackendPresence] = useState<DiscordBackendPresence | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fetchPresence = async () => {
    try {
      const response = await fetch('/api/discord-presence', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load Discord presence');
      const data = await response.json();
      setBackendPresence(data);
    } catch (err) {
      console.error('Discord presence fetch error:', err);
    }
  };

  const sendHeartbeat = async (active: boolean, listening: boolean) => {
    try {
      await fetch('/api/discord-presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, listening }),
      });
    } catch (err) {
      console.error('Discord presence heartbeat error:', err);
    }
  };

  useEffect(() => {
    if (!open) {
      setSdkInitialized(false);
      setError(null);
      setIsInDiscord(false);
      setIsActive(false);
      setIsListening(false);
      setBackendPresence(null);
      return;
    }

    const frameId = new URLSearchParams(window.location.search).get('frame_id');
    const runningInDiscord = Boolean(frameId);
    setIsInDiscord(runningInDiscord);

    const updatePresenceInfo = () => {
      const active = document.visibilityState === 'visible' && document.hasFocus();
      const mediaElements = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
      const listening = mediaElements.some((media) => !media.paused && !media.ended && media.currentTime > 0);
      setIsActive(active);
      setIsListening(listening);
      return { active, listening };
    };

    const sendLocalPresence = async () => {
      const { active, listening } = updatePresenceInfo();
      await sendHeartbeat(active, listening);
      await fetchPresence();
    };

    const initializeDiscordSDK = async () => {
      if (!runningInDiscord) return;

      try {
        const discordSDK = new DiscordSDK(clientId);
        await discordSDK.ready();
        setSdkInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Discord SDK';
        setError(errorMessage);
        console.error('Discord SDK initialization error:', err);
      }
    };

    updatePresenceInfo();
    fetchPresence();

    if (!runningInDiscord) {
      sendLocalPresence();

      const interval = window.setInterval(sendLocalPresence, 10_000);
      window.addEventListener('visibilitychange', sendLocalPresence);
      window.addEventListener('focus', sendLocalPresence);
      window.addEventListener('blur', sendLocalPresence);

      return () => {
        window.removeEventListener('visibilitychange', sendLocalPresence);
        window.removeEventListener('focus', sendLocalPresence);
        window.removeEventListener('blur', sendLocalPresence);
        window.clearInterval(interval);
      };
    }

    initializeDiscordSDK();
  }, [open, clientId]);

  if (!open) return null;

  // UI removed per request: do not render embed boxes but keep presence effects running
  return null;
}
