'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { 
  Github, Mail, ExternalLink, Moon, Sun, Music, Download
} from 'lucide-react';
import LiveDashboard from '@/components/LiveDashboard';
import LoadingScreen from '@/components/loading';

const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false });

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl ${className}`} />
);

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const fullText = "Hi, I am Rhandell Cangayo";

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setLoading(false), 5500);
    
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(typing);
    };
  }, []);

  if (!mounted) return null;

  return (
    // Tinanggal ko yung snap-y snap-mandatory para mas natural yung scroll
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 scroll-smooth">
      {loading && <LoadingScreen />}

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-40 site-nav bg-background/50 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <a href="#home" className="flex items-center gap-3 group">
            <img 
              src="/imag/logo1.jpg" 
              alt="RCDC Logo" 
              className="h-10 w-10 rounded-xl object-cover border border-border shadow-sm group-hover:scale-110 transition-transform" 
            />
            <span className="font-black text-xl tracking-tighter hidden sm:block uppercase">Rhandell's<span className="text-blue-600"> portfolio</span></span>
          </a>

          {/* Adjusted gap and font weight para hindi "lonely" tignan yung dalawang nav links */}
          <div className="flex items-center gap-10">
            <div className="hidden md:flex gap-10 text-[11px] font-black tracking-[0.25em] text-muted">
              <a href="#home" className="hover:text-blue-600 transition-colors uppercase">Home</a>
              <a href="#portfolio" className="hover:text-blue-600 transition-colors uppercase">Portfolio</a>
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-border glass-btn hover-neon transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-600" />}
            </button>
          </div>
        </div>
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
                  <h1  className="hero-top text-4xl sm:text-3xl md:text-3xl lg:text-7xl font-black tracking-tighter leading-[1] lg:leading-[0.9] uppercase"><span className="text-muted">Aspiring</span> </h1>
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
                    <a href="https://github.com/RhandellCangayo" target="_blank" className="p-4 border border-border rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"><Github size={20} /></a>
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

      {/* --- SECTION 2: LIVE DASHBOARD --- */}
      <section id="dashboard" className="w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_28%)] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.45em] text-blue-600/90">Live Intelligence</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Telemetry, Network, & Weather</h2>
              <p className="max-w-2xl text-muted">
                Real time status of your device, my portfolio availability, and the latest weather updates.
              </p>
            </div>
      
          </div>

          <LiveDashboard />
        </div>
      </section>

      {/* --- SECTION 3: PORTFOLIO --- */}
<section id="portfolio" className="min-h-screen w-full flex items-center justify-center p-6 py-32 bg-white/90 dark:bg-transparent">
  <div className="max-w-7xl w-full space-y-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-10">
      <div className="space-y-2">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
          My <br /> <span className="text-blue-600">Works.</span>
        </h2>
        <p className="text-muted font-medium max-w-md">
          Focused on performance and user utility.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* PROJECT 1: SHELTCARE (CAPSTONE) - FULL IMAGE DESIGN */}
      <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border shadow-md hover:shadow-2xl transition-all duration-500">
        {/* Full Image Background */}
        <img 
          src="/imag/maxx.jfif" 
          alt="SheltCare Preview"
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Capstone Badge */}
        <div className="absolute top-6 left-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border z-10">
            <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Capstone Project • PDM • 2025 - 2026</span>
        </div>

        {/* Blurred Bottom Overlay (Text Container) */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 via-black/6 to-transparent dark:from-black/80 dark:via-black/60 backdrop-blur-md p-8 flex flex-col justify-end text-white">
          <div className="space-y-4">
            
            {/* Title & Stacks */}
            <div className="space-y-1.5">
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">SheltCare System</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {['PHP', 'MySQL', 'ESP32', 'IoT'].map(t => (
                  <span key={t} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-lg border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
                <p className="text-white/90 text-sm leading-relaxed max-w-lg">
              SHELTCARE is a web system featuring adoption, donation, visitation, and sponsorship functionalities. It integrates IoT sensors for temperature and humidity detection with automatic and manual humidifier controls, ensuring pets have a comfortable environment. Developed for Maxx's Furry Friends animal shelter.
            </p>

            {/* Developers List - No Roles */}
            <div className="pt-4 border-t border-white/10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Developed By:</p>
            <div className="text-[11px] font-medium text-white/80 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>Justine Karl B. Cortezano</span>
                    <span>• Clarence S. Castro</span>
                    <span>• Diana Rose G. Capellan</span>
                    <span className="text-blue-400 font-bold">• Rhandell D. Cangayo</span>
                </div>
            </div>
          </div>
          
          {/* External Link Hover */}
          <a href="https://maxxfurryfriends.com/website/website_interface/MainPage.php" target="_blank" className="absolute top-4 right-8 h-12 w-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={20} className="text-white" />
          </a>
        </div>
      </div>

      {/* PROJECT 2: MUSICIANA - FULL IMAGE DESIGN */}
      <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border shadow-md hover:shadow-2xl transition-all duration-500">
        <img 
          src="/imag/musiciana_preview.jpg" 
          alt="Musiciana Preview"
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className="absolute top-6 left-6 bg-red-600 px-4 py-2 rounded-full border border-red-700 z-10 shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Under Development</span>
        </div>

        {/* Blurred Bottom Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/90 via-white/60 to-transparent dark:from-emerald-950/90 dark:via-emerald-950/70 backdrop-blur-lg p-8 flex flex-col justify-end text-white">
          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Musiciana</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Supabase', 'React', 'Next.js'].map(t => (
                  <span key={t} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-lg border border-white/10 text-emerald-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-white/85 text-sm leading-relaxed max-w-lg">
              Cloud-based music streaming engine with real-time database synchronization and sleek user interface inspired by modern platforms.
            </p>

            <div className="pt-4 border-t border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Developed By:</p>
              <div className="text-[11px] font-medium text-white/80 flex flex-wrap gap-x-3 gap-y-0.5">
                <span className="text-white font-bold">• Rhandell D. Cangayo</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-8 h-12 w-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/10">
            <Music size={20} className="text-emerald-300" />
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
      <Chatbot />
    </div>
  );
}