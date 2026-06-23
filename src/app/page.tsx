'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { 
  Github, Mail, ExternalLink, Moon, Sun, Music, Download, Menu, X, ChevronDown, Activity, Terminal
} from 'lucide-react';
import LiveDashboard from '@/components/LiveDashboard';
import DiscordEmbed from '@/components/DiscordEmbed';
import LoadingScreen from '@/components/loading';
import Skills from '@/components/Skills'; // Bagong file na ginawa mo sa itaas


const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false });

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl ${className}`} />
);

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [expandedCard, setExpandedCard] = useState<'sheltcare' | 'musiciana' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'telemetry' | 'pulse' | 'weather' | 'github'>('telemetry');
  const [activeCategory, setActiveCategory] = useState<'telemetry' | 'pulse' | 'weather' | 'github'>('telemetry');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const fullText = "Hi, I am Rhandell Cangayo";

  useEffect(() => {
    setMounted(true);
    const hasSeenLoading = sessionStorage.getItem('rcdcLoadingShown') === '1';

    if (!hasSeenLoading) {
      const timer = window.setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('rcdcLoadingShown', '1');
      }, 8000);

      const cleanupTimeout = () => window.clearTimeout(timer);
      let i = 0;
      const typing = setInterval(() => {
        setText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(typing);
      }, 100);

      return () => {
        cleanupTimeout();
        clearInterval(typing);
      };
    }

    setLoading(false);
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 100);

    return () => clearInterval(typing);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 scroll-smooth overflow-x-hidden relative">
      {loading && <LoadingScreen />}

     {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-40 site-nav bg-background/50 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <img 
              src="/imag/logo1.jpg" 
              alt="RCDC Logo" 
              className="h-10 w-10 rounded-xl object-cover border border-border shadow-sm group-hover:scale-110 transition-transform" 
            />
            <span className="font-black text-xl tracking-tighter hidden sm:block uppercase">Rhandell's<span className="text-blue-600"> portfolio</span></span>
          </button>

          {/* Desktop Navigation & Controls */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-10 text-[11px] font-black tracking-[0.25em] text-muted">
              <a href="#home" className="hover:text-blue-600 transition-colors uppercase">Home</a>
               {/* Idinagdag na Skills link para sa Desktop */}
              <a href="#skills" className="hover:text-blue-600 transition-colors uppercase">Skills</a>
              <a href="#portfolio" className="hover:text-blue-600 transition-colors uppercase">Projects</a>
             
              
              {/* Desktop Dashboard Nav Trigger */}
              <button 
                onClick={() => setDashboardOpen(true)} 
                className="hover:text-blue-600 text-[11px] font-black tracking-[0.25em] text-muted transition-colors uppercase flex items-center gap-1"
              >
                Live Stats <Activity size={12} />
              </button>
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-border glass-btn hover-neon transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-600" />}
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-border glass-btn hover-neon transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border glass-btn hover-neon transition-all shadow-sm"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-4 flex flex-col">
              <a 
                href="#home" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold tracking-[0.2em] text-muted hover:text-blue-600 transition-colors uppercase"
              >
                Home
              </a>

                 <a 
                href="#skills" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold tracking-[0.2em] text-muted hover:text-blue-600 transition-colors uppercase"
              >
                Skills
              </a>
              <a 
                href="#portfolio" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold tracking-[0.2em] text-muted hover:text-blue-600 transition-colors uppercase"
              >
                Projects
              </a>
              {/* Idinagdag na Skills link para sa Mobile */}
           
              <button 
                onClick={() => { setMobileMenuOpen(false); setDashboardOpen(true); }}
                className="text-left text-sm font-bold tracking-[0.2em] text-muted hover:text-blue-600 transition-colors uppercase flex items-center gap-2"
              >
                Live Stats <Activity size={14} />
              </button>
            </div>
          </div>
        )}
      </nav>

       {/* --- SECTION 1: HERO --- */}
      <section id="home" className="min-h-screen w-full flex items-center justify-center p-6 pt-32 pb-20">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-8">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-3/4" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-blue-600 font-mono text-sm font-bold tracking-[0.3em] uppercase min-h-[20px]">
                    {text}<span className="animate-pulse">|</span>
                  </p>
                  <h1 className="hero-top text-4xl sm:text-3xl md:text-3xl lg:text-7xl font-black tracking-tighter leading-[1] lg:leading-[0.9] uppercase"><span className="text-muted">Aspiring</span> </h1>
                  <h1 className="hero-main text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1] lg:leading-[0.9] uppercase">
                    Software Engineer <br />
                  </h1>
                </div>
                
                <p className="text-muted text-base md:text-lg max-w-2xl leading-relaxed font-medium">
                  A recent graduate and an aspiring software engineer. I highly value continuous learning and innovation, with a strong belief in the power of technology to create meaningful impact.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <a href="/RESUME/rhandell_CV.pdf" download className="btn-primary active:scale-95 transition-all w-full sm:w-auto justify-center">
                    Download CV <Download size={16} />
                  </a>
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                    <a href="https://github.com/cangayorhandell15" target="_blank" rel="noreferrer" className="p-4 border border-border rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"><Github size={20} /></a>
                    <a href="mailto:cangayorhandell15@gmail.com" className="p-4 border border-border rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"><Mail size={20} /></a>
                  
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="order-1 lg:order-2 lg:col-span-5 relative flex justify-center lg:justify-end">
            {loading ? (
              <Skeleton className="aspect-[3/4] rounded-[3.5rem] w-full max-w-[350px] lg:max-w-[450px]" />
            ) : (
              <div className="relative group w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[450px] profile-frame neon-outline radial-highlight">
                <div className="absolute -inset-4 rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-700" style={{background: 'linear-gradient(90deg, rgba(0,229,255,0.06), rgba(124,92,255,0.06))'}}></div>
                <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-0 rotate-3 group-hover:scale-[1.02]">
                  <img 
                    src={theme === 'dark' ? '/imag/barong1.png' : '/imag/toga1.png'} 
                    alt="Profile"
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

{/* --- SECTION 2: SKILLS --- */}
      <Skills />

      {/* --- SECTION 3: PORTFOLIO --- */}
<section id="portfolio" className="min-h-screen w-full flex items-center justify-center p-6 py-20 md:py-32 bg-white/90 dark:bg-transparent">
  <div className="max-w-7xl w-full space-y-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-10">
      <div className="space-y-2">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
          Featured <br /> <span className="text-blue-600">Projects</span>
        </h2>
        <p className="text-muted font-medium max-w-md">
          Focused on performance and user utility.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* PROJECT 1: SHELTCARE (CAPSTONE) */}
      <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border shadow-md hover:shadow-2xl transition-all duration-500">
        <img 
          src="/imag/maxx.jfif" 
          alt="SheltCare Preview"
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-1.5 z-10">
          <span className="bg-blue-600/90 px-3.5 py-1.5 rounded-full border border-blue-400/20 shadow-lg text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>Capstone • 2025 - 2026</span>
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/50 to-transparent backdrop-blur-md p-4 sm:p-6 flex flex-col justify-end text-white">
          <div className="space-y-2.5">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter leading-none drop-shadow-lg">SheltCare</h3>
              
              <a 
                href="https://maxxfurryfriends.com/website/website_interface/MainPage.php"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-300/90 font-mono hover:underline block truncate max-w-[220px] sm:max-w-xs mb-1"
              >
                maxxfurryfriends.com
              </a>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-blue-300">PHP</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-blue-300">MySQL</span>
                <span className={`${expandedCard === 'sheltcare' ? 'inline-flex' : 'hidden sm:inline-flex'} px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-cyan-300`}>ESP32</span>
                <span className={`${expandedCard === 'sheltcare' ? 'inline-flex' : 'hidden sm:inline-flex'} px-1.5 py-0.5 bg-orange-500/20 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-orange-500/20 text-orange-300`}>IoT</span>
              </div>
            </div>
            
            {/* Description */}
            <p className={`${expandedCard === 'sheltcare' ? 'block' : 'hidden sm:block'} text-white/90 text-xs leading-relaxed max-w-full drop-shadow-md`}>
              Web-based shelter management system that streamlines core operations like donation, adoption, and visitation. Integrated with an IoT-driven environmental monitoring system.
            </p>

            {/* Tech Specs Block */}
            <div className={`${expandedCard === 'sheltcare' ? 'block' : 'hidden sm:block'} text-[10px] text-zinc-300/90 font-mono space-y-0.5 bg-black/20 p-2 rounded-xl border border-white/5`}>
              <div>⚡ Shelter Management and IoT Environmental Monitoring</div>
              <div>⏱️ Automated Humidifier Control</div>
              <div>🛡️ Real-time Environmental Alerts</div>
            </div>
            
            {/* Developers Section */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/70 mb-0.5">Devs:</p>
                
                {/* Desktop View */}
                <div className="text-[10px] font-medium text-white/80 hidden sm:flex flex-wrap gap-1">
                  <span>J.K. Cortezano,</span>
                  <span>C. Castro,</span>
                  <span>D.R. Capellan,</span>
                  <span className="text-blue-400 font-bold">R.D. Cangayo</span>
                </div>
                
                {/* Mobile Expanded View */}
                <div className={`${expandedCard === 'sheltcare' ? 'flex' : 'hidden'} text-[10px] font-medium text-white/80 sm:hidden flex-wrap gap-1`}>
                  <span>J.K. Cortezano, Castro, Capellan,</span>
                  <span className="text-blue-400 font-bold">R.D. Cangayo</span>
                </div>

                {/* Mobile Collapsed View */}
                <div className={`${expandedCard === 'sheltcare' ? 'hidden' : 'flex'} text-[10px] font-medium text-white/80 sm:hidden`}>
                  <span className="text-blue-400 font-bold">Rhandell D.</span>
                  <span className="text-white/60"> +3 more</span>
                </div>

                {/* Dynamic Button */}
                <button
                  type="button"
                  onClick={() => setExpandedCard(expandedCard === 'sheltcare' ? null : 'sheltcare')}
                  className="mt-2 sm:hidden text-[9px] font-bold uppercase tracking-[0.1em] text-blue-300 block"
                >
                  {expandedCard === 'sheltcare' ? '↑ Hide info' : '↓ View info'}
                </button>
              </div>
            </div>
          </div>
          
          <a href="https://maxxfurryfriends.com/website/website_interface/MainPage.php" target="_blank" rel="noreferrer" className="absolute top-4 right-4 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={18} className="text-blue-300" />
          </a>
        </div>
      </div>

      {/* PROJECT 2: MUSICIANA */}
      <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border shadow-md hover:shadow-2xl transition-all duration-500">
        <img 
          src="/imag/music.png" 
          alt="Musiciana Preview"
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-1.5 z-10">
          <span className="bg-emerald-500/90 dark:bg-emerald-600/90 px-3.5 py-1.5 rounded-full border border-emerald-400/20 shadow-lg text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>Live Production</span>
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/50 to-transparent backdrop-blur-md p-4 sm:p-6 flex flex-col justify-end text-white">
          <div className="space-y-2.5">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter leading-none drop-shadow-lg">Musiciana</h3>
              
              <a 
                href="https://rhandell-musiciana-tjxh.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-300/90 font-mono hover:underline block truncate max-w-[220px] sm:max-w-xs mb-1"
              >
                rhandell-musiciana-tjxh.vercel.app
              </a>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-emerald-300">Next.js</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-emerald-300">React</span>
                <span className={`${expandedCard === 'musiciana' ? 'inline-flex' : 'hidden sm:inline-flex'} px-1.5 py-0.5 bg-white/10 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-white/5 text-cyan-300`}>Supabase</span>
                <span className={`${expandedCard === 'musiciana' ? 'inline-flex' : 'hidden sm:inline-flex'} px-1.5 py-0.5 bg-red-500/20 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-lg border border-red-500/20 text-red-300`}>Security</span>
              </div>
            </div>
            
            {/* Description */}
            <p className={`${expandedCard === 'musiciana' ? 'block' : 'hidden sm:block'} text-white/90 text-xs leading-relaxed max-w-full drop-shadow-md`}>
              Web-based karaoke engine featuring dynamic party rooms. Anyone can scan the QR code to join the session, manage catalogs, and inject tracks.
            </p>

            {/* Tech Specs Block */}
            <div className={`${expandedCard === 'musiciana' ? 'block' : 'hidden sm:block'} text-[10px] text-zinc-300/90 font-mono space-y-0.5 bg-black/20 p-2 rounded-xl border border-white/5`}>
              <div>⚡ Supabase Rate Limiting</div>
              <div>⏱️ Scheduled Cron Jobs</div>
              <div>🛡️ SQL Injection & CSRF Protection</div>
            </div>
            
            {/* Developers Section */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/70 mb-0.5">Dev:</p>
                
                {/* Desktop and Mobile Expanded View */}
                <div className="text-[10px] font-medium text-white/80">
                  <span className="text-white font-bold">• Rhandell D. Cangayo</span>
                </div>

                {/* Dynamic Button */}
                <button
                  type="button"
                  onClick={() => setExpandedCard(expandedCard === 'musiciana' ? null : 'musiciana')}
                  className="mt-2 sm:hidden text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300 block"
                >
                  {expandedCard === 'musiciana' ? '↑ Hide info' : '↓ View info'}
                </button>
              </div>
            </div>
          </div>
          
          <a href="https://rhandell-musiciana-tjxh.vercel.app" target="_blank" rel="noreferrer" className="absolute top-4 right-4 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={18} className="text-emerald-300" />
          </a>
        </div>
      </div>

    </div>
  </div>
</section>

     {/* --- FIXED SLIDING DRAWER: TELEMETRY & INTEL --- */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:max-w-[450px] md:max-w-[500px] bg-background/95 backdrop-blur-2xl border-l border-border shadow-2xl z-50 transition-transform duration-500 ease-in-out flex flex-col ${
          dashboardOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-blue-600 font-bold mb-1">System Intelligence Module</p>
              <h3 className="text-lg font-black tracking-tight uppercase">Live Environment Status</h3>
            </div>
            <button 
              onClick={() => setDashboardOpen(false)}
              className="p-2 rounded-xl border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold font-mono"
            >
              <X size={14} /> CLOSE
            </button>
          </div>

          {/* --- FIXED CATEGORY TABS CONTAINER (NO SCROLLBAR) --- */}
          {/* 🛠️ Ginawang grid-cols-2 para laging sakop ang espasyo at walang scrollbar kahit sa mobile */}
          <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-4">
            <button
              onClick={() => setFilter('telemetry')}
              className={`px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider text-center transition-all border ${
                filter === 'telemetry'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.01]'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted border-border hover:text-foreground'
              }`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setFilter('pulse')}
              className={`px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider text-center transition-all border ${
                filter === 'pulse'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.01]'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted border-border hover:text-foreground'
              }`}
            >
              Project Pulse
            </button>
            <button
              onClick={() => setFilter('weather')}
              className={`px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider text-center transition-all border ${
                filter === 'weather'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.01]'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted border-border hover:text-foreground'
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => setFilter('github')}
              className={`px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider text-center transition-all border ${
                filter === 'github'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.01]'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted border-border hover:text-foreground'
              }`}
            >
              GitHub Profile
            </button>
          </div>
        </div>

        {/* Scrollable Widget Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-zinc-50/20 dark:bg-zinc-950/10">
          {/* 🛠️ Dito natin pinwersa na mawala ang malaking space sa kanan sa pamamagitan ng pag-override sa grid ng LiveDashboard */}
          <div className="w-full [&>div]:grid-cols-1 [&>div>section]:w-full space-y-4">
            
            {/* Discord Embed (Telemetry Only) */}
            {filter === 'telemetry' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
                <DiscordEmbed clientId={process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!} open={dashboardOpen} />
              </div>
            )}

            {/* Live Dashboard (Laging full width na ito ngayon sa loob ng drawer mo) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
              <LiveDashboard filter={filter} />
            </div>

          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}