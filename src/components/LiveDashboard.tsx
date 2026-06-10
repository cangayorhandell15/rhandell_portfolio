'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CloudSun, Cpu, Globe2, Smartphone, Laptop, Battery, Zap, Github, Users, GitBranch, MessageSquare } from 'lucide-react';

type ProjectStatus = {
  name: string;
  url?: string;
  status: 'checking' | 'online' | 'offline' | 'Under-development';
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

type DeviceType = 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';

type SystemMetrics = {
  cpuLoad: number;
  memoryLoad: number;
  networkLoad: number;
  networkSpeed: number;
};

type GitHubStats = {
  username: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalContributions: number;
  contributionsThisYear: number;
  profileUrl: string;
  avatarUrl: string;
  latestActivity: string | null;
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

const DISCORD_HANDLE = 'rhandell5590';

const formatLatency = (value?: number) => (value === undefined ? '—' : `${Math.round(value)}ms`);

const formatGitHubEvent = (event: any): string => {
  if (!event || typeof event.type !== 'string') {
    return 'No recent public activity';
  }

  const repoName = event.repo?.name ? event.repo.name.replace(/^.*\//, '') : 'repository';
  const payload = event.payload || {};

  switch (event.type) {
    case 'PushEvent': {
      const commitMessage = payload.commits?.[0]?.message;
      return commitMessage
        ? `Pushed to ${repoName}: "${commitMessage}"`
        : `Pushed to ${repoName}`;
    }
    case 'CreateEvent':
      return payload.ref_type && payload.ref
        ? `Created ${payload.ref_type} ${payload.ref} in ${repoName}`
        : `Created new content in ${repoName}`;
    case 'WatchEvent':
      return `Starred ${repoName}`;
    case 'ForkEvent':
      return `Forked ${repoName}`;
    case 'IssuesEvent':
      return payload.action && payload.issue?.title
        ? `${payload.action.charAt(0).toUpperCase() + payload.action.slice(1)} issue “${payload.issue.title}” in ${repoName}`
        : `Updated an issue in ${repoName}`;
    case 'IssueCommentEvent':
      return payload.action
        ? `${payload.action.charAt(0).toUpperCase() + payload.action.slice(1)} a comment on an issue in ${repoName}`
        : `Commented on an issue in ${repoName}`;
    case 'PullRequestEvent':
      return payload.action && payload.pull_request?.title
        ? `${payload.action.charAt(0).toUpperCase() + payload.action.slice(1)} PR “${payload.pull_request.title}” in ${repoName}`
        : `Updated a pull request in ${repoName}`;
    case 'PullRequestReviewCommentEvent':
      return `Commented on a pull request in ${repoName}`;
    default:
      return `Recent GitHub activity in ${repoName}`;
  }
};

const detectDeviceType = (): DeviceType => {
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua);
  const isTablet = /tablet|ipad|playbook|silk|android(?!.*mobile)/.test(ua);
  const isLaptop = /macbook|windows nt.*x64.*wow64/.test(ua);
  
  if (isMobile && !isTablet) return 'Mobile';
  if (isTablet) return 'Tablet';
  if (isLaptop) return 'Laptop';
  return 'Desktop';
};

const getDeviceIcon = (device: DeviceType) => {
  switch (device) {
    case 'Mobile':
    case 'Tablet':
      return <Smartphone className="h-5 w-5" />;
    case 'Laptop':
      return <Laptop className="h-5 w-5" />;
    default:
      return <Cpu className="h-5 w-5" />;
  }
};

const renderNetworkSpeedGraph = (history: number[]) => {
  if (history.length < 2) return null;

  const width = 280;
  const height = 60;
  const padding = 8;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const maxSpeed = Math.max(...history, 100);
  const minSpeed = 0;

  const points = history.map((speed, idx) => {
    const x = padding + (idx / (history.length - 1)) * graphWidth;
    const y = height - padding - ((speed - minSpeed) / (maxSpeed - minSpeed)) * graphHeight;
    return { x, y, speed };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const currentSpeed = history[history.length - 1];
  const prevSpeed = history[history.length - 2];
  const isIncreasing = currentSpeed >= prevSpeed;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Grid lines */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeWidth="1" opacity="0.1" />

      {/* Area under curve */}
      <path
        d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
        fill={isIncreasing ? 'rgb(34, 197, 94)' : 'rgb(249, 115, 22)'}
        opacity="0.15"
      />

      {/* Line */}
      <path
        d={pathData}
        stroke={isIncreasing ? 'rgb(34, 197, 94)' : 'rgb(249, 115, 22)'}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2"
          fill={isIncreasing ? 'rgb(34, 197, 94)' : 'rgb(249, 115, 22)'}
          opacity={i === points.length - 1 ? 1 : 0.4}
        />
      ))}
    </svg>
  );
};

export default function LiveDashboard() {
  const [online, setOnline] = useState(true);
  const [deviceType, setDeviceType] = useState<DeviceType>('Desktop');
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [hardware, setHardware] = useState({ cpu: 0, ram: 0, downlink: 0, rtt: 0 });
  const [memoryUsage, setMemoryUsage] = useState<string>('—');
  const [ramAllocation, setRamAllocation] = useState<{ used: number; total: number }>({ used: 0, total: 0 });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({ cpuLoad: 0, memoryLoad: 0, networkLoad: 0, networkSpeed: 0 });
  const [networkSpeedHistory, setNetworkSpeedHistory] = useState<number[]>([]);
  const [speedTrend, setSpeedTrend] = useState(0);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(true);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([
    {
      name: 'Portfolio',
      status: 'checking',
    },
    {
      name: 'Musiciana',
      status: 'Under-development',
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
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [contributions, setContributions] = useState<{ date: string; count: number }[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [heatmapCols, setHeatmapCols] = useState<number[][]>([]);
  const [heatmapDates, setHeatmapDates] = useState<string[][]>([]);
  const [monthLabels, setMonthLabels] = useState<(string | null)[]>([]);

  useEffect(() => {
    const fetchContributions = async () => {
      setContributionsLoading(true);
      try {
        const response = await fetch(`/api/github-contributions?year=${selectedYear}&username=cangayorhandell15`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch GitHub contributions');
        }
        setContributions(data.contributions || []);
        setGithubStats((current) =>
          current
            ? {
                ...current,
                contributionsThisYear: data.totalContributions,
                totalContributions: data.totalContributions,
              }
            : {
                username: 'cangayorhandell15',
                followers: 0,
                following: 0,
                publicRepos: 0,
                totalContributions: data.totalContributions,
                contributionsThisYear: data.totalContributions,
                profileUrl: 'https://github.com/cangayorhandell15',
                avatarUrl: '',
                latestActivity: null,
              },
        );
      } catch (error) {
        console.error('Failed to load GitHub contributions:', error);
        setContributions([]);
      } finally {
        setContributionsLoading(false);
      }
    };

    fetchContributions();
  }, [selectedYear]);

  useEffect(() => {
    const buildHeatmap = () => {
      const yearStart = new Date(`${selectedYear}-01-01`);
      const yearEnd = new Date(`${selectedYear}-12-31`);
      const start = new Date(yearStart);
      start.setDate(yearStart.getDate() - yearStart.getDay());

      const contributionMap = new Map(contributions.map((item) => [item.date, item.count]));
      const cols: number[][] = [];
      const dates: string[][] = [];
      const labels: (string | null)[] = [];
      let prevMonth = -1;

      for (let i = 0; i < 53; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + i * 7);
        labels.push(prevMonth !== weekStart.getMonth() ? weekStart.toLocaleString('default', { month: 'short' }) : null);
        prevMonth = weekStart.getMonth();

        const week: number[] = [];
        const weekDates: string[] = [];
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + d);
          const key = day.toISOString().slice(0, 10);
          weekDates.push(key);
          if (day < yearStart || day > yearEnd) {
            week.push(0);
          } else {
            week.push(contributionMap.get(key) ?? 0);
          }
        }
        cols.push(week);
        dates.push(weekDates);
      }

      setHeatmapCols(cols);
      setHeatmapDates(dates);
      setMonthLabels(labels);
    };

    if (contributions.length > 0 || !contributionsLoading) {
      buildHeatmap();
    }
  }, [contributions, selectedYear, contributionsLoading]);

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
    setDeviceType(detectDeviceType());
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
      
      // Get actual system RAM from deviceMemory API
      const actualSystemRam = (navigator as any).deviceMemory || 8; // Default to 8GB if not available
      
      // Memory load based on JS Heap usage
      let memoryLoad = mem?.usedJSHeapSize && mem?.jsHeapSizeLimit
        ? Math.min(1, mem.usedJSHeapSize / mem.jsHeapSizeLimit)
        : 0.45;
      
      // Add natural fluctuation to memory
      memoryLoad = Math.max(0.1, Math.min(0.95, memoryLoad + (Math.sin(Date.now() / 2000) * 0.15)));

      // Update RAM allocation with ACTUAL system RAM
      if (mem?.usedJSHeapSize && mem?.jsHeapSizeLimit) {
        setRamAllocation({
          used: Math.round((mem.usedJSHeapSize / (1024 ** 3)) * 100) / 100,
          total: actualSystemRam, // Use actual system RAM, not heap limit
        });
      } else if (deviceRam) {
        setRamAllocation({
          used: Math.round(deviceRam * 0.5 * 100) / 100,
          total: deviceRam,
        });
      }

      // CPU load with natural sine wave variation
      const cpuLoad = Math.min(
        0.95,
        0.25 + (deviceCpu ? Math.min(0.35, deviceCpu * 0.04) : 0.15) + Math.abs(Math.sin(Date.now() / 3500)) * 0.25,
      );

      // Network speed with trending behavior
      const baseSpeed = downlink ? downlink * 8 : 45;
      const randomVariation = (Math.random() - 0.5) * 30;
      const trendComponent = Math.sin(Date.now() / 5000) * 20;
      const networkSpeed = Math.max(5, Math.min(200, baseSpeed + randomVariation + trendComponent));

      // Network load with fluctuation
      let networkLoad = downlink ? Math.min(1, downlink / 80) : 0.35;
      networkLoad = Math.max(0.2, Math.min(1, networkLoad + (Math.sin(Date.now() / 2500) * 0.2)));

      setSystemMetrics({ cpuLoad, memoryLoad, networkLoad, networkSpeed });

      // Update network speed history for trending
      setNetworkSpeedHistory((prev) => {
        const updated = [...prev, networkSpeed];
        return updated.slice(-30); // Keep last 30 data points
      });

      // Track trend direction
      setSpeedTrend(networkSpeed);
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
    }, 1000);

    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(metricsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        setLoadingGithub(true);

        const [userResponse, contributionsResponse, eventsResponse] = await Promise.all([
          fetch('https://api.github.com/users/cangayorhandell15'),
          fetch(`/api/github-contributions?year=${new Date().getFullYear()}&username=cangayorhandell15`),
          fetch('https://api.github.com/users/cangayorhandell15/events/public?per_page=5'),
        ]);

        let userData: any = null;
        if (userResponse.ok) {
          userData = await userResponse.json();
        } else {
          try {
            const body = await userResponse.json();
            console.warn('GitHub user fetch failed:', userResponse.status, body.message ?? body);
          } catch (e) {
            console.warn('GitHub user fetch failed with status', userResponse.status);
          }
        }

        let contributionsThisYear = 0;
        if (contributionsResponse.ok) {
          const contributionsData = await contributionsResponse.json();
          contributionsThisYear = contributionsData.totalContributions || 0;
        } else {
          console.warn('Failed to load GitHub contribution graph:', contributionsResponse.statusText);
        }

        let latestActivity: string | null = null;
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (Array.isArray(eventsData) && eventsData.length > 0) {
            latestActivity = formatGitHubEvent(eventsData[0]);
          }
        } else {
          console.warn('Failed to load GitHub events:', eventsResponse.statusText);
        }

        setGithubStats({
          username: userData?.login ?? 'cangayorhandell15',
          followers: userData?.followers ?? 0,
          following: userData?.following ?? 0,
          publicRepos: userData?.public_repos ?? 0,
          totalContributions: contributionsThisYear || (userData?.public_repos ?? 0),
          contributionsThisYear,
          profileUrl: userData?.html_url ?? 'https://github.com/cangayorhandell15',
          avatarUrl: userData?.avatar_url ?? '',
          latestActivity,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
      } finally {
        setLoadingGithub(false);
      }
    };

    fetchGithubStats();
    const interval = setInterval(fetchGithubStats, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const projectList = [...projectStatuses];

    const checkProject = async (project: ProjectStatus): Promise<ProjectStatus> => {
      if (!project.url) {
        return { ...project, status: 'Under-development', latency: undefined, code: undefined };
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
      case 'Under-development':
        return { width: 60, color: 'bg-amber-500', label: 'Under-development' };
      default:
        return { width: 20, color: 'bg-rose-500', label: 'Offline' };
    }
  };

  const ContributionsHeatmap = () => {
    const cols = heatmapCols.length || 53;
    const rows = 7;
    const cellSize = windowWidth < 420 ? 8 : windowWidth < 640 ? 10 : 12;

    const colorFor = (value: number) => {
      if (!value) return 'bg-slate-200 dark:bg-zinc-900 border border-slate-300/70 dark:border-zinc-800';
      if (value <= 1) return 'bg-[#9be9a8] dark:bg-[#0e4429]';
      if (value <= 3) return 'bg-[#40c463] dark:bg-[#11632b]';
      if (value <= 6) return 'bg-[#30a14e] dark:bg-[#0b6d30]';
      return 'bg-[#216e39] dark:bg-[#0b4924]';
    };

    const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
    const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

    return (
      <div className="mt-3 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-900/5 dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-zinc-400">GitHub Contributions</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Contribution graph</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`text-xs px-3 py-1 rounded-full transition ${selectedYear === y ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="min-w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10" />
              <div
                className="inline-grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                }}
              >
                {monthLabels.map((label, idx) => (
                  <div key={idx} className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 text-center" style={{ width: `${cellSize}px` }}>
                    {label || ''}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid grid-rows-7 gap-1 text-[10px] text-slate-500 dark:text-zinc-500 leading-[1]">
                {dayLabels.map((label, index) => (
                  <div key={index} className="h-[12px] sm:h-[14px]">
                    {label}
                  </div>
                ))}
              </div>
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
                {heatmapCols.flatMap((col, c) => col.map((val, r) => (
                  <div
                    key={`${c}-${r}`}
                    title={`${val} contribution${val === 1 ? '' : 's'} on ${heatmapDates[c]?.[r] ?? ''}`}
                    className={`${colorFor(val)} rounded-sm`}
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  />
                )))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
          <span className="font-semibold">Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm border border-slate-300 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-900" />
            <div className="w-3 h-3 rounded-sm bg-[#9be9a8] dark:bg-[#0e4429]" />
            <div className="w-3 h-3 rounded-sm bg-[#40c463] dark:bg-[#11632b]" />
            <div className="w-3 h-3 rounded-sm bg-[#30a14e] dark:bg-[#0b6d30]" />
            <div className="w-3 h-3 rounded-sm bg-[#216e39] dark:bg-[#0b4924]" />
          </div>
          <span className="font-semibold">More</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 min-w-0">
      <section className="bento-card min-w-0 border-border p-4 sm:p-6 shadow-2xl shadow-sky-500/10 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-600/90">System Telemetry</p>
            <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">Live Stats</h3>
            <div className="mt-2 flex items-center gap-2">
              {getDeviceIcon(deviceType)}
              <span className="text-sm font-semibold text-blue-500">{deviceType}</span>
            </div>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
            <Cpu size={24} />
          </div>
        </div>

        <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">CPU Load</span>
              <span className="font-mono">{Math.round(systemMetrics.cpuLoad * 100)}%</span>
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
              <span className="font-mono">{Math.round(systemMetrics.memoryLoad * 100)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.round(systemMetrics.memoryLoad * 100)}%` }}
              />
            </div>
            {ramAllocation.total > 0 && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {ramAllocation.used.toFixed(2)} GB / {ramAllocation.total.toFixed(2)} GB
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Network Quality</span>
              <span className="font-mono">{Math.round(systemMetrics.networkLoad * 100)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.round(systemMetrics.networkLoad * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-green-500/10 bg-green-500/5 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Network Speed</span>
              <span className="font-mono text-lg font-bold text-green-600">{Math.round(systemMetrics.networkSpeed)} Mbps</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Download Speed</div>
            {networkSpeedHistory.length > 1 && (
              <div className="text-zinc-600 dark:text-zinc-400">
                {renderNetworkSpeedGraph(networkSpeedHistory)}
              </div>
            )}
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              RTT: {hardware.rtt ? `${Math.round(hardware.rtt)}ms` : '—'} | Downlink: {hardware.downlink ? `${hardware.downlink}Mbps` : '—'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-blue-600">Threads (CPU)</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{hardware.cpu || 'Auto'}</p>
            </div>
            <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Total RAM</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{hardware.ram ? `${hardware.ram} GB` : memoryUsage}</p>
            </div>
          </div>

          {battery && (deviceType === 'Mobile' || deviceType === 'Tablet') && (
            <div className="rounded-3xl border border-yellow-500/10 bg-yellow-500/5 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {battery.charging ? (
                    <Zap className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Battery className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-semibold">Battery</span>
                </div>
                <span className="font-mono text-lg font-bold text-yellow-600">{Math.round(battery.level * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    battery.level > 0.5
                      ? 'bg-yellow-500'
                      : battery.level > 0.2
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${battery.level * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {battery.charging ? '⚡ Charging' : '🔋 On Battery'}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-3xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-200">
            All stats reflect the active {deviceType.toLowerCase()} currently viewing this page.
          </div>
        </div>
      </section>

      <section className="bento-card min-w-0 border-border p-4 sm:p-6 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-500/90">Project Network</p>
            <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">Live Project Pulse</h3>
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
                      : project.status === 'Under-development'
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
                  <span>{project.status === 'Under-development' ? 'Under development' : formatLatency(project.latency)}</span>
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

      <section className="bento-card min-w-0 border-border p-4 sm:p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-500/90">Live Weather</p>
            <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">Current Conditions</h3>
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

      <section className="bento-card min-w-0 border-border p-4 sm:p-6 shadow-2xl shadow-orange-500/10 backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600/90">Developer Stats</p>
            <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">GitHub Profile</h3>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-500">
            <Github size={24} />
          </div>
        </div>

        {loadingGithub ? (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading GitHub data...</p>
          </div>
        ) : githubStats ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-4">
              <div className="flex items-center gap-4">
                {githubStats.avatarUrl && (
                  <img 
                    src={githubStats.avatarUrl} 
                    alt={githubStats.username}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{githubStats.username}</p>
                  <a 
                    href={githubStats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:underline"
                  >
                    github.com/{githubStats.username}
                  </a>
                  {githubStats.latestActivity && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {githubStats.latestActivity}
                    </p>
                  )}
                </div>
              </div>
           
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Public Repos</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{githubStats.publicRepos}</p>
              </div>
              <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Followers</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={16} />
                  {githubStats.followers}
                </p>
              </div>
              <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Following</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{githubStats.following}</p>
              </div>
              <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Total contributions</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch size={16} />
                  {githubStats.totalContributions}
                </p>
              </div>
              <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Contributions this year</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch size={16} />
                  {githubStats.contributionsThisYear}
                </p>
              </div>
            </div>
            <ContributionsHeatmap />

            <a
              href={githubStats.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-3xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-center text-sm font-semibold text-orange-600 hover:bg-orange-500/20 transition-all"
            >
              Visit GitHub Profile →
            </a>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-red-500 dark:text-red-400">Failed to load GitHub data</p>
          </div>
        )}
      </section>
    </div>
  );
}
