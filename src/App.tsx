import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, IndianRupee, Activity, 
  Calendar, Wallet, ArrowUpRight, ArrowDownRight,
  Database, LayoutDashboard, Trash2, LineChart as LineChartIcon, Rocket, Lock, Cloud,
  Copy, Check, MessageSquare, Search, Target, Sparkles, Loader2, Sun, Moon
} from 'lucide-react';

// --- Firebase Imports ---
import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from './firebase';

// --- AI Imports ---
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import gsap from 'gsap';

const appId = 'portfolio-tracker-pro';

// --- Elegant Particle Network Background ---
const InteractiveBackground = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: width / 2, y: height / 2, radius: 150 };
    let particles: any[] = [];

    const handleMouseMove = (e: MouseEvent) => { 
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    };

    const handleResize = () => { 
      width = canvas.width = window.innerWidth; 
      height = canvas.height = window.innerHeight; 
      initParticles();
    }; 

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
      angle: number;
      speed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * 360;
        this.speed = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? 'rgba(234, 179, 8, ' : 'rgba(6, 182, 212, '; 
      }
      
      update() {
        this.angle += 0.01;
        this.y += Math.sin(this.angle) * this.speed;
        this.x += Math.cos(this.angle) * this.speed;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 1) distance = 1;
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.color + '0.8)';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = (width * height) / 15000;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    const connect = () => {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          
          if (distance < (canvas.width / 10) * (canvas.height / 10)) {
            let opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = isDarkMode ? `rgba(255, 255, 255, ${opacityValue * 0.15})` : `rgba(0, 0, 0, ${opacityValue * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDarkMode ? '#050505' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
      glow.addColorStop(0, isDarkMode ? 'rgba(234, 179, 8, 0.05)' : 'rgba(234, 179, 8, 0.1)'); 
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 bg-slate-50 dark:bg-[#050505]" />;
};

// --- Interactive GSAP Logo ---
const AnimatedLogo = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shards = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      let cx, cy;
      if (i < 35) {
        const angle = (Math.PI / 4) + (i / 35) * (Math.PI * 1.7);
        const r = 12 + Math.random() * 6;
        cx = 32 + Math.cos(angle) * r;
        cy = 32 + Math.sin(angle) * r;
      } else {
        cx = 32 + Math.random() * 12;
        cy = 32 + (Math.random() - 0.5) * 4;
      }
      const size = Math.random() * 4 + 2;
      const pts = `${cx},${cy-size} ${cx+size},${cy+size} ${cx-size},${cy+size}`;
      return <polygon key={i} className="logo-shard" points={pts} fill={Math.random() > 0.5 ? '#eab308' : '#ca8a04'} opacity="0" />;
    });
  }, []);

  const handleClick = () => {
    if (isAnimating) return;

    if (clickCount === 0) {
      gsap.to('.logo-crack-1', { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' });
      setClickCount(1);
    } else if (clickCount === 1) {
      gsap.to('.logo-crack-2', { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' });
      setClickCount(2);
    } else if (clickCount === 2) {
      gsap.to('.logo-crack-3', { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' });
      setClickCount(3);
    } else if (clickCount === 3) {
      setIsAnimating(true);
      setClickCount(4);

      const tl = gsap.timeline();

      tl.to('.logo-solid-g, .logo-crack-1, .logo-crack-2, .logo-crack-3', { opacity: 0, duration: 0.1 });
      tl.to('.logo-shard', { opacity: 1, duration: 0.1 }, "<");

      tl.to('.logo-shard', {
        x: () => (Math.random() - 0.5) * 200,
        y: () => (Math.random() - 0.5) * 200,
        rotation: () => (Math.random() - 0.5) * 720,
        scale: () => Math.random() * 2 + 0.5,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: { amount: 0.1, from: "center" }
      }, "<");

      tl.to('.logo-shard', {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power4.inOut',
        delay: 1.5
      });

      tl.to('.logo-solid-g', { opacity: 1, duration: 0.1 });
      tl.to('.logo-shard', { opacity: 0, duration: 0.1 }, "<");
      tl.set('.logo-crack-1, .logo-crack-2, .logo-crack-3', { strokeDashoffset: 100, opacity: 1 });

      tl.call(() => {
        setClickCount(0);
        setIsAnimating(false);
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] overflow-visible shrink-0 cursor-pointer hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        <g>{shards}</g>
        <text 
          className="logo-solid-g"
          x="32" y="46" 
          fontFamily="Inter, system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="44" 
          textAnchor="middle" 
          fill="#eab308"
        >
          G
        </text>
        <g strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-50 dark:stroke-[#0d0d0d]">
          <path className="logo-crack-1" d="M 32 12 L 28 22 L 34 28 L 26 36" strokeDasharray="100" strokeDashoffset="100" />
          <path className="logo-crack-2" d="M 50 32 L 42 34 L 38 42 L 40 50" strokeDasharray="100" strokeDashoffset="100" />
          <path className="logo-crack-3" d="M 18 42 L 24 38 L 26 46 L 32 44" strokeDasharray="100" strokeDashoffset="100" />
        </g>
      </svg>
    </div>
  );
};

// --- UI Components ---
const MetricCard = ({ title, value, icon: Icon, subtext, trend, highlightColor = 'yellow' }: any) => {
  const colorClass = highlightColor === 'cyan' ? 'text-cyan-400' : 'text-yellow-500';
  const borderClass = highlightColor === 'cyan' ? 'hover:border-cyan-500/30' : 'hover:border-yellow-500/30';
  const glowClass = highlightColor === 'cyan' ? 'group-hover:bg-cyan-500/10' : 'group-hover:bg-yellow-500/10';
  const lineGlow = highlightColor === 'cyan' ? 'group-hover:bg-cyan-500/50' : 'group-hover:bg-yellow-500/50';

  return (
    <div className={`relative group overflow-hidden bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 md:p-6 border border-black/5 dark:border-white/5 transition-all duration-500 ${borderClass}`}>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-white/0 ${lineGlow} blur-[2px] transition-all duration-500`} />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs md:text-sm font-medium text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">{title}</h3>
        <div className={`p-2 bg-black/5 dark:bg-white/5 rounded-lg md:rounded-xl ${colorClass} group-hover:scale-110 ${glowClass} transition-all duration-300`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight truncate">{value}</div>
        {subtext && (
          <div className={`text-xs md:text-sm flex items-center gap-1.5 mt-2 font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'}`}>
            {trend === 'up' && <ArrowUpRight size={14} strokeWidth={2.5} />}
            {trend === 'down' && <ArrowDownRight size={14} strokeWidth={2.5} />}
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

const PromptCard = ({ title, content }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-black/5 dark:border-white/5 p-5 transition-all hover:border-yellow-500/30 group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 group-hover:text-slate-900 dark:text-white transition-colors truncate pr-2">{title || 'Untitled Prompt'}</h4>
        <button onClick={handleCopy} className={`p-2 rounded-lg transition-all shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/10'}`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="bg-gray-100 dark:bg-black/40 rounded-xl p-3 border border-black/5 dark:border-white/5 max-h-32 overflow-y-auto">
        <p className="text-xs text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

// --- Helpers ---
const calculateXIRR = (cashFlows: any[], guess = 0.1) => {
  if (cashFlows.length < 2) return null;
  const flows = [...cashFlows].sort((a, b) => a.date - b.date);
  const t0 = flows[0].date.getTime();
  const npv = (r: number) => flows.reduce((sum, cf) => {
    const days = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24);
    return sum + cf.amount / Math.pow(1 + r, days / 365);
  }, 0);
  const npvDerivative = (r: number) => flows.reduce((sum, cf) => {
    const days = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24);
    const years = days / 365;
    if (years === 0) return sum;
    return sum - (cf.amount * years) / Math.pow(1 + r, years + 1);
  }, 0);
  let r = guess;
  for (let iter = 0; iter < 100; iter++) {
    const fValue = npv(r);
    const fDeriv = npvDerivative(r);
    if (Math.abs(fValue) < 1e-6) return r;
    if (fDeriv === 0) break;
    r = r - fValue / fDeriv;
  }
  return isNaN(r) ? null : r;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const getPriceForDate = (dateStr: string, sortedBenchData: any[]) => {
  if (!sortedBenchData || sortedBenchData.length === 0) return 1; 
  const targetTime = new Date(dateStr).getTime();
  for (let i = sortedBenchData.length - 1; i >= 0; i--) {
    const bTime = new Date(sortedBenchData[i].date).getTime();
    if (bTime <= targetTime) return Number(sortedBenchData[i].price);
  }
  return Number(sortedBenchData[0].price);
};

const GeminiInsights = ({ metrics, transactions, prompts }: any) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);

  const handleAnalyze = async (isCustom: boolean) => {
    if (isCustom && !query.trim()) return;
    setLoading(true);
    setIsAuto(!isCustom);
    setResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const context = `
        You are an expert financial advisor AI embedded in a portfolio tracking app.
        Here is the user's current portfolio data:
        - Current Market Value: ₹${metrics.currentMV.toFixed(2)}
        - Total Net Deposits: ₹${metrics.net.toFixed(2)}
        - Unrealized P/L: ₹${metrics.pl.toFixed(2)}
        - XIRR (Annualized Return): ${(metrics.xirr * 100).toFixed(2)}%
        - Projected 10-Year Wealth: ₹${metrics.f10.toFixed(2)}
        
        ${isCustom ? `User Question: ${query}` : `Please provide a concise, insightful 3-paragraph analysis of their portfolio performance. Highlight strengths, potential risks, and a brief encouraging outlook. Format with markdown.`}
      `;
      
      const result = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: context,
      });
      setResponse(result.text || 'No response generated.');
    } catch (error) {
      console.error(error);
      setResponse('An error occurred while generating insights. Please try again.');
    }
    setLoading(false);
    setIsAuto(false);
  };

  return (
    <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-white/0 group-hover:bg-yellow-500/50 blur-[2px] transition-all duration-500" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
          <Sparkles size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">Gemini Intelligence</h3>
          <p className="text-xs text-zinc-500 font-medium">AI-powered portfolio analysis and insights</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(true)}
          placeholder="Ask Gemini about your portfolio..." 
          className="flex-1 bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-400 dark:text-zinc-600 font-medium"
        />
        <button 
          onClick={() => handleAnalyze(true)}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-all border border-black/5 dark:border-white/5 flex items-center justify-center min-w-[100px]"
        >
          {loading && !isAuto ? <Loader2 size={18} className="animate-spin" /> : 'Ask'}
        </button>
        <button 
          onClick={() => handleAnalyze(false)}
          disabled={loading}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-white dark:text-black text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center min-w-[140px]"
        >
          {loading && isAuto ? <Loader2 size={18} className="animate-spin" /> : 'Auto Analyze'}
        </button>
      </div>

      {(response || loading) && (
        <div className="bg-gray-100 dark:bg-black/40 rounded-xl p-5 border border-black/5 dark:border-white/5 min-h-[100px]">
          {loading && !response ? (
            <div className="flex items-center justify-center h-full text-yellow-500 py-8">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : (
            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed prose prose-invert max-w-none prose-p:mb-4 prose-headings:text-slate-900 dark:text-white prose-headings:font-bold prose-a:text-yellow-500 prose-strong:text-slate-900 dark:text-white">
              <Markdown>{response}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [promptSearch, setPromptSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const CORRECT_PIN = '1234'; 

  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [benchmarkHistory, setBenchmarkHistory] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loadingAuth && !user) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setAuthError("VITE_GOOGLE_CLIENT_ID is missing in environment variables.");
        return;
      }

      const handleCredentialResponse = async (response: any) => {
        try {
          const credential = GoogleAuthProvider.credential(response.credential);
          await signInWithCredential(auth, credential);
        } catch (error: any) {
          console.error("GSI Login failed", error);
          setAuthError(error.message);
        }
      };

      // @ts-ignore
      if (window.google) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          context: 'signin',
          ux_mode: 'popup',
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(
          document.getElementById("gsi-button-container"),
          { theme: isDarkMode ? "filled_black" : "outline", size: "large", shape: "pill" }
        );
      }
    }
  }, [loadingAuth, user, isDarkMode]);

  useEffect(() => {
    if (!user) return;
    const txnsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const histPath = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
    const benchPath = collection(db, 'artifacts', appId, 'users', user.uid, 'benchmark');
    const promptsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');

    const unsubTxns = onSnapshot(txnsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTransactions([...sorted, { id: crypto.randomUUID(), date: '', deposit: '', withdrawal: '' }]);
    });
    const unsubHist = onSnapshot(histPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPortfolioHistory([...sorted, { id: crypto.randomUUID(), date: '', marketValue: '' }]);
    });
    const unsubBench = onSnapshot(benchPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setBenchmarkHistory([...sorted, { id: crypto.randomUUID(), date: '', price: '' }]);
    });
    const unsubPrompts = onSnapshot(promptsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrompts([...data, { id: crypto.randomUUID(), title: '', content: '' }]);
    });
    return () => { unsubTxns(); unsubHist(); unsubBench(); unsubPrompts(); };
  }, [user]);

  const updateCloudDoc = async (collName: string, id: string, data: any) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    await setDoc(docRef, data, { merge: true });
  };
  const deleteCloudDoc = async (collName: string, id: string) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    await deleteDoc(docRef);
  };

  const handleTxnChange = (id: string, field: string, value: any) => {
    const row = transactions.find(t => t.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    if (updated.date && (updated.deposit !== '' || updated.withdrawal !== '')) updateCloudDoc('transactions', id, updated);
  };
  const handleMvChange = (id: string, field: string, value: any) => {
    const row = portfolioHistory.find(p => p.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    setPortfolioHistory(prev => prev.map(p => p.id === id ? updated : p));
    if (updated.date && updated.marketValue !== '') updateCloudDoc('history', id, updated);
  };
  const handleBmChange = (id: string, field: string, value: any) => {
    const row = benchmarkHistory.find(b => b.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    setBenchmarkHistory(prev => prev.map(b => b.id === id ? updated : b));
    if (updated.date && updated.price !== '') updateCloudDoc('benchmark', id, updated);
  };
  const handlePromptChange = (id: string, field: string, value: any) => {
    const row = prompts.find(p => p.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    setPrompts(prev => prev.map(p => p.id === id ? updated : p));
    if (updated.title && updated.content) updateCloudDoc('prompts', id, updated);
  };

  const handlePaste = async (e: any, collName: string, keys: string[]) => {
    const pastedData = (e.clipboardData || window.clipboardData).getData('Text');
    if (!pastedData || !pastedData.includes('\t')) return;
    e.preventDefault();
    const rows = pastedData.trim().split('\n');
    for (const row of rows) {
      const cols = row.split('\t').map((c: string) => c.trim());
      if (cols.length >= keys.length) {
        const id = crypto.randomUUID();
        const data: any = { id };
        keys.forEach((key, i) => {
          if (key === 'date') {
            const dp = cols[i].split(/[-/]/);
            if (dp.length === 3) data[key] = `${dp[2].length===2?'20'+dp[2]:dp[2]}-${dp[1].padStart(2,'0')}-${dp[0].padStart(2,'0')}`;
            else data[key] = cols[i];
          } else if (key === 'title' || key === 'content') data[key] = cols[i];
          else data[key] = cols[i] ? parseFloat(cols[i].replace(/[^0-9.-]+/g, "")) : "";
        });
        await updateCloudDoc(collName, id, data);
      }
    }
  };

  const validTxns = useMemo(() => transactions.filter(t => t.date && (t.deposit !== '' || t.withdrawal !== '')).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [transactions]);
  const validHistory = useMemo(() => portfolioHistory.filter(p => p.date && p.marketValue !== '').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [portfolioHistory]);
  const validBench = useMemo(() => benchmarkHistory.filter(b => b.date && b.price !== '').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [benchmarkHistory]);
  const validPrompts = useMemo(() => prompts.filter(p => p.title && p.content), [prompts]);
  const filteredPrompts = useMemo(() => promptSearch ? validPrompts.filter(p => p.title.toLowerCase().includes(promptSearch.toLowerCase()) || p.content.toLowerCase().includes(promptSearch.toLowerCase())) : validPrompts, [validPrompts, promptSearch]);

  const metrics = useMemo(() => {
    const curMV = validHistory.length > 0 ? Number(validHistory[validHistory.length - 1].marketValue) : 0;
    let net = 0; validTxns.forEach(t => net += (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0));
    let avgY = 0; if (validTxns.length > 0) { const years = Math.max(0.1, (new Date().getTime() - new Date(validTxns[0].date).getTime()) / (1000*60*60*24*365.25)); avgY = net / years; }
    const cashFlows = validTxns.map(t => ({ date: new Date(t.date), amount: (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0) }));
    cashFlows.push({ date: new Date(), amount: -curMV });
    const xirr = calculateXIRR(cashFlows);
    const rate = (xirr !== null && xirr > 0 && xirr < 0.5) ? xirr : 0.10;
    return { currentMV: curMV, net, pl: curMV - net, avgY, avgM: avgY/12, avgD: avgY/365.25, xirr, rate, f5: curMV*Math.pow(1+rate,5) + avgY*((Math.pow(1+rate,5)-1)/rate), f10: curMV*Math.pow(1+rate,10) + avgY*((Math.pow(1+rate,10)-1)/rate), f20: curMV*Math.pow(1+rate,20) + avgY*((Math.pow(1+rate,20)-1)/rate) };
  }, [validTxns, validHistory]);

  const chartData = useMemo(() => {
    const dates = Array.from(new Set([...validTxns.map(t => t.date), ...validHistory.map(p => p.date), ...validBench.map(b => b.date)])).sort();
    let dep = 0, units = 0, mv = 0;
    return dates.map(d => {
      const p = getPriceForDate(d, validBench);
      validTxns.filter(t => t.date === d).forEach(t => { const flow = (Number(t.deposit)||0) - (Number(t.withdrawal)||0); dep += flow; units += p > 0 ? (flow/p) : 0; });
      const h = validHistory.find(x => x.date === d); if (h) mv = Number(h.marketValue);
      return { date: d, "Cumulative Net Deposits": dep, "Market Value": mv || dep, "Benchmark Value": units * p };
    });
  }, [validTxns, validHistory, validBench]);

  if (authError) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <InteractiveBackground isDarkMode={isDarkMode} />
        <div className="relative z-10 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col items-center shadow-2xl text-center">
          <AnimatedLogo />
          <h2 className="text-xl font-bold mt-6 mb-2 text-rose-500">Authentication Error</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{authError}</p>
          <p className="text-zinc-500 text-xs mt-4">Please check your Google Client ID and Firebase configuration.</p>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <InteractiveBackground isDarkMode={isDarkMode} />
        <div className="relative z-10 flex flex-col items-center">
          <AnimatedLogo />
          <div className="mt-8 text-sm font-bold text-zinc-500 animate-pulse">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden">
        <InteractiveBackground isDarkMode={isDarkMode} />
        <div className="relative z-10 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col items-center shadow-2xl">
          <AnimatedLogo />
          <h2 className="text-xl font-bold mt-6 mb-2 tracking-tight">Portfolio Tracker Pro</h2>
          <p className="text-zinc-500 text-sm mb-8 text-center">Sign in to access your dashboard.</p>
          <div id="gsi-button-container" className="w-full flex justify-center min-h-[44px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] overflow-x-hidden selection:bg-yellow-500/30">
      <InteractiveBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 w-full h-full pb-20">
        <nav className="border-b border-black/5 dark:border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0 z-50 h-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AnimatedLogo />
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Cloud size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Cloud Sync</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-yellow-500 text-white dark:text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('data')} className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-yellow-500 text-white dark:text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white'}`}>Data</button>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <MetricCard title="Current Value" value={formatCurrency(metrics.currentMV)} icon={IndianRupee} subtext="Latest Snapshot" />
                <MetricCard title="Net Deposits" value={formatCurrency(metrics.net)} icon={Wallet} subtext="Total Savings" />
                <MetricCard title="Unrealized P/L" value={formatCurrency(metrics.pl)} icon={TrendingUp} trend={metrics.pl >= 0 ? 'up' : 'down'} subtext={metrics.pl >= 0 ? 'Profit' : 'Loss'} />
                <div className="relative group overflow-hidden bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 md:p-6 border border-black/5 dark:border-white/5 transition-all duration-500 hover:border-yellow-500/30">
                  <div className="flex items-center justify-between mb-5"><h3 className="text-xs md:text-sm font-medium text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Avg Savings</h3><Calendar className="text-yellow-500" size={18} strokeWidth={2.5} /></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">Annual</span><span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.avgY)}</span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">Monthly</span><span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(metrics.avgM)}</span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">Daily</span><span className="text-sm font-medium text-zinc-400 dark:text-zinc-600 dark:text-zinc-400">{formatCurrency(metrics.avgD)}</span></div>
                  </div>
                </div>
                <MetricCard title="XIRR" value={formatPercent(metrics.xirr)} icon={Activity} trend={metrics.xirr >= 0 ? 'up' : 'down'} subtext="Annualized Return" />
                <div className="relative group overflow-hidden bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 md:p-6 border border-black/5 dark:border-white/5 transition-all duration-500 hover:border-cyan-500/30">
                  <div className="flex items-center justify-between mb-5"><h3 className="text-xs md:text-sm font-medium text-zinc-400 dark:text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Future Wealth</h3><Rocket className="text-cyan-400" size={18} strokeWidth={2.5} /></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">5 Years</span><span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.f5)}</span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">10 Years</span><span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(metrics.f10)}</span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-black text-cyan-600 tracking-widest uppercase">20 Years</span><span className="text-lg font-black text-cyan-400">{formatCurrency(metrics.f20)}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-2"><div className="flex justify-between items-center text-[8px] font-bold tracking-widest uppercase text-zinc-500"><span>Progress to 10 Cr</span><span className="text-cyan-400">{((metrics.f20 / 100000000) * 100).toFixed(1)}%</span></div><div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.f20 / 100000000) * 100)}%` }} /></div></div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 md:p-6 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"><h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-50">Performance Comparison</h3><div className="flex flex-wrap items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-bold tracking-wider text-zinc-500 uppercase"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffffff]" /> Net Deposits</div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#eab308]" /> Market Value</div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#06b6d4]" /> Benchmark</div></div></div>
                <div className="h-[300px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid vertical={false} stroke="#1f1f22" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fill:'#71717a', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={d => new Date(d).toLocaleDateString(undefined,{month:'short', year:'2-digit'})} minTickGap={30} />
                      <YAxis tick={{fill:'#71717a', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{backgroundColor:'#09090b', border:'1px solid #27272a', borderRadius:12, boxShadow:'0 10px 30px -10px rgba(0,0,0,1)'}} itemStyle={{fontWeight:700, padding:'3px 0', fontSize: '11px'}} labelStyle={{color:'#71717a', fontWeight:700, marginBottom:'8px', textTransform:'uppercase', fontSize:'9px', letterSpacing:'0.05em'}} formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="Cumulative Net Deposits" stroke="#ffffff" strokeWidth={2.5} dot={false} activeDot={{r:6, stroke:'#050505', strokeWidth:3, fill: '#ffffff'}} />
                      <Line type="monotone" dataKey="Market Value" stroke="#eab308" strokeWidth={2.5} dot={false} activeDot={{r:6, stroke:'#050505', strokeWidth:3, fill: '#eab308'}} />
                      <Line type="monotone" dataKey="Benchmark Value" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{r:6, stroke:'#050505', strokeWidth:3, fill: '#06b6d4'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><MessageSquare size={20} /></div><h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Prompts</h3></div><div className="relative group max-w-sm w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={16} /><input type="text" placeholder="Search snippets..." value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} className="w-full bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/30 transition-all placeholder:text-zinc-400 dark:text-zinc-600" /></div></div>
                {filteredPrompts.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{filteredPrompts.map(p => (<PromptCard key={p.id} title={p.title} content={p.content} />))}</div>) : (<div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-10 md:p-16 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center"><MessageSquare size={32} className="text-zinc-300 dark:text-zinc-800 mb-4" /><p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">{promptSearch ? "No snippets matching your search." : "Your prompt vault is empty."}</p></div>)}
              </div>

              <div className="pb-10">
                <GeminiInsights metrics={metrics} transactions={validTxns} prompts={validPrompts} />
              </div>
            </div>
          )}

          {activeTab === 'data' && !isUnlocked && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500"><div className={`bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col items-center transition-all ${pinError ? 'animate-shake border-rose-500/50' : ''}`}><div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20"><Lock className="text-yellow-500" size={28} /></div><h2 className="text-xl font-bold mb-2 tracking-tight">Restricted Access</h2><p className="text-zinc-500 text-sm mb-8 text-center">Enter your 4-digit PIN.</p><input type="password" maxLength={4} value={pinInput} onChange={e => { const val = e.target.value.replace(/\D/g,''); setPinInput(val); if (val === CORRECT_PIN) setIsUnlocked(true); else if (val.length === 4) { setPinError(true); setTimeout(()=>setPinError(false),500); setPinInput(''); } }} className={`w-full bg-white dark:bg-black border ${pinError ? 'border-rose-500' : 'border-black/10 dark:border-white/10'} text-center text-3xl py-5 rounded-xl focus:outline-none focus:border-yellow-500 tracking-[1em] transition-all font-mono`} placeholder="••••" autoFocus /></div><style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } } .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }`}</style></div>
          )}

          {activeTab === 'data' && isUnlocked && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <Sheet title="Transactions" coll="transactions" data={transactions} onEdit={handleTxnChange} onDelete={(id: string) => deleteCloudDoc('transactions', id)} keys={['date','deposit','withdrawal']} onPaste={(e: any) => handlePaste(e,'transactions',['date','deposit','withdrawal'])} />
                <Sheet title="Portfolio Value" coll="history" data={portfolioHistory} onEdit={handleMvChange} onDelete={(id: string) => deleteCloudDoc('history', id)} keys={['date','marketValue']} onPaste={(e: any) => handlePaste(e,'history',['date','marketValue'])} />
                <Sheet title="Benchmark Sim" coll="benchmark" data={benchmarkHistory} onEdit={handleBmChange} onDelete={(id: string) => deleteCloudDoc('benchmark', id)} keys={['date','price']} onPaste={(e: any) => handlePaste(e,'benchmark',['date','price'])} />
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-6 md:pt-10"><Sheet title="Prompts Repository" coll="prompts" data={prompts} onEdit={handlePromptChange} onDelete={(id: string) => deleteCloudDoc('prompts', id)} keys={['title','content']} onPaste={(e: any) => handlePaste(e,'prompts',['title','content'])} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sheet({ title, data, onEdit, onDelete, keys, onPaste }: any) {
  return (
    <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-black/5 dark:border-white/5 flex flex-col h-[600px] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-black/5 dark:border-white/5 bg-white/[0.02] flex justify-between items-center uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500 shrink-0">{title}</div>
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-black/40 scrollbar-thin scrollbar-thumb-white/10">
        <table className="w-full text-xs text-left border-collapse min-w-[500px]">
          <thead className="sticky top-0 bg-gray-50 dark:bg-[#111] z-10 shadow-sm"><tr>{['#', ...keys, ''].map(h => <th key={h} className="p-4 border-b border-black/5 dark:border-white/5 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">{h}</th>)}</tr></thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={row.id} className="border-b border-black/5 dark:border-white/5 hover:bg-yellow-500/[0.02] group transition-colors">
                <td className="p-4 text-zinc-400 dark:text-zinc-600 font-mono text-[10px] w-12 text-center">{i+1}</td>
                {keys.map((k: string) => (<td key={k} className="p-0 border-l border-black/5 dark:border-white/5 relative">{k === 'content' ? (<textarea value={row[k] || ''} onChange={e => onEdit(row.id, k, e.target.value)} onPaste={onPaste} placeholder="..." className="w-full p-4 bg-transparent outline-none focus:bg-yellow-500/[0.05] focus:text-slate-900 dark:text-white transition-colors resize-none min-h-[56px] font-mono text-[11px] placeholder:text-zinc-300 dark:text-zinc-800" rows={1} />) : (<input type={k==='date'?'date': (k === 'title' ? 'text' : 'number')} value={row[k] === undefined ? '' : row[k]} onPaste={onPaste} onChange={e => onEdit(row.id, k, e.target.value)} placeholder={k==='date'?'': '0.00'} className="w-full p-4 bg-transparent outline-none focus:bg-yellow-500/[0.05] focus:text-slate-900 dark:text-white transition-colors font-mono text-[11px] h-14 placeholder:text-zinc-300 dark:text-zinc-800" />)}</td>))}
                <td className="p-0 text-center border-l border-black/5 dark:border-white/5 w-14"><button onClick={() => onDelete(row.id)} className="w-full h-full p-4 text-zinc-700 hover:text-rose-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
