import WebSocket from 'ws';

export type DiscordPresenceState = {
  status: 'online' | 'idle' | 'invisible';
  activity: string | null;
  listening: boolean;
  lastHeartbeat: number;
  updatedAt: string;
};

const HEARTBEAT_TIMEOUT = 20_000;

const getBotToken = () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN is required for Discord presence integration. Add it to your environment variables.');
  }
  return token;
};

declare global {
  // eslint-disable-next-line no-var
  var discordPresenceSocket: WebSocket | undefined;
  // eslint-disable-next-line no-var
  var discordPresenceReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var discordPresenceState: DiscordPresenceState | undefined;
  // eslint-disable-next-line no-var
  var discordPresenceTimeout: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var discordHeartbeatTimer: NodeJS.Timeout | undefined;
}

const defaultPresenceState: DiscordPresenceState = {
  status: 'invisible',
  activity: null,
  listening: false,
  lastHeartbeat: 0,
  updatedAt: new Date().toISOString(),
};

const getGlobalPresenceState = (): DiscordPresenceState => {
  if (!globalThis.discordPresenceState) {
    globalThis.discordPresenceState = { ...defaultPresenceState };
  }
  return globalThis.discordPresenceState;
};

const buildPayload = (op: number, d: unknown) => JSON.stringify({ op, d });

const getSocket = async (): Promise<WebSocket> => {
  if (globalThis.discordPresenceSocket && globalThis.discordPresenceSocket.readyState === WebSocket.OPEN) {
    return globalThis.discordPresenceSocket;
  }

  if (!globalThis.discordPresenceSocket || globalThis.discordPresenceSocket.readyState === WebSocket.CLOSED) {
    globalThis.discordPresenceSocket = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
  }

  if (!globalThis.discordPresenceReady) {
    globalThis.discordPresenceReady = new Promise((resolve, reject) => {
      const socket = globalThis.discordPresenceSocket as WebSocket;

      const cleanup = () => {
        socket.removeAllListeners('open');
        socket.removeAllListeners('message');
        socket.removeAllListeners('error');
        socket.removeAllListeners('close');
      };

      socket.on('open', () => {
        socket.on('message', (raw) => {
          try {
            const payload = JSON.parse(raw.toString());
            if (payload.op === 10) {
              socket.send(
                buildPayload(2, {
                  token: getBotToken(),
                  intents: 0,
                  properties: {
                    $os: 'linux',
                    $browser: 'portfolio-site',
                    $device: 'portfolio-site',
                  },
                  presence: {
                    status: 'invisible',
                    activities: [],
                  },
                }),
              );

              const interval = payload.d?.heartbeat_interval ?? 4_500;
              if (globalThis.discordHeartbeatTimer) {
                clearInterval(globalThis.discordHeartbeatTimer);
              }
              globalThis.discordHeartbeatTimer = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(buildPayload(1, Date.now()));
                }
              }, interval);
            }

            if (payload.op === 0 && payload.t === 'READY') {
              cleanup();
              resolve();
            }
          } catch (error) {
            console.error('Discord gateway parse error:', error);
          }
        });
      });

      socket.on('error', (error) => {
        cleanup();
        reject(error);
      });

      socket.on('close', () => {
        if (globalThis.discordHeartbeatTimer) {
          clearInterval(globalThis.discordHeartbeatTimer);
          globalThis.discordHeartbeatTimer = undefined;
        }
        globalThis.discordPresenceSocket = undefined;
      });
    });
  }

  await globalThis.discordPresenceReady;
  return globalThis.discordPresenceSocket as WebSocket;
};

const sendPresenceUpdate = async (state: DiscordPresenceState) => {
  const socket = await getSocket();
  if (socket.readyState !== WebSocket.OPEN) return;

  const activities = state.activity
    ? [
        {
          name: state.activity,
          type: state.listening ? 2 : 0,
        },
      ]
    : [];

  socket.send(
    buildPayload(3, {
      since: Date.now(),
      activities,
      status: state.status,
      afk: false,
    }),
  );
};

const ensureOfflineTimeout = (state: DiscordPresenceState) => {
  if (globalThis.discordPresenceTimeout) {
    clearTimeout(globalThis.discordPresenceTimeout);
  }

  globalThis.discordPresenceTimeout = setTimeout(async () => {
    const currentState = getGlobalPresenceState();
    currentState.status = 'invisible';
    currentState.activity = null;
    currentState.listening = false;
    currentState.updatedAt = new Date().toISOString();
    await sendPresenceUpdate(currentState);
  }, HEARTBEAT_TIMEOUT);
};

export const getDiscordPresenceState = async (): Promise<DiscordPresenceState> => {
  getGlobalPresenceState();
  await getSocket();
  return getGlobalPresenceState();
};

export const updateDiscordPresence = async ({ active, listening }: { active: boolean; listening: boolean }): Promise<DiscordPresenceState> => {
  const state = getGlobalPresenceState();
  state.lastHeartbeat = Date.now();
  state.listening = listening;

  if (active) {
    state.status = 'online';
  } else {
    state.status = 'idle';
  }

  if (!active && !listening) {
    state.activity = 'Away from portfolio';
  } else if (listening) {
    state.activity = 'Listening to music';
  } else {
    state.activity = 'Browsing portfolio';
  }

  state.updatedAt = new Date().toISOString();

  await sendPresenceUpdate(state);
  ensureOfflineTimeout(state);

  return state;
};
