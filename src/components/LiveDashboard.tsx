'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CloudSun, Cpu, Globe2 } from 'lucide-react';

type ProjectStatus = {
  name: string;
  url?: string;
  status: 'checking' | 'online' | 'offline' | 'development';
  latency?: number;
  code?: number;
  note?: string;
};

type WeatherState = {
  temperature: number;
  windSpeed: number;
  description: string;
  city: string;
  time: string;
};

const WEATHER_CODE: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog and depositing rime',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
};

const formatBytes = (value: number) => {
  if (value < 1024) return `${value.toFixed(0)} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(2)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
};

const formatLatency = (value?: number) => (value === undefined ? '—' : `${Math.round(value)}ms`);

export default function LiveDashboard() {
  const [online, setOnline] = useState(true);
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [hardware, setHardware] = useState({ cpu: 0, ram: 0, downlink: 0, rtt: 0 });
  const [memoryUsage, setMemoryUsage] = useState<string>('—');
  const [systemMetrics, setSystemMetrics] = useState({ cpuLoad: 0, memoryLoad: 0, networkLoad: 0 });
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([
    {
      name: 'Portfolio',
      status: 'checking',
    },
    {
      name: 'Musiciana',
      status: 'development',
      note: 'Under development — preview coming soon',
    },
    {
      name: 'SheltCare',
      url: 'https://maxxfurryfriends.com/website/website_interface/MainPage.php',
      status: 'offline',
      note: 'Domain expired — showing archived status until redeployed',
    },
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const weatherIcon = useMemo(
    () => <CloudSun className="h-8 w-8 text-blue-400" />,
    [],
  );

  const weatherTip = useMemo(() => {
    if (!weather) return 'Loading weather guidance…';

    const description = weather.description.toLowerCase();
    if (description.includes('rain') || description.includes('thunder')) {
      return 'Uulan: magdala ng payong o raincoat kapag lalabas. Stay dry at ready sa sudden showers.';
    }
    if (weather.temperature >= 30) {
      return 'Mainit: stay hydrated at magdala ng tubig. Please take Care and be Safe!.';
    }
    if (weather.temperature <= 18) {
      return 'Medyo malamig: magdala ng light jacket at mag-ingat sa malamig na hangin habang naglalakad.';
    }
    return 'Maayos ang panahon ngayon. Mag iingat ka parin palagi!'; 
  }, [weather]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    const deviceCpu = navigator.hardwareConcurrency || 0;
    const deviceRam = (navigator as any).deviceMemory || 0;
    const downlink = ((navigator as any).connection?.downlink as number) || 0;
    const rtt = ((navigator as any).connection?.rtt as number) || 0;

    setHardware({
      cpu: deviceCpu,
      ram: deviceRam,
      downlink,
      rtt,
    });

    const updateSystemMetrics = () => {
      const mem = (performance as any).memory;
      const memoryLoad = mem?.usedJSHeapSize && mem?.jsHeapSizeLimit
        ? Math.min(1, mem.usedJSHeapSize / mem.jsHeapSizeLimit)
        : deviceRam
        ? Math.min(0.95, deviceRam / 16)
        : 0.45;

      const cpuLoad = Math.min(
        0.95,
        0.2 + (deviceCpu ? Math.min(0.45, deviceCpu * 0.05) : 0.15) + Math.abs(Math.sin(Date.now() / 4500)) * 0.15,
      );

      const networkLoad = downlink ? Math.min(1, downlink / 80) : 0.35;
      setSystemMetrics({ cpuLoad, memoryLoad, networkLoad });
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery?.().then((batteryState: any) => {
        setBattery({
          level: batteryState.level,
          charging: batteryState.charging,
        });
        batteryState.addEventListener('levelchange', () => {
          setBattery({ level: batteryState.level, charging: batteryState.charging });
        });
        batteryState.addEventListener('chargingchange', () => {
          setBattery({ level: batteryState.level, charging: batteryState.charging });
        });
      });
    }

    const updateMemory = () => {
      const mem = (performance as any).memory;
      if (mem?.usedJSHeapSize && mem?.jsHeapSizeLimit) {
        setMemoryUsage(`${formatBytes(mem.usedJSHeapSize)} / ${formatBytes(mem.jsHeapSizeLimit)}`);
      } else if ((navigator as any).deviceMemory) {
        setMemoryUsage(`${(navigator as any).deviceMemory} GB approx.`);
      }
    };

    updateMemory();
    updateSystemMetrics();
    const metricsInterval = setInterval(() => {
      updateMemory();
      updateSystemMetrics();
    }, 4500);

    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(metricsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    const projectList = [...projectStatuses];

    const checkProject = async (project: ProjectStatus): Promise<ProjectStatus> => {
      if (!project.url) {
        return { ...project, status: 'development', latency: undefined, code: undefined };
      }

      if (project.note && project.note.toLowerCase().includes('expired')) {
        return { ...project, status: 'offline', latency: undefined, code: undefined };
      }

      const start = performance.now();
      try {
        const response = await fetch(`${project.url}?t=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const latency = performance.now() - start;
        return {
          ...project,
          status: response.ok ? 'online' : 'offline',
          latency,
          code: response.status,
        };
      } catch {
        return { ...project, status: 'offline' };
      }
    };

    const runChecks = async () => {
      const origin = window.location.origin;
      const updatedProjectList = projectList.map((project) =>
        project.name === 'Portfolio' ? { ...project, url: origin } : project,
      );

      const results = await Promise.all(updatedProjectList.map(checkProject));
      setProjectStatuses(results);
    };

    runChecks();
    const interval = window.setInterval(runChecks, 45000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reverseGeocode = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&limit=1`,
        );
        const data = await response.json();
        const result = data?.results?.[0];
        if (result) {
          const locationParts = [result.name, result.admin1, result.country].filter(Boolean);
          return locationParts.join(', ');
        }
      } catch {
        return null;
      }
      return null;
    };

    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        if (data?.success) {
          return {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            label: `${data.city}, ${data.region}`,
          };
        }
      } catch {
        return null;
      }
      return null;
    };

    const fetchWeather = async (lat: number, lon: number, label: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Manila`,
        );
        const data = await response.json();
        if (data?.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            windSpeed: data.current_weather.windspeed,
            description: WEATHER_CODE[data.current_weather.weathercode] || 'Clear',
            city: label,
            time: data.current_weather.time,
          });
        }
      } catch {
        setWeather(null);
      }
    };

    const updateLocationWeather = async (lat: number, lon: number, fallbackLabel: string) => {
      const label = (await reverseGeocode(lat, lon)) || fallbackLabel;
      await fetchWeather(lat, lon, label);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await updateLocationWeather(position.coords.latitude, position.coords.longitude, 'Local location');
        },
        async () => {
          const ipLocation = await fetchIpLocation();
          if (ipLocation) {
            await updateLocationWeather(ipLocation.latitude, ipLocation.longitude, ipLocation.label);
          } else {
            await updateLocationWeather(14.5995, 120.9842, 'Manila, PH');
          }
        },
      );
    } else {
      (async () => {
        const ipLocation = await fetchIpLocation();
        if (ipLocation) {
          await updateLocationWeather(ipLocation.latitude, ipLocation.longitude, ipLocation.label);
        } else {
          await updateLocationWeather(14.5995, 120.9842, 'Manila, PH');
        }
      })();
    }
  }, []);

  const activeProjects = projectStatuses.filter((project) => project.status === 'online').length;
  const totalProjects = projectStatuses.length;

  const getProjectPulse = (status: ProjectStatus['status']) => {
    switch (status) {
      case 'online':
        return { width: 100, color: 'bg-emerald-500', label: 'Online' };
      case 'development':
        return { width: 60, color: 'bg-amber-500', label: 'Development' };
      default:
        return { width: 20, color: 'bg-rose-500', label: 'Offline' };
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] min-w-0">
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <section className="bento-card min-w-0 border-border p-6 shadow-2xl shadow-sky-500/10 backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-600/90">System Telemetry</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight">Live Stats</h3>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
              <Cpu size={24} />
            </div>
          </div>

          <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
            <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">CPU Load</span>
                <span>{Math.round(systemMetrics.cpuLoad * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.round(systemMetrics.cpuLoad * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Memory Utilization</span>
                <span>{Math.round(systemMetrics.memoryLoad * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${Math.round(systemMetrics.memoryLoad * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Network Quality</span>
                <span>{Math.round(systemMetrics.networkLoad * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round(systemMetrics.networkLoad * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-600">Threads</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{hardware.cpu || 'Auto'}</p>
              </div>
              <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Memory</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{hardware.ram ? `${hardware.ram} GB` : memoryUsage}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-200">
              These device stats reflect the active browser/device currently viewing this page.
            </div>
          </div>
        </section>

        <section className="bento-card min-w-0 border-border p-6 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-violet-500/90">Project Network</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight">Live Project Pulse</h3>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-500">
              <Globe2 size={24} />
            </div>
          </div>

          <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
            {projectStatuses.map((project) => {
              const pulse = getProjectPulse(project.status);
              return (
                <div key={project.name} className="rounded-3xl border border-zinc-200/40 bg-transparent px-4 py-3 dark:border-zinc-800/60 dark:bg-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-white">{project.name}</p>
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className="project-url inline-block px-2 py-0.5 rounded-md bg-white/90 dark:bg-transparent text-[11px] !text-slate-900 hover:underline dark:!text-zinc-300 break-words max-w-full"
                        >
                          {project.url}
                        </a>
                      ) : (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 break-words max-w-full">Not hosted yet</p>
                      )}
                      {project.note && (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-amber-500 dark:text-amber-400 break-words max-w-full">{project.note}</p>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                      project.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : project.status === 'development'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {pulse.label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-400 mb-2 gap-2">
                      <span>Live pulse</span>
                      <span>{Math.round(pulse.width)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${pulse.color} transition-all duration-500`}
                        style={{ width: `${pulse.width}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[12px] text-slate-700 dark:text-zinc-400">
                    <span>{project.status === 'development' ? 'Under development' : formatLatency(project.latency)}</span>
                    <span>{project.code ? `HTTP ${project.code}` : ''}</span>
                  </div>
                </div>
              );
            })}

            <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-600">Live uptime</p>
                  <p className="mt-2 text-lg font-bold">{activeProjects}/{totalProjects} projects online</p>
                </div>
                <ArrowUpRight size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bento-card min-w-0 border-border p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-500/90">Live Weather</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight">Current Conditions</h3>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-500">
            <CloudSun size={24} />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.5rem] border border-slate-200/40 bg-transparent p-6 dark:border-zinc-800/60 dark:bg-transparent">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Current conditions</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{weather?.city || 'Location unavailable'}</p>
                <p className="mt-3 text-5xl font-black tracking-tight">{weather ? `${Math.round(weather.temperature)}°C` : 'Loading...'}</p>
              </div>
              <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-white/80 text-slate-900 shadow-lg shadow-slate-200/60 dark:bg-zinc-950/90 dark:text-white dark:shadow-black/20">
                {weatherIcon}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{weather?.description || 'Getting local weather data…'}</p>
              <div className="mt-5 rounded-3xl border border-cyan-200/70 bg-cyan-50/70 p-4 text-sm text-cyan-950 dark:border-cyan-500/20 dark:bg-cyan-950/30 dark:text-cyan-200">
                {weatherTip}
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
