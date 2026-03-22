'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { 
  Github, Mail, ExternalLink, Moon, Sun, 
  Music, PawPrint, Cpu, Code2, 
  MessageSquare, Wrench, Briefcase, Plus,
  Phone, MapPin, Facebook, Download, Layers3
} from 'lucide-react';

const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false });

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl ${className}`} />
);

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMoreSkills, setShowMoreSkills] = useState(false);
  const [text, setText] = useState('');
  const fullText = "Hi, I am Rhandell Cangayo";

  // Typewriter Logic
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    
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

  const mainSkills = ['PHP', 'MySQL', 'Firebase', 'Java'];
  const extraSkills = ['Flutter', 'Dart', 'Python', 'Unity3D', 'Unreal Engine', 'ESP32', 'C#', 'Next.js'];

  if (!mounted) return null;

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-background text-foreground selection:bg-blue-500/30">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <a href="#home" className="flex items-center gap-3 group">
            <img 
              src="/imag/LOGO.jpg" 
              alt="RCDC Logo" 
              className="h-10 w-10 rounded-xl object-cover border border-border shadow-sm group-hover:scale-110 transition-transform" 
            />
            <span className="font-black text-xl tracking-tighter hidden sm:block uppercase">RC<span className="text-blue-600">.</span></span>
          </a>

          <div className="hidden md:flex gap-8 text-[10px] font-black tracking-[0.2em] text-zinc-500">
            <a href="#home" className="hover:text-blue-600 transition-colors uppercase">Home</a>
            <a href="#about" className="hover:text-blue-600 transition-colors uppercase">About</a>
            <a href="#portfolio" className="hover:text-blue-600 transition-colors uppercase">Portfolio</a>
          </div>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
          </button>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section id="home" className="h-screen w-full snap-start flex items-center justify-center p-6 pt-20">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
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
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                    WEB & SYSTEM <br />
                    <span className="text-zinc-300 dark:text-zinc-800">Developer.</span>
                  </h1>
                </div>
                
                <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
                  4th Year IT Student at <span className="text-foreground font-bold underline decoration-blue-500 underline-offset-4">PDM</span>. Dedicated to crafting seamless user experiences through robust backend logic and optimized hardware infrastructure.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    Download CV <Download size={16} />
                  </button>
                  <div className="flex gap-2">
                    <a href="https://github.com/RhandellCangayo" target="_blank" className="p-4 border border-border rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"><Github size={20} /></a>
                    <a href="mailto:cangayorhandell15@gmail.com" className="p-4 border border-border rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"><Mail size={20} /></a>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Tilted & Larger Profile Image Container */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            {loading ? (
              <Skeleton className="aspect-[3/4] rounded-[3.5rem] w-full" />
            ) : (
              <div className="relative group w-full max-w-[450px]">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-700"></div>
                {/* rotate-3 adds the tilt, aspect-[3/4] makes it larger vertically */}
                <div className="relative aspect-[3/4] rounded-[3.5rem] bg-zinc-900 border-4 border-white/5 overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-0 rotate-3 group-hover:scale-[1.02]">
                    <img 
                      src={theme === 'dark' ? '/imag/school.jpg' : '/imag/me2.jpg'} 
                      alt="Profile"
                      className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: ABOUT & CONTACT HUB --- */}
      <section id="about" className="h-screen w-full snap-start flex items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Internship Card */}
            <div className="lg:col-span-4 h-full">
              {loading ? <Skeleton className="h-full min-h-[350px] rounded-[2.5rem]" /> : (
                <div className="h-full p-8 rounded-[2.5rem] bg-zinc-900 text-white border border-white/5 h-full flex flex-col justify-between shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700 text-blue-500">
                    <Briefcase size={200} />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Internship Status</h3>
                      <p className="text-3xl font-bold mt-1 leading-tight">Goodyear Container Corp</p>
                      <p className="text-zinc-400 font-medium italic text-sm">System Developer</p>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Currently developing internal manufacturing systems as part of my internship requirements.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Since Jan 2026</span>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dashboard Card */}
            <div className="lg:col-span-8">
              {loading ? <Skeleton className="h-full min-h-[350px] rounded-[2.5rem]" /> : (
                <div className="p-10 rounded-[2.5rem] bg-zinc-900 text-white border border-white/5 h-full flex flex-col justify-center space-y-8 shadow-xl hover:border-blue-500/50 transition-all duration-500">
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Professional Profile</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                      As a 4th-year IT student at <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">Pambayang Dalubhasaan ng Marilao (PDM)</span>, I'm focused on balancing complex Web & System Development, IOT and Hardware Maintenance, ensuring solving real-world problems.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-zinc-800/30 items-center hover:border-blue-500 transition-all group">
                      <div className="text-blue-500 group-hover:scale-110 transition-transform"><Layers3 size={24}/></div>
                      <div>
                        <h4 className="font-bold text-sm">Architecture</h4>
                        <p className="text-[10px] text-zinc-500">Scalable backend & API design.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-zinc-800/30 items-center hover:border-orange-500 transition-all group">
                      <div className="text-orange-500 group-hover:scale-110 transition-transform"><Wrench size={24}/></div>
                      <div>
                        <h4 className="font-bold text-sm">Infrastructure</h4>
                        <p className="text-[10px] text-zinc-500">Hardware tuning & diagnostics.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-zinc-800/30 items-center hover:border-emerald-500 transition-all group">
                      <div className="text-emerald-500 group-hover:scale-110 transition-transform"><Cpu size={24}/></div>
                      <div>
                        <h4 className="font-bold text-sm">System Logic</h4>
                        <p className="text-[10px] text-zinc-500">Core algorithms & database optimization.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-zinc-800/30 items-start hover:border-purple-500 transition-all group min-h-[110px]">
                      <div className="text-purple-500 mt-1"><Code2 size={24}/></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-sm">Tech Stack</h4>
                          <button onClick={() => setShowMoreSkills(!showMoreSkills)} className="p-1.5 hover:bg-zinc-700 rounded-lg transition-all">
                            <Plus size={14} className={`transition-transform duration-500 ${showMoreSkills ? 'rotate-45' : ''}`} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                           {mainSkills.map(s => (
                             <span key={s} className="text-[9px] font-black px-2 py-0.5 bg-zinc-700 rounded uppercase tracking-tighter border border-white/5">{s}</span>
                           ))}
                           {showMoreSkills && extraSkills.map(s => (
                             <span key={s} className="text-[9px] font-black px-2 py-0.5 bg-blue-600 rounded uppercase tracking-tighter animate-in fade-in zoom-in duration-300">{s}</span>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="mailto:cangayorhandell15@gmail.com" className="p-6 rounded-[2rem] bg-zinc-900 text-white border border-white/5 hover:border-orange-500 transition-all group shadow-lg">
              <Mail className="text-orange-500 mb-2" size={20} />
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Email</p>
              <p className="text-xs font-bold truncate mt-1 text-zinc-100">cangayorhandell15@gmail.com</p>
            </a>
            <div className="p-6 rounded-[2rem] bg-zinc-900 text-white border border-white/5 hover:border-emerald-500 transition-all group shadow-lg">
              <Phone className="text-emerald-500 mb-2" size={20} />
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Phone</p>
              <p className="text-xs font-bold mt-1 text-zinc-100">0929 384 2663</p>
            </div>
            <a href="https://facebook.com/rhandell.cangayo" target="_blank" className="p-6 rounded-[2rem] bg-zinc-900 text-white border border-white/5 hover:border-blue-500 transition-all group shadow-lg">
              <Facebook className="text-blue-500 mb-2" size={20} />
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Facebook</p>
              <p className="text-xs font-bold mt-1 uppercase text-zinc-100">Rhandell Cangayo</p>
            </a>
            <div className="p-6 rounded-[2rem] bg-zinc-900 text-white border border-white/5 hover:border-zinc-400 transition-all group shadow-lg">
              <MapPin className="text-zinc-400 mb-2" size={20} />
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Location</p>
              <p className="text-xs font-bold mt-1 text-zinc-300">Marilao, Bulacan</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: PORTFOLIO --- */}
      <section id="portfolio" className="h-screen w-full snap-start flex items-center justify-center p-6">
        <div className="max-w-7xl w-full space-y-8">
          <div>
            <h2 className="text-5xl font-black tracking-tight uppercase">Technical Projects</h2>
            <p className="text-zinc-500 font-medium">Built for performance and utility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 p-1 rounded-[2.5rem] bg-gradient-to-b from-border to-transparent hover:from-blue-500 transition-all duration-500 group">
              <div className="bg-card rounded-[2.4rem] p-10 h-full flex flex-col justify-between relative overflow-hidden border border-border">
                <div className="relative z-10 space-y-6">
                  <PawPrint className="text-blue-500 group-hover:scale-110 transition-transform" size={40} />
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight uppercase">SheltCare System</h3>
                    <p className="text-zinc-500 mt-2 text-sm max-w-sm leading-relaxed">Comprehensive pet shelter management with environmental monitoring.</p>
                  </div>
                  <div className="flex gap-2">
                    {['PHP', 'MySQL', 'ESP32'].map(t => (
                      <span key={t} className="px-3 py-1 bg-background rounded-lg text-[10px] font-black border border-border uppercase">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="relative z-10 pt-8 flex items-center gap-2 font-black text-xs group-hover:text-blue-500 transition-colors uppercase tracking-widest cursor-pointer">
                  View Project <ExternalLink size={14} />
                </div>
              </div>
            </div>

            <div className="md:col-span-5 p-1 rounded-[2.5rem] bg-gradient-to-b from-border to-transparent hover:from-emerald-500 transition-all duration-500 group">
              <div className="bg-card rounded-[2.4rem] p-10 h-full flex flex-col justify-between border border-border">
                <div className="space-y-6">
                  <Music className="text-emerald-500 group-hover:scale-110 transition-transform" size={40} />
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight uppercase">Musiciana</h3>
                    <p className="text-zinc-500 mt-2 text-sm leading-relaxed">Cloud-based music streaming engine.</p>
                  </div>
                  <div className="flex gap-2">
                    {['Supabase', 'React', 'Firebase'].map(t => (
                      <span key={t} className="px-3 py-1 bg-background rounded-lg text-[10px] font-black border border-border uppercase">{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-8">Deployment 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
}