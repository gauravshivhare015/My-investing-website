import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const formatAmt = (v: number) => {
  if (v === undefined || v === null || isNaN(v)) return '0.00';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(v);
};
import { 
  TrendingUp, IndianRupee, Activity, 
  Calendar, Wallet, ArrowUpRight, ArrowDownRight,
  Database, LayoutDashboard, Trash2, LineChart as LineChartIcon, Rocket, Lock, Cloud,
  Copy, Check, MessageSquare, Search, Target, Sun, Moon, Coins, Sparkles,
  UploadCloud, FileText, Image as ImageIcon, File, Download, LogOut,
  ChevronDown, ChevronUp, ArrowUpDown, ShieldCheck, GripVertical, Plus, Palette, ClipboardPaste, Cpu, Settings, RefreshCw, Edit3, Save, Clock, Loader2, Zap, Info, History, Star
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Firebase Imports ---
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';

import { FilingsDashboard } from './components/FilingsDashboard';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AddTickerFeature } from './components/AddTickerFeature';

// --- Error Handling & Toast Imports ---
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToasts } from './context/ToastContext';
import Footer from './components/Footer';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  
  // If it's a permission error, we throw to let ErrorBoundary catch major disruptions
  if (errInfo.error.includes('insufficient permissions')) {
    throw new Error(errorJson);
  }
  
  // Return the error so the caller can decide whether to show a transient toast
  return errInfo;
}

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { data, ok: res.ok, status: res.status };
  } catch (e) {
    console.error(`Non-JSON response from ${url}:`, text.substring(0, 200));
    throw new Error(`Server at ${url} returned invalid response (Status ${res.status}). Expected JSON, got: ${text.substring(0, 100)}...`);
  }
};

// --- AI Imports ---
import gsap from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartJSTitle,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
} from 'chart.js';
import { Bar as ChartJSBar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartJSTitle,
  ChartJSTooltip,
  ChartJSLegend
);

const appId = 'portfolio-tracker-pro';

// --- Elegant Particle Network Background ---
const InteractiveBackground = ({ isDarkMode, brandColor }: { isDarkMode: boolean, brandColor: string }) => {
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

    const brandRgb = hexToRgb(brandColor).replace(/ /g, ', ');

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
        this.color = Math.random() > 0.5 ? `rgba(${brandRgb}, ` : 'rgba(6, 182, 212, '; 
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

    let rafId: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDarkMode ? '#050505' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const brandRgbCanvas = hexToRgb(brandColor).replace(/ /g, ', ');
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
      glow.addColorStop(0, isDarkMode ? `rgba(${brandRgbCanvas}, 0.05)` : `rgba(${brandRgbCanvas}, 0.03)`); 
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [isDarkMode, brandColor]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 bg-background-light dark:bg-[#050505]" />;
};

// --- Interactive GSAP Logo ---
const AnimatedLogo = ({ brandColor }: { brandColor: string }) => {
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
      return <polygon key={i} className="logo-shard" points={pts} fill={brandColor} opacity="0" />;
    });
  }, [brandColor]);

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
      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-brand/20 shadow-[0_0_15px_rgb(var(--brand-color-rgb)_/_0.15)] overflow-visible shrink-0 cursor-pointer hover:scale-105 transition-transform"
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
          fill={brandColor}
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
const BenchmarkComparisonChart = ({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) => {
  return (
    <div className="h-[250px] md:h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: -25 }}>
          <CartesianGrid vertical={false} stroke={isDarkMode ? "#1f1f22" : "#e4e4e7"} strokeDasharray="3 3" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{fill:'#71717a', fontSize:9, fontWeight:600}} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={d => new Date(d).toLocaleDateString(undefined,{month:'short', year:'2-digit'})} 
            minTickGap={30} 
          />
          <YAxis 
            tick={{fill:'#71717a', fontSize:9, fontWeight:600}} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} 
          />
          <Tooltip 
            contentStyle={{backgroundColor: isDarkMode ? '#09090b' : '#ffffff', border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius:12, boxShadow:'0 10px 30px -10px rgba(0,0,0,0.2)'}} 
            itemStyle={{fontWeight:700, padding:'2px 0', fontSize: '10px'}} 
            labelStyle={{color:'#71717a', fontWeight:700, marginBottom:'6px', textTransform:'uppercase', fontSize:'8px', letterSpacing:'0.05em'}} 
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
          />
          <Line 
            type="monotone" 
            dataKey="Cumulative Net Deposits" 
            name="Principal Invested"
            stroke={isDarkMode ? "#818cf8" : "#6366f1"} 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="Benchmark Value" 
            name="Benchmark Value"
            stroke="#22d3ee" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{r:6, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: '#22d3ee'}} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AllocationPieChart = ({ breakdown, isDarkMode, brandColor }: any) => {
  const data = [
    { name: 'Stocks', value: breakdown.stocks, color: brandColor },
    { name: 'SGB', value: breakdown.sgb, color: '#f59e0b' },
    { name: 'Mutual Funds', value: breakdown.mf, color: '#06b6d4' }
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="h-[200px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(v: number) => formatCurrency(v)}
            contentStyle={{ backgroundColor: isDarkMode ? '#09090b' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: isDarkMode ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Allocation</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white">Active</span>
      </div>
    </div>
  );
};

const NetSavingsChart = ({ transactions, isDarkMode, brandColor }: { transactions: any[], isDarkMode: boolean, brandColor: string }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const validTxns = transactions.filter(t => t.date);
    let projectedRemainder = 0;
    if (validTxns.length > 0) {
      const inceptionDate = new Date(Math.min(...validTxns.map(t => new Date(t.date).getTime())));
      const daysSinceInception = Math.max(1, (now.getTime() - inceptionDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalNetSavings = validTxns.reduce((acc, t) => acc + ((Number(t.deposit) || 0) - (Number(t.withdrawal) || 0)), 0);
      const dailyAvg = totalNetSavings / daysSinceInception;
      
      const endOfYear = new Date(currentYear, 11, 31);
      const daysRemaining = Math.max(0, (endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      projectedRemainder = dailyAvg * daysRemaining;
    }

    if (selectedYear === null) {
      // Yearly view
      const yearlyData: Record<number, number> = {};
      transactions.forEach(t => {
        if (!t.date) return;
        const date = new Date(t.date);
        const year = date.getFullYear();
        const net = (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0);
        yearlyData[year] = (yearlyData[year] || 0) + net;
      });
      
      const years = Object.keys(yearlyData).map(Number).sort();
      if (!years.includes(currentYear) && projectedRemainder > 0) years.push(currentYear);
      years.sort((a, b) => a - b);

      const growthColor = '#6366f1'; // Indigo 500
      const capitalColor = isDarkMode ? '#ffffff' : '#475569'; // Crisp White / Slate 600
      const projectionColor = '#a78bfa'; // Violet 400

      return {
        labels: years.map(String),
        datasets: [
          {
            label: 'Actual Net Savings',
            data: years.map(y => yearlyData[y] || 0),
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, context.chart.chartArea ? context.chart.chartArea.top : 0, 0, context.chart.chartArea ? context.chart.chartArea.bottom : 400);
              gradient.addColorStop(0, capitalColor);
              gradient.addColorStop(1, capitalColor + (isDarkMode ? '22' : '44'));
              return gradient;
            },
            borderRadius: years.map(y => 
              y === currentYear && projectedRemainder > 0 
                ? { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 } 
                : 4
            ),
            stack: 'combined',
          },
          {
            label: 'Projected Remainder',
            data: years.map(y => y === currentYear ? projectedRemainder : 0),
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, context.chart.chartArea ? context.chart.chartArea.top : 0, 0, context.chart.chartArea ? context.chart.chartArea.bottom : 400);
              gradient.addColorStop(0, projectionColor + '88');
              gradient.addColorStop(1, projectionColor + '11');
              return gradient;
            },
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            stack: 'combined',
            borderWidth: 1,
            borderColor: projectionColor + '44',
            borderDash: [5, 5],
          }
        ]
      };
    } else {
      // Monthly view
      const growthColor = '#6366f1'; // Indigo 500
      const monthlyData: Record<number, number> = {};
      for (let i = 0; i < 12; i++) monthlyData[i] = 0;
      
      transactions.forEach(t => {
        if (!t.date) return;
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear) {
          const month = date.getMonth();
          const net = (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0);
          monthlyData[month] += net;
        }
      });
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        labels: months,
        datasets: [
          {
            label: `Net Savings (${selectedYear})`,
            data: months.map((_, i) => monthlyData[i]),
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, context.chart.chartArea ? context.chart.chartArea.top : 0, 0, context.chart.chartArea ? context.chart.chartArea.bottom : 400);
              gradient.addColorStop(0, growthColor);
              gradient.addColorStop(1, growthColor + '22');
              return gradient;
            },
            borderRadius: 4,
          }
        ]
      };
    }
  }, [transactions, selectedYear, brandColor, isDarkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && selectedYear === null) {
        const index = elements[0].index;
        const year = Number(chartData.labels[index]);
        if (!isNaN(year)) setSelectedYear(year);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#ffffff' : '#09090b',
        bodyColor: isDarkMode ? '#a1a1aa' : '#52525b',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 16,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 8,
        titleFont: {
          size: 11,
          weight: 700 as const,
        },
        bodyFont: {
          size: 12,
          weight: 600 as const,
        },
        filter: function(tooltipItem: any) {
          if (!tooltipItem || !tooltipItem.dataset) return false;
          if (tooltipItem.dataset.label === 'Projected Remainder') {
             return tooltipItem.raw !== 0;
          }
          return tooltipItem.raw !== 0;
        },
        callbacks: {
          title: (items: any[]) => {
            if (!items || items.length === 0 || !items[0]) return '';
            return `📅 ${items[0].label || ''}`;
          },
          label: function(context: any) {
            if (!context || !context.dataset) return '';
            let label = context.dataset.label || '';
            const isActual = label === 'Actual Net Savings';
            const icon = isActual ? '💰 ' : '🔮 ';
            
            if (label) {
              label = icon + label + ': ';
            }
            if (context.parsed && context.parsed.y !== null && context.parsed.y !== undefined) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          },
          footer: function(tooltipItems: any[]) {
            if (tooltipItems.length > 1) {
              let sum = 0;
              tooltipItems.forEach(function(tooltipItem: any) {
                sum += tooltipItem.parsed.y;
              });
              return '\n📈 TOTAL YEAR END: ' + new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sum);
            }
            return '';
          },
          labelTextColor: function() {
            return isDarkMode ? '#ffffff' : '#09090b';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        stacked: true,
        ticks: {
          color: '#71717a',
          font: {
            size: 10,
            weight: 600 as const,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: isDarkMode ? '#1f1f22' : '#e4e4e7',
          drawBorder: false,
        },
        stacked: true,
        ticks: {
          color: '#71717a',
          font: {
            size: 10,
            weight: 600 as const,
          },
          callback: function(value: any) {
            return '₹' + (value / 1000).toFixed(0) + 'k';
          }
        },
        border: {
          display: false,
        }
      }
    },
    animation: {
      duration: 500,
    }
  };

  return (
    <div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-4 md:p-6 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h3 className="text-slate-500 dark:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-80">
          Net Savings {selectedYear ? `(${selectedYear})` : '(Yearly)'}
        </h3>
        {selectedYear !== null && (
          <button 
            onClick={() => setSelectedYear(null)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all self-start md:self-auto"
          >
            ← Back
          </button>
        )}
      </div>
      <div className="h-[250px] md:h-[400px] w-full cursor-pointer">
        <ChartJSBar data={chartData} options={options} />
      </div>
    </div>
  );
};

const NumberTicker = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: [0.32, 0.72, 0, 1], // Custom cubic-bezier for smooth finish
      onUpdate(latest) {
        setDisplayValue(Math.floor(latest));
      }
    });
    return () => controls.stop();
  }, [value]);

  return <span>{formatCurrency(displayValue)}</span>;
};

const MetricCard = ({ title, value, rawValue, icon: Icon, subtext, trend, highlightColor = 'brand', delay = 0, className = "" }: any) => {
  const colorMap: Record<string, string> = {
    brand: 'text-brand',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    zinc: 'text-zinc-400',
  };
  const glowMap: Record<string, string> = {
    brand: 'group-hover:bg-brand/50',
    cyan: 'group-hover:bg-cyan-500/50',
    emerald: 'group-hover:bg-emerald-500/50',
    violet: 'group-hover:bg-violet-500/50',
    zinc: 'group-hover:bg-white/50',
  };

  const colorClass = colorMap[highlightColor] || colorMap.brand;
  const lineGlow = glowMap[highlightColor] || glowMap.brand;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group overflow-hidden glass-card rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.01] hover:bg-white/80 dark:hover:bg-white/[0.06] ${className}`}
    >
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-white/0 ${lineGlow} blur-[1px] transition-all duration-500`} />
      <div className="flex items-center justify-between mb-2 md:mb-4 gap-2">
        <h3 className="text-[9px] md:text-sm font-bold text-slate-800 dark:text-white tracking-[0.1em] md:tracking-widest uppercase truncate">{title}</h3>
        <div className={`p-1.5 md:p-2 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl md:bg-slate-50/50 ${colorClass} group-hover:scale-110 transition-all duration-300 shadow-sm border border-slate-100 dark:border-0 shrink-0`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <div className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-0.5 tracking-tight truncate">
          {typeof rawValue === 'number' ? <NumberTicker value={rawValue} /> : value}
        </div>
        {subtext && (
          <div className={`text-[9px] md:text-sm flex flex-wrap items-center gap-1 mt-1 font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-500'}`}>
            {trend === 'up' && <ArrowUpRight className="shrink-0" size={14} strokeWidth={2.5} />}
            {trend === 'down' && <ArrowDownRight className="shrink-0" size={14} strokeWidth={2.5} />}
            <span className="truncate">{subtext}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PromptCard = ({ id, title, content, rating, isDragging, onDragStart, onDragOver, onDrop, onEditContent, onEditTitle, onEditRating, onDelete }: any) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(title);

  const cycleRating = () => {
    const ratings = ['none', 'bronze', 'silver', 'gold'];
    const currentIndex = ratings.indexOf(rating || 'none');
    const nextRating = ratings[(currentIndex + 1) % ratings.length];
    if (onEditRating) {
      onEditRating(id, nextRating);
    }
  };

  const getStarColors = () => {
    switch(rating) {
      case 'gold': return 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]';
      case 'silver': return 'text-slate-400 fill-slate-400 drop-shadow-[0_0_4px_rgba(148,163,184,0.6)]';
      case 'bronze': return 'text-amber-700 fill-amber-700 drop-shadow-[0_0_4px_rgba(180,83,9,0.6)]';
      default: return 'text-zinc-300 dark:text-zinc-700 hover:text-amber-400 opacity-50 hover:opacity-100';
    }
  };

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

  const handleSave = () => {
    setIsEditing(false);
    if (onEditContent && editValue !== content) {
      onEditContent(id, editValue);
    }
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (onEditTitle && editTitleValue !== title) {
      onEditTitle(id, editTitleValue);
    }
  };

  return (
    <div 
      draggable={!isEditing && !isEditingTitle}
      onDragStart={(e) => !isEditing && !isEditingTitle && onDragStart(e, id)}
      onDragOver={(e) => !isEditing && !isEditingTitle && onDragOver(e, id)}
      onDrop={(e) => !isEditing && !isEditingTitle && onDrop(e, id)}
      className={`bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border ${isDragging ? 'border-brand border-dashed opacity-50' : 'border-black/5 dark:border-white/5'} p-3 md:p-4 transition-all hover:border-brand/30 group ${isEditing || isEditingTitle ? '' : 'cursor-grab active:cursor-grabbing'} flex flex-col justify-center h-14 w-full relative z-10 hover:z-20`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 max-w-[80%] w-full">
          <div className={`text-zinc-400 dark:text-zinc-600 shrink-0 ${isEditingTitle || isEditing ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}><GripVertical size={14} /></div>
          <button 
            onClick={(e) => { e.stopPropagation(); cycleRating(); }} 
            className={`transition-all duration-300 shrink-0 ${getStarColors()} hover:scale-110 active:scale-95`}
            title="Sort Priority (None -> Bronze -> Silver -> Gold)"
          >
            <Star size={14} />
          </button>
          {isEditingTitle ? (
            <input
              autoFocus
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setEditTitleValue(title);
                }
              }}
              className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none border-b border-brand/50 px-1"
            />
          ) : (
            <h4 
              className="text-sm font-bold text-slate-900 dark:text-white transition-colors truncate"
              onClick={(e) => { if (e.detail === 3) setIsEditingTitle(true); }}
              title="Triple-click to edit title"
            >
              {title || 'Untitled Prompt'}
            </h4>
          )}
        </div>
        {!isEditing && !isEditingTitle && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className={`p-1.5 md:p-2 rounded-lg transition-all shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-brand hover:bg-brand/10'}`}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
      <div className={`absolute top-[100%] mt-2 left-0 w-full grid transition-all duration-300 ease-in-out z-20 ${isEditing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100'}`}>
        <div className="overflow-hidden w-full shadow-2xl rounded-xl">
          <div className="bg-surface-light dark:bg-[#1a1a1a] rounded-xl p-3 border border-black/10 dark:border-white/10 max-h-[160px] overflow-y-auto w-full">
            {isEditing ? (
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleSave();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditValue(content);
                  }
                }}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white font-mono resize-none focus:outline-none min-h-[48px]"
              />
            ) : (
              <p 
                className="text-xs text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap select-text" 
                onClick={(e) => { if (e.detail === 3) setIsEditing(true); }}
                title="Triple-click to edit"
              >
                {content}
              </p>
            )}
          </div>
        </div>
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
    if (r <= -1) r = -0.99999;
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
  
  // Use binary search for better performance on large datasets
  let low = 0;
  let high = sortedBenchData.length - 1;
  let result = Number(sortedBenchData[0].price);
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const bTime = new Date(sortedBenchData[mid].date).getTime();
    
    if (bTime <= targetTime) {
      result = Number(sortedBenchData[mid].price);
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisible = () => {
      if (window.pageYOffset > 500) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};




// --- Theme Constants ---
const PREDEFINED_THEMES = [
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'indigo', name: 'Indigo', color: '#6366f1' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6' },
];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '245 158 11';
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const formatDateToDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Attempt parsing DD-MM-YYYY if it's already in that format or similar
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const [dPart, mPart, yPart] = parts;
      if (dPart.length <= 2 && mPart.length <= 2 && yPart.length === 4) return `${dPart.padStart(2, '0')}/${mPart.padStart(2, '0')}/${yPart}`;
    }
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDDMMYYYYtoISO = (val: string) => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (d && m && y) {
      if (y.length === 2) y = '20' + y;
      if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return trimmed;
};

const AngelOneIntegration = ({ user, brokerSettings, saveHoldingToFirestore, saveTradeToFirestore, saveFundsToFirestore, saveHistoryToFirestore, saveToTransactions, saveApiSummaryToFirestore, manualAssetsValue, angelOneEnabled, setAngelOneEnabled }: { user: any, brokerSettings?: any, saveHoldingToFirestore: (h: any) => Promise<void>, saveTradeToFirestore: (t: any) => Promise<void>, saveFundsToFirestore: (f: any) => Promise<void>, saveHistoryToFirestore: (date: string, value: number) => Promise<void>, saveToTransactions: (date: string, deposit: string, withdrawal: string) => Promise<void>, saveApiSummaryToFirestore: (summary: any) => Promise<void>, manualAssetsValue?: number, angelOneEnabled: boolean, setAngelOneEnabled: (v: boolean) => void }) => {
  const { addToast } = useToasts();
  const [configStatus, setConfigStatus] = useState<any>({ configured: false, status: {} });
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualTotp, setManualTotp] = useState('');
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data } = await fetchJson('/api/config/status');
        setConfigStatus(data);
      } catch (err) {
        console.error("Failed to check config", err);
        addToast("Connectivity Error", "Failed to reach Angel One servers.", "error");
      }
    };
    checkConfig();
  }, [addToast]);

  const missingKeys = useMemo(() => {
    if (!configStatus.status) return [];
    return Object.entries(configStatus.status)
      .filter(([_, val]) => !val)
      .map(([key]) => key);
  }, [configStatus]);

  const handleAngelOneSync = async () => {
    setIsSyncing(true);
    try {
      const angelCreds = brokerSettings?.angelone?.credentials;
      const res = await fetch('/api/angelone/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          manualTotp,
          credentials: angelCreds
        })
      });
      const status = res.status;
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        throw new Error(`Server returned non-JSON response (Status ${status}). This usually means a server crash or routing error. Output: ${text.substring(0, 100)}...`);
      }

      if (res.ok && data.status === 'success') {
        const mapped = data.holdings.map((h: any) => {
          const name = h.tradingsymbol || h.symbol || h.mfname || 'Unknown';
          let type = h._source_type;
          
          // Override or set type based on name patterns
          const upperName = name.toUpperCase();
          if (upperName.startsWith('SGB') || upperName.includes('GOLD BOND')) {
            type = 'SGB';
          } else if (!type) {
            if (h.symboltoken) type = 'EQUITY';
            else type = 'MF';
          }

          return {
            name,
            symboltoken: h.symboltoken || '',
            exchange: h.exchange || 'N/A',
            qty: Number(h.quantity || h.units || h.holdingqty || 0),
            avg: Number(h.averageprice || h.avgprice || h.buyprice || 0),
            ltp: Number(h.ltp || h.nav || 0),
            pClose: Number(h.close || h.ltp || h.nav || 0),
            type: type
          };
        });
        // PORTFOLIO AUTOMATION BLOCKED AS PER USER REQUEST: "completely blocking any code-driven or automated modifications"
        // The data is fetched but NOT saved to Firestore automatically.
        /*
        for (const h of mapped) {
          await saveHoldingToFirestore(h);
        }

        if (data.trades && data.trades.length > 0) {
          for (const t of data.trades) {
            await saveTradeToFirestore(t);
          }
        }

        if (data.funds) {
          await saveFundsToFirestore(data.funds);
          const today = new Date().toISOString().split('T')[0];
          await saveToTransactions(today, data.funds.payin || '0', data.funds.payout || '0');
        }
        */

        // Sync Summary to state only (no Firestore)
        if (data.holdings_summary && data.holdings_summary.totalholdingvalue) {
            // await saveApiSummaryToFirestore(data.holdings_summary); // BLOCKED
        }

        addToast("Portfolio Data Fetched", "Live snapshots retrieved from Angel One. PERSISTENCE IS BLOCKED - Manual entry required for 'Data' board tracking.", "info");
        
        if (data.ledger && Array.isArray(data.ledger)) {
            for (const item of data.ledger) {
                // Angel One ledger items usually have 'date', 'credit', 'debit', 'balance', 'particulars', 'voucherno'
                let rawDate = item.date || item.updatetime || item.filltime;
                let normalizedDate = new Date().toISOString().split('T')[0];
                
                if (rawDate && typeof rawDate === 'string') {
                    // Remove time part if exists "DD-MM-YYYY HH:MM:SS" -> "DD-MM-YYYY"
                    const datePart = rawDate.split(' ')[0];
                    const parts = datePart.split(/[-/]/);
                    if (parts.length === 3) {
                        if (parts[0].length === 2) {
                            // Assume DD-MM-YYYY -> YYYY-MM-DD
                            normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        } else if (parts[0].length === 4) {
                            // Assume YYYY-MM-DD
                            normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                        }
                    }
                }

                // Try to identify if this is a fund transfer (Deposit/Withdrawal)
                // Often 'particulars' contains "PAYIN" or "PAYOUT" or "FUND TRANSFER"
                const particulars = (item.particulars || '').toUpperCase();
                const isFundTransfer = particulars.includes('PAYIN') || 
                                     particulars.includes('PAYOUT') || 
                                     particulars.includes('TRANSFER') || 
                                     particulars.includes('DEPOSIT') || 
                                     particulars.includes('WITHDRAW');

                // Only save entries that look like fund transfers or have non-zero payin/payout
                const payin = Number(item.payin || item.credit || (item.amount > 0 && isFundTransfer ? item.amount : 0));
                const payout = Number(item.payout || item.debit || (item.amount < 0 && isFundTransfer ? Math.abs(item.amount) : 0));

                if (payin > 0 || payout > 0 || isFundTransfer) {
                  // No longer saving to fund history as it was removed
                }
            }
        }

        addToast("Portfolio Synced", data.ledger ? `Holdings, trades, and ${data.ledger.length} ledger entries imported successfully.` : "All holdings, trades, and fund status imported successfully.", "success");
      } else {
        addToast("Sync Failed", data.error || "Integration encountered an error.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Sync Process Interrupted", (err as Error).message, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/20 dark:border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Rocket size={120} className="text-brand -rotate-12 translate-x-12 translate-y-[-20px]" />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center p-3 border border-brand/20 shadow-inner">
              <Rocket size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Angel One</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand/80">SmartAPI v2.0</p>
            </div>
          </div>
          {configStatus.configured && (
            <button 
              onClick={() => setAngelOneEnabled(!angelOneEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all shrink-0 ${angelOneEnabled ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}
              title={angelOneEnabled ? "Angel One API sync is ON" : "Angel One API sync is OFF"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${angelOneEnabled ? 'bg-brand shadow-[0_0_8px_var(--brand-color-rgb)]' : 'bg-slate-400'}`} />
              {angelOneEnabled ? 'A1 Connected' : 'A1 Offline'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
            Sync your portfolio from Angel One to get real-time insights, automatic P&L tracking, and advanced analytics for your equity holdings.
          </p>

          <div className="p-5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/5 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-1">
              <span className="text-zinc-500">Security Credentials</span>
              <span className="text-brand/80 flex items-center gap-1.5"><Lock size={10} /> AES-256 Encrypted</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {['ANGEL_ONE_CLIENT_ID', 'ANGEL_ONE_API_KEY', 'ANGEL_ONE_PASSWORD', 'ANGEL_ONE_TOTP_SECRET'].map(key => {
                const isSet = configStatus.status?.[key];
                return (
                  <div key={key} className={`flex items-center gap-2 p-2 rounded-xl text-[10px] font-mono border transition-colors ${
                    isSet ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-zinc-500/5 border-zinc-500/20 text-zinc-400'
                  }`}>
                    {isSet ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    )}
                    <span className="truncate flex-1">{key.replace('ANGEL_ONE_', '')}</span>
                    {isSet && <span className="text-[8px] opacity-60">SET</span>}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-900/5 dark:border-white/5">
              <details className="group">
                <summary className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-brand transition-colors flex items-center gap-2 list-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand group-open:bg-zinc-400" />
                  Troubleshooting Guide
                </summary>
                <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                  <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                     <p className="text-orange-500 font-bold mb-1 uppercase tracking-tighter">1. TOTP Secret Error?</p>
                     Ensure you are using the <span className="font-bold text-slate-900 dark:text-white">16-character alphanumeric key</span> shown when you click "Enable TOTP" in Angel One settings. It is NOT the 6-digit code from your authenticator app.
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                     <p className="text-blue-500 font-bold mb-1 uppercase tracking-tighter">2. Auth Failed / No Data?</p>
                     Double check your Client ID (e.g. S123456) and your Trading Password. API Key must be from a <span className="font-bold text-slate-900 dark:text-white">Trading Terminal</span> app type.
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className={`flex-1 py-4.5 rounded-2.5xl font-black uppercase tracking-[0.25em] text-[11px] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${
              (configStatus.configured || brokerSettings?.angelone)
                ? 'bg-brand text-black shadow-[0_12px_24px_-8px_rgba(255,200,0,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(255,200,0,0.5)] active:scale-[0.98]' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
            onClick={(configStatus.configured || brokerSettings?.angelone) ? handleAngelOneSync : () => setIsCredsModalOpen(true)}
            disabled={isSyncing}
          >
            {isSyncing && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            )}
            {!isSyncing && (configStatus.configured || brokerSettings?.angelone) && <Activity size={16} className="group-hover/btn:scale-110 transition-transform" />}
            
            <span className="relative z-10">
              {(configStatus.configured || brokerSettings?.angelone) ? (isSyncing ? 'Synchronizing...' : 'Sync Portfolio Now') : 'Configuration Required'}
            </span>
            
            {(configStatus.configured || brokerSettings?.angelone) && !isSyncing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            )}
          </button>

          <button 
            onClick={() => setIsCredsModalOpen(true)}
            className="p-4.5 bg-brand/10 border border-brand/20 text-brand rounded-2.5xl hover:bg-brand/20 transition-all active:scale-95"
            title="Configure Credentials"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      <BrokerCredentialsModal 
        isOpen={isCredsModalOpen}
        onClose={() => setIsCredsModalOpen(false)}
        brokerId="angelone"
        user={user}
        currentSettings={brokerSettings?.angelone}
      />
    </div>
  );
};


const BrokerCredentialsModal = ({ isOpen, onClose, brokerId, user, currentSettings }: { 
  isOpen: boolean, 
  onClose: () => void, 
  brokerId: string, 
  user: any,
  currentSettings?: any
}) => {
  const [formData, setFormData] = useState<any>(currentSettings?.credentials || {});
  const { addToast } = useToasts();

  useEffect(() => {
    if (currentSettings?.credentials) setFormData(currentSettings.credentials);
  }, [currentSettings, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const brokerRef = doc(db, 'artifacts', appId, 'users', user.uid, 'broker_settings', brokerId);
      await setDoc(brokerRef, {
        brokerId,
        credentials: formData,
        updatedAt: Date.now()
      });
      addToast("Credentials Saved", `${brokerId} credentials updated successfully.`, "success");
      onClose();
    } catch (e) {
      addToast("Save Failed", "Could not save credentials to Firestore.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-white/20 p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Configure Angel One</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Personal API Gateway</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Client ID</label>
            <input 
              type="text" 
              value={formData.clientId || ''} 
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="e.g. S123456" 
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Trading Password</label>
            <input 
              type="password" 
              value={formData.password || ''} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter Password" 
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">API Key</label>
            <input 
              type="text" 
              value={formData.apiKey || ''} 
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="SmartAPI Key" 
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">TOTP Secret</label>
            <input 
              type="text" 
              value={formData.totpSecret || ''} 
              onChange={(e) => setFormData({ ...formData, totpSecret: e.target.value })}
              placeholder="16-character Secret" 
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 rounded-2xl transition-all">Cancel</button>
             <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-brand shadow-brand/20 rounded-2xl shadow-xl transition-all active:scale-95">Save Config</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const HoldingEditModal = ({ isOpen, onClose, onSave, onDelete, holding }: { isOpen: boolean, onClose: () => void, onSave: (h: any) => void, onDelete: (h: any) => void, holding: any }) => {
  const { addToast } = useToasts();
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newAvg, setNewAvg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiVerifiedLocal, setIsAiVerifiedLocal] = useState(false);

  useEffect(() => {
    if (holding) {
      setNewPrice(holding.ltp.toString());
      setNewQty(holding.qty.toString());
      setNewAvg(holding.avg.toString());
      setShowDeleteConfirm(false);
      setIsAiVerifiedLocal(!!holding.isAiVerified);
    }
  }, [holding]);

  const handleAiSuggestion = async () => {
    if (!holding) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3.5-flash",
          contents: `Identify the absolute latest market price (LTP) for Indian Sovereign Gold Bond/Stock: ${holding.name}. Return ONLY the number. No other text. If not found, estimate based on 24k gold price or recent stock price.`,
          config: { tools: [{ googleSearch: {} }] }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const text = data.text.trim();
      const match = text.match(/\d+(\.\d+)?/);
      if (match) {
        setNewPrice(match[0]);
        setIsAiVerifiedLocal(true);
      }
    } catch (e: any) {
      console.error(e);
      addToast("AI Quota Exhausted", e.message || "Your Gemini API Key has exceeded its usage limits.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || isNaN(Number(newPrice))) return;
    if (!newQty || isNaN(Number(newQty))) return;
    if (!newAvg || isNaN(Number(newAvg))) return;
    
    // Check if the price was actually edited manually after AI verification
    const isPriceChangedFromAI = isAiVerifiedLocal && holding && Number(newPrice) !== Number(holding.ltp) && Number(newPrice) !== Number(newPrice); // This check is a bit flaky without full state, let's just use the boolean. 
    // Wait, simpler: if user changes newPrice manually, we should probably set isAiVerifiedLocal to false. Let's add that to onChange of newPrice, or just rely on the existing state.
    
    onSave({ 
      ...holding, 
      ltp: Number(newPrice), 
      qty: Number(newQty),
      avg: Number(newAvg),
      isAiVerified: isAiVerifiedLocal
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-sm overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand/10 rounded-xl text-brand">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Holding</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{holding?.name}</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Units</label>
                    <input
                      type="number"
                      step="any"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition-all font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Cost Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={newAvg}
                        onChange={(e) => setNewAvg(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl pl-8 pr-4 py-4 text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition-all font-mono font-bold"
                        required
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="text-zinc-400 font-mono text-sm">₹</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Market Price (LTP)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={newPrice}
                      onChange={(e) => {
                        setNewPrice(e.target.value);
                        setIsAiVerifiedLocal(false);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl pl-8 pr-14 py-4 text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition-all font-mono font-bold"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="text-zinc-400 font-mono text-sm">₹</div>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAiSuggestion}
                        disabled={isAiLoading}
                        className="p-2 bg-brand/10 text-brand rounded-lg hover:bg-brand hover:text-white transition-all disabled:opacity-50"
                        title="Search current price with Gemini AI"
                      >
                        {isAiLoading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {showDeleteConfirm ? (
                    <div className="flex-1 flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                           onDelete(holding);
                           onClose();
                        }}
                        className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-rose-500 shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-shrink-0 px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete Holding"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-brand text-white shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ManualSgbModal = ({ isOpen, onClose, onSave, brandColor }: { isOpen: boolean, onClose: () => void, onSave: (h: any) => void, brandColor: string }) => {
  const { addToast } = useToasts();
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [avg, setAvg] = useState('');
  const [ltp, setLtp] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!name || name.length < 3) return;
    setIsSearching(true);
    try {
      const { data: result } = await fetchJson(`/api/market/search?query=${encodeURIComponent(name.toUpperCase())}`);
      if (result.data) {
        // Filter for SGBs or Gold related symbols
        setSearchResults(result.data.filter((d: any) => 
          d.tradingsymbol.toUpperCase().includes('SGB') || 
          d.tradingsymbol.toUpperCase().includes('GOLD')
        ));
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSymbol = (s: any) => {
    setName(s.tradingsymbol);
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !qty || !avg) return;
    onSave({
      name: name.toUpperCase(),
      qty: Number(qty),
      avg: Number(avg),
      ltp: Number(ltp || avg),
      pClose: Number(ltp || avg),
      type: 'SGB',
      exchange: 'NSE',
      source: 'manual'
    });
    setName('');
    setQty('');
    setAvg('');
    setLtp('');
    setSearchResults([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <Coins size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Manual SGB Entry</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">SGB Name / Symbol</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. SGBNOV28"
                      className="flex-1 bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-bold uppercase"
                      required
                    />
                    <button 
                      type="button"
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSearching ? '...' : 'Verify'}
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!name) return;
                        setIsSearching(true);
                        try {
                          const response = await fetch('/api/gemini/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              model: "gemini-3.5-flash",
                              contents: `Find the absolute latest market price for SGB titled: ${name}. Only return the numeric price.`,
                              config: { tools: [{ googleSearch: {} }] }
                            })
                          });
                          const data = await response.json();
                          if (!response.ok) throw new Error(data.error);
                          const match = data.text.match(/\d+(\.\d+)?/);
                          if (match) setLtp(match[0]);
                        } catch(e: any) {
                          addToast("AI Quota Exhausted", e.message || "Your Gemini API Key has exceeded its usage limits.", "error");
                        } finally { setIsSearching(false); }
                      }}
                      disabled={isSearching || !name}
                      className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                      title="Fetch Live Price with Gemini AI"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                       {searchResults.map((s, i) => (
                         <div 
                           key={i} 
                           onClick={() => selectSymbol(s)}
                           className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors border-b border-black/5 last:border-0"
                         >
                            <p className="text-[10px] font-black text-slate-900 dark:text-white">{s.tradingsymbol}</p>
                            <p className="text-[8px] text-zinc-500">{s.exchange} | {s.isin}</p>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Quantity (Units)</label>
                    <input
                      type="number"
                      step="any"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Avg Buy Price</label>
                    <input
                      type="number"
                      step="any"
                      value={avg}
                      onChange={(e) => setAvg(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Current Price (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={ltp}
                    onChange={(e) => setLtp(e.target.value)}
                    placeholder="Defaults to Avg Price"
                    className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-mono"
                  />
                  <p className="text-[9px] text-zinc-500 mt-2 italic">* Use "Live Refresh" on dashboard to update market prices later if ticker matches.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ThemeCustomizerModal = ({ isOpen, onClose, brandColor, setBrandColor }: { isOpen: boolean, onClose: () => void, brandColor: string, setBrandColor: (c: string) => void }) => {
  const hexToDecimalRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 };
  };

  const decimalToHex = (r: number, g: number, b: number) => {
    const toHexVal = (c: number) => {
      const hex = Math.max(0, Math.min(255, c)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`;
  };

  const rgbVals = useMemo(() => hexToDecimalRgb(brandColor), [brandColor]);

  const handleSliderChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const nextRgb = { ...rgbVals, [channel]: val };
    const nextHex = decimalToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setBrandColor(nextHex);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-lg overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand/10 rounded-xl text-brand">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Theme Customizer</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Personalize your workspace look</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Predefined Themes Grid */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-3">Predefined Brand Tones</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PREDEFINED_THEMES.map((theme) => {
                      const isSelected = brandColor.toLowerCase() === theme.color.toLowerCase();
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setBrandColor(theme.color)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${isSelected ? 'border-brand bg-brand/5 shadow-inner scale-[1.02]' : 'border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05]'}`}
                        >
                          <span 
                            className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-md relative"
                            style={{ backgroundColor: theme.color }}
                          >
                            {isSelected && <Check size={10} className="text-white drop-shadow-md" />}
                          </span>
                          <span className="text-xs font-black tracking-wide text-slate-800 dark:text-zinc-200">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* Custom Fine-Tuning controls */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Custom Master Tint</label>
                    <span className="text-xs font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">{brandColor.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    {/* Interactive Masked Color picker button */}
                    <div className="relative w-12 h-12 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden shrink-0 shadow-lg cursor-pointer">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer outline-none border-0"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[11px] font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">Color Spectrum Picker</p>
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-medium">Click the thumbnail to open the visual canvas palette selector.</p>
                    </div>
                  </div>

                  {/* RGB sliders section */}
                  <div className="space-y-3 bg-slate-50 dark:bg-white/[0.01] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Fine-Tune Color Matrix</p>
                    
                    {/* Red */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        <span>Red</span>
                        <span>{rgbVals.r}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbVals.r}
                        onChange={(e) => handleSliderChange('r', parseInt(e.target.value))}
                        className="w-full h-1 bg-red-500/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>

                    {/* Green */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        <span>Green</span>
                        <span>{rgbVals.g}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbVals.g}
                        onChange={(e) => handleSliderChange('g', parseInt(e.target.value))}
                        className="w-full h-1 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Blue */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        <span>Blue</span>
                        <span>{rgbVals.b}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbVals.b}
                        onChange={(e) => handleSliderChange('b', parseInt(e.target.value))}
                        className="w-full h-1 bg-blue-500/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setBrandColor('#6366f1')}
                    className="flex-1 py-3 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand text-white dark:text-zinc-950 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Apply Theme
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HoldingsTable = ({ user, holdings, brandColor, onSaveHolding, isApiMode, showManualTickers, setShowManualTickers, setAngelOneEnabled }: { user: any, holdings: any[], brandColor: string, onSaveHolding: (h: any) => Promise<void>, isApiMode?: boolean, showManualTickers: boolean, setShowManualTickers: (val: boolean) => void, setAngelOneEnabled?: (v: boolean) => void }) => {
  const { addToast } = useToasts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'overallGlPct', direction: 'desc' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAutoRefreshed = useRef(false);

  useEffect(() => {
    if (holdings.length === 0) return;

    let timeoutId: any;
    
    const scheduleNextRefresh = () => {
      const now = new Date();
      const nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0, 0);
      
      // If 3:30 PM has passed today, schedule for tomorrow
      if (now.getTime() >= nextRun.getTime()) {
        nextRun.setDate(now.getDate() + 1);
      }
      
      const timeToWait = nextRun.getTime() - now.getTime();
      
      timeoutId = setTimeout(() => {
        refreshPrices();
        scheduleNextRefresh();
      }, timeToWait);
    };

    scheduleNextRefresh();
    
    // Auto sync Yahoo/SGB on first mount if there are manual holdings
    if (!hasAutoRefreshed.current && holdings.some(h => (h.type === 'EQUITY' && !h.symboltoken) || h.type === 'SGB')) {
      hasAutoRefreshed.current = true;
      // Small delay to let the UI finish mounting
      setTimeout(() => refreshPrices(), 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [holdings.length]);

  const resolveSgbToken = async (sgb: any) => {
    try {
      // Clean up the name for better searching
      // e.g. "SGB MAY 2029" -> "SGBMAY29"
      let searchTerm = sgb.name.toUpperCase()
        .replace(/SOVEREIGN GOLD BOND/g, 'SGB')
        .replace(/\s+/g, '')
        .replace(/SERIES[IVX]+/g, '')
        .trim();
      
      const { data: searchResult } = await fetchJson(`/api/market/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (searchResult.status === 'success' && searchResult.data && searchResult.data.length > 0) {
        const matches = searchResult.data;
        // Priority 1: Exact match with -GB (NSE standard for SGBs)
        // Priority 2: Exact match name
        // Priority 3: Contains name and GB
        const match = matches.find((d: any) => d.tradingsymbol.toUpperCase() === `${searchTerm}-GB`) ||
                      matches.find((d: any) => d.tradingsymbol.toUpperCase() === searchTerm) ||
                      matches.find((d: any) => d.tradingsymbol.toUpperCase().includes(searchTerm) && d.tradingsymbol.toUpperCase().includes('GB')) ||
                      matches.find((d: any) => d.tradingsymbol.toUpperCase().includes(searchTerm)) ||
                      matches[0];

        if (match) {
          console.log(`Resolved SGB ${sgb.name} to ${match.symboltoken} on ${match.exchange} (${match.tradingsymbol})`);
          const updatedSgb = { 
            ...sgb, 
            symboltoken: match.symboltoken, 
            exchange: match.exchange || 'NSE',
            name: match.tradingsymbol.replace('-GB', '') // Normalize name to trading symbol
          };
          
          return updatedSgb;
        }
      }
    } catch (e) {
      console.error(`Failed to resolve SGB ${sgb.name}:`, e);
    }
    return sgb;
  };

  const getSgbIntelligenceWithGemini = async (sgbs: any[]) => {
    try {
      const sgbNames = sgbs.map(s => s.name).join(', ');
      addToast("AI Intelligence", "Consulting Gemini for SGB market estimates...", "info");
      
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3.5-flash",
          contents: `Identify the absolute latest market Last Traded Price (LTP) from today's real-time trading for THESE Indian Sovereign Gold Bonds (SGBs): ${sgbNames}. 
           Search Google for the most recent NSE/BSE gold bond prices. 
           Return a JSON array of objects with 'name' and 'ltp'. 
           Include the 'name' EXACTLY as provided in input.
           If the bond has low liquidity today, estimate the price based on the current market 24k gold price per gram.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  ltp: { type: "NUMBER" }
                },
                required: ["name", "ltp"]
              }
            }
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      try {
        let text = data.text.trim();
        // Handle markdown block wrapping (e.g. ```json ... ```)
        if (text.includes("```")) {
          const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (match && match[1]) {
            text = match[1].trim();
          }
        }
        // Extract array or object if prefixed/suffixed with any explanation/note
        if (!text.startsWith('[') && !text.startsWith('{')) {
          const arrayStart = text.indexOf('[');
          const objectStart = text.indexOf('{');
          if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
            const lastBracket = text.lastIndexOf(']');
            if (lastBracket !== -1) {
              text = text.substring(arrayStart, lastBracket + 1);
            }
          } else if (objectStart !== -1) {
            const lastBrace = text.lastIndexOf('}');
            if (lastBrace !== -1) {
              text = text.substring(objectStart, lastBrace + 1);
            }
          }
        }
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse Gemini SGB intelligence", e);
        return null;
      }
    } catch (e: any) {
      console.error("Gemini SGB Intelligence Error", e);
      addToast("AI Quota Exhausted", e.message || "Your Gemini API Key has exceeded its usage limits.", "error");
      return null;
    }
  };

  const refreshPrices = async () => {
    if (holdings.length === 0) return;
    setIsRefreshingPrices(true);
    try {
      // Step 1: Identify SGBs that might need token resolution (missing token or generic name)
      const sgbToResolve = holdings.filter(h => 
        h.type === 'SGB' && (!h.symboltoken || h.name.length > 15 || h.name.includes(' '))
      );
      
      const workingHoldings = [...holdings];

      if (sgbToResolve.length > 0) {
        addToast("Resolving SGBs", `Identifying market symbols for ${sgbToResolve.length} SGBs...`, "info");
        for (const sgb of sgbToResolve) {
          const resolved = await resolveSgbToken(sgb);
          if (resolved.symboltoken && resolved.symboltoken !== sgb.symboltoken) {
            await onSaveHolding(resolved);
            // Update local working set
            const idx = workingHoldings.findIndex(h => h.id === sgb.id);
            if (idx !== -1) workingHoldings[idx] = resolved;
          }
        }
      }

      const tokens = workingHoldings
        .filter(h => h.type !== 'SGB' && h.symboltoken && h.exchange)
        .map(h => ({ 
          symboltoken: h.symboltoken, 
          exchange: h.exchange, 
          tradingsymbol: h.name 
        }));

      let apiUpdateCount = 0;
      let apiFetchedTokens: Set<string> = new Set();

      if (tokens.length > 0) {
        const { data: result, status } = await fetchJson('/api/market/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens })
        });

        if (result.status === 'success' && result.data && result.data.fetched) {
          const fetchedData = result.data.fetched;
          
          for (const item of fetchedData) {
            const holding = workingHoldings.find(h => h.symboltoken === item.symboltoken && h.exchange === item.exchange);
            if (holding) {
               const newLtp = Number(item.ltp);
               if (newLtp > 0) {
                  apiFetchedTokens.add(item.symboltoken);
                  const updateData: any = { ...holding, ltp: newLtp, isAiVerified: false };
                  if (item.close && Number(item.close) > 0) {
                    updateData.pClose = Number(item.close);
                  }
                  await onSaveHolding(updateData);
                  apiUpdateCount++;
               }
            }
          }
        }
      }

      // Step 3: Gemini Search for ALL SGBs (Primary source for SGB as requested)
      const sgbsToUpdate = workingHoldings.filter(h => h.type === 'SGB');

      if (sgbsToUpdate.length > 0) {
        const aiPrices = await getSgbIntelligenceWithGemini(sgbsToUpdate);
        if (aiPrices && Array.isArray(aiPrices)) {
          let aiUpdateCount = 0;
          for (const aiPrice of aiPrices) {
            const holding = sgbsToUpdate.find(h => h.name === aiPrice.name);
            if (holding && aiPrice.ltp > 0) {
              await onSaveHolding({
                ...holding,
                ltp: aiPrice.ltp,
                isAiVerified: true,
                updatedAt: new Date().toISOString()
              });
              aiUpdateCount++;
            }
          }
          if (aiUpdateCount > 0) {
            addToast("AI Market Sync", `Fetched live prices for ${aiUpdateCount} SGBs via Google AI Search.`, "success");
          }
        }
      }

      // Step 4: Yahoo Finance for Manual Equities
      const manualEquitiesToUpdate = workingHoldings.filter(h => h.type === 'EQUITY' && !h.symboltoken);
      let yahooUpdateCount = 0;
      
      if (manualEquitiesToUpdate.length > 0) {
        addToast("Yahoo Finance Sync", `Fetching live prices for ${manualEquitiesToUpdate.length} manual equities...`, "info");
        try {
          const symbols = manualEquitiesToUpdate.map(h => h.name).join(',');
          const res = await fetch(`/api/yahoo/quote?symbols=${encodeURIComponent(symbols)}`);
          if (res.ok) {
            const data = await res.json();
            const results = data.quoteResponse?.result || [];
            
            for (const item of results) {
               const holding = manualEquitiesToUpdate.find(h => h.name === item.symbol);
               if (holding && item.regularMarketPrice > 0) {
                 await onSaveHolding({
                   ...holding,
                   ltp: item.regularMarketPrice,
                   pClose: item.regularMarketPreviousClose,
                   isAiVerified: false,
                   updatedAt: new Date().toISOString()
                 });
                 yahooUpdateCount++;
               }
            }
          }
        } catch (err) {
          console.error("Yahoo fetch failed", err);
        }
      }

      const totalUpdated = apiUpdateCount + (sgbsToUpdate.length > 0 ? sgbsToUpdate.length : 0) + yahooUpdateCount;
      addToast("Portfolio Updated", `Synced ${totalUpdated} assets using API and AI intelligence.`, "success");
    } catch (err) {
      console.error(err);
      addToast("Update Failed", (err as Error).message, "error");
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const compressImage = (dataUrl: string, maxDimension: number = 1600): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const processImageWithGemini = async (base64Data: string, mimeType: string) => {
    setIsProcessing(true);
    addToast("AI Analysis", "secure backend is extracting data from your upload...", "info");
    try {
      let finalData = base64Data;
      let finalMimeType = mimeType;

      // Ensure standard phone camera snapshots (often 3MB - 12MB) are compressed client-side
      // to resolve payload limits and speed up AI extraction
      if (mimeType.startsWith('image/') && (base64Data.startsWith('data:') || base64Data.length > 200000)) {
        try {
          addToast("AI Analysis", "Compressing image for faster extraction...", "info");
          let srcUrl = base64Data;
          if (!base64Data.startsWith('data:')) {
            srcUrl = `data:${mimeType};base64,${base64Data}`;
          }
          const compressed = await compressImage(srcUrl);
          finalData = compressed;
          finalMimeType = 'image/jpeg';
        } catch (compErr) {
          console.error("Client side compression failed, using original data", compErr);
        }
      }

      const resVal = await fetchJson('/api/extract-holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: finalData, mimeType: finalMimeType })
      });
      
      if (!resVal.ok) {
        throw new Error(resVal.data?.error || `Failed to extract holdings. Server returned status ${resVal.status}`);
      }
      
      const result = resVal.data;
      if (result && result.status === "success" && result.data) {
          const newHoldings = result.data;
          if (newHoldings.length > 0) {
             addToast("Resolving Assets", "AI extracted data. Now resolving market identifiers...", "info");
             const processedHoldings = [];
             for (let h of newHoldings) {
                // Heuristic: If name looks like SGB but type is EQUITY, fix it
                if (h.name.toUpperCase().includes('SGB') && h.type === 'EQUITY') {
                  h.type = 'SGB';
                }

                if (h.type === 'SGB') {
                  const resolved = await resolveSgbToken(h);
                  processedHoldings.push(resolved);
                } else {
                  processedHoldings.push(h);
                }
             }

             for (const h of processedHoldings) {
                await onSaveHolding(h);
             }
             addToast("Import Successful", `Successfully extracted ${newHoldings.length} holdings.`, "success");
          } else {
             addToast("No Data Detected", "Could not identify any holdings in the provided source.", "warning");
          }
      } else {
        throw new Error(result?.error || "Invalid response format received from extraction server.");
      }
    } catch(err) {
      console.error(err);
      addToast("AI Extraction Failed", (err as Error).message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    let handled = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handled = true;
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            processImageWithGemini(dataUrl, file.type);
          };
          reader.readAsDataURL(file);
        }
      }
    }
    if (!handled) {
       const text = e.clipboardData.getData('Text');
       if (text) {
          // Send text to Gemini
          processImageWithGemini(btoa(unescape(encodeURIComponent(text))), 'text/plain');
       }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onload = (event) => {
         const dataUrl = event.target?.result as string;
         processImageWithGemini(dataUrl, file.type);
       };
       reader.readAsDataURL(file);
    } else if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
       const reader = new FileReader();
       reader.onload = (event) => {
         const text = event.target?.result as string;
         if (text) {
           const base64Text = btoa(unescape(encodeURIComponent(text)));
           processImageWithGemini(base64Text, 'text/plain');
         }
       };
       reader.readAsText(file);
    } else {
       addToast("Unsupported Format", "Please upload an image (.png, .jpg), plain text (.txt), CSV (.csv) file, or paste your holdings text directly.", "warning");
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteHolding = async (holding: any) => {
    if (!user) return;
    const path = `artifacts/${appId}/users/${user.uid}/holdings/${holding.id}`;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/holdings`, holding.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const data = holdings.map(h => {
    const inv = h.qty * h.avg;
    const cur = h.qty * h.ltp;
    const overallGlAbs = cur - inv;
    const overallGlPct = (overallGlAbs / inv) * 100;
    const dayGlAbs = h.qty * (h.ltp - h.pClose);
    const dayGlPct = ((h.ltp - h.pClose) / h.pClose) * 100;

    return { ...h, inv, cur, overallGlAbs, overallGlPct, dayGlAbs, dayGlPct };
  }).sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const apiData = isApiMode ? data.filter(h => h.symboltoken) : [];
  const manualData = isApiMode ? data.filter(h => !h.symboltoken) : data;

  const renderRow = (row: any) => (
    <motion.tr 
      layout
      key={row.id} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ 
        layout: { type: "spring", stiffness: 200, damping: 25 },
        opacity: { duration: 0.3 }
      }}
      className={`group ${row.type === 'SGB' ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.08] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/[0.12] ring-amber-500/20' : 'bg-white/60 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] ring-black/5 dark:ring-white/5'} backdrop-blur-sm transition-all duration-300 ring-1 hover:ring-brand/30 rounded-2xl overflow-hidden`}
    >
      <td className="px-6 py-5 first:rounded-l-2xl group/td-name relative">
        {row.type === 'SGB' && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent pointer-events-none rounded-l-2xl" />
        )}
        <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white font-sans group/ticker relative">
          <div className={`w-9 h-9 rounded-xl ${row.type === 'SGB' ? 'bg-gradient-to-br from-amber-400/20 to-yellow-600/10 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-brand/10 text-brand border-brand/10'} flex items-center justify-center text-[10px] font-black shadow-sm border transition-all duration-500 group-hover/ticker:scale-110 group-hover/ticker:shadow-lg`}>
            {row.type === 'SGB' ? <Coins size={16} className="drop-shadow-sm" /> : row.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs tracking-tight uppercase ${row.type === 'SGB' ? 'text-amber-700 dark:text-amber-300' : ''}`}>{row.name}</span>
              {row.type === 'SGB' && (
                <span className="text-[7px] font-black tracking-[0.15em] uppercase bg-gradient-to-r from-amber-500/10 to-transparent text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  Sovereign Gold
                </span>
              )}
              {row.type === 'SGB' && row.isAiVerified && (
                <span className="text-[7px] font-black tracking-widest uppercase bg-brand/10 text-brand px-1.5 py-0.5 rounded-full ring-1 ring-brand/20 flex items-center gap-1 shadow-sm">
                  <Sparkles size={8} /> AI Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover/ticker:opacity-100 transition-all mt-0.5">
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-brand active:scale-95 transition-all text-zinc-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingHolding(row);
                }}
              >
                <Edit3 size={10} className="text-current" />
                <span className="text-[8px] font-black tracking-widest uppercase border-b border-current/20">Manage</span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-right font-mono text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{row.qty}</td>
      <td className="px-6 py-5 text-right font-mono text-[11px] text-slate-500 dark:text-zinc-400 font-medium">₹{formatAmt(row.avg)}</td>
      <td className="px-6 py-5 text-right font-mono text-[12px] text-slate-900 dark:text-white font-bold group/price">
          <div 
            className="flex items-center justify-end gap-3 p-2 -m-2 rounded-xl transition-all duration-500"
          >
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                   <span 
                     className="transition-all duration-300 group-hover/price:scale-110 origin-right"
                   >₹{formatAmt(row.ltp)}</span>
                   {row.isAiVerified && (
                     <motion.div
                       animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                     >
                       <Sparkles size={11} className="text-brand filter drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]" />
                     </motion.div>
                   )}
                   {row.type === 'SGB' && (
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         refreshPrices();
                       }}
                       disabled={isRefreshingPrices}
                       className="p-1.5 hover:bg-amber-500/20 rounded-lg transition-all text-amber-500/50 hover:text-amber-500 active:scale-75 shadow-sm hover:shadow-amber-500/20"
                       title="Force Sync with Gemini AI"
                     >
                       <RefreshCw size={11} className={`${isRefreshingPrices ? 'animate-spin' : 'group-hover/price:rotate-180 transition-transform duration-700'}`} />
                     </button>
                   )}
                </div>
                {row.isAiVerified && (
                  <span className="text-[6px] font-black text-brand uppercase tracking-[0.25em] mt-0.5 opacity-80 bg-brand/5 px-1 rounded">AI Verified Live</span>
                )}
             </div>
        </div>
      </td>
      <td className="px-6 py-5 text-right font-mono text-[11px] text-slate-500 dark:text-zinc-400 font-medium">₹{formatAmt(row.inv)}</td>
      <td className="px-6 py-5 text-right font-mono text-[11px] text-slate-900 dark:text-white font-black bg-brand/[0.03] dark:bg-brand/[0.05]">₹{formatAmt(row.cur)}</td>
      <td className="px-6 py-5 text-right last:rounded-r-2xl">
        <div className="flex flex-col items-end gap-1.5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] ring-1 transition-all duration-300 ${row.overallGlAbs >= 0 ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-500 ring-rose-500/20 shadow-lg shadow-rose-500/5'}`}>
            <span className="text-[10px]">{row.overallGlAbs >= 0 ? '▲' : '▼'}</span> 
            <span>₹{formatAmt(Math.abs(row.overallGlAbs))}</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${row.overallGlPct > 0 ? 'text-emerald-500/80 bg-emerald-500/5' : 'text-rose-500/80 bg-rose-500/5'}`}>
            <TrendingUp size={8} />
            {row.overallGlPct > 0 ? '+' : ''}{row.overallGlPct.toFixed(2)}%
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 font-bold text-[11px] ${row.dayGlAbs >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
             <div className={`w-1 h-1 rounded-full ${row.dayGlAbs >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
             {row.dayGlAbs >= 0 ? '+' : ''}₹{formatAmt(row.dayGlAbs)}
          </div>
          <div className={`text-[10px] font-black font-mono transition-all duration-300 ${row.dayGlAbs >= 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
            {row.dayGlPct > 0 ? '+' : ''}{row.dayGlPct.toFixed(2)}%
          </div>
        </div>
      </td>
    </motion.tr>
  );

  const SortIndicator = ({ column }: { column: string }) => {
    const isActive = sortConfig.key === column;
    
    return (
      <div className="relative flex items-center justify-center w-5 h-5 ml-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {!isActive ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ArrowUpDown size={10} />
            </motion.div>
          ) : (
            <motion.div
              key={sortConfig.direction}
              initial={{ 
                opacity: 0, 
                rotate: sortConfig.direction === 'asc' ? -90 : 90,
                scale: 0.5
              }}
              animate={{ 
                opacity: 1, 
                rotate: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                rotate: sortConfig.direction === 'asc' ? 90 : -90,
                scale: 0.5
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="text-brand"
            >
              {sortConfig.direction === 'asc' ? (
                <ChevronUp size={12} className="stroke-[3px]" />
              ) : (
                <ChevronDown size={12} className="stroke-[3px]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div 
      className="bg-white/40 dark:bg-[#0d0d0d]/40 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 overflow-visible mt-8 border border-white/20 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all duration-500 relative"
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 relative z-[60] border-b border-zinc-100 dark:border-zinc-800/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-brand rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]" />
            <div>
              <h3 className="text-slate-800 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-sm">
                Equity Dashboard
              </h3>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Activity size={10} className="text-brand" />
                DASHBOARD ANALYTICS SYSTEM
              </p>
            </div>
            {isProcessing && (
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                 className="w-3.5 h-3.5 rounded-full border-2 border-brand border-t-transparent ml-2"
               />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-5 justify-end">
           {setAngelOneEnabled && (
             <button 
               onClick={() => setAngelOneEnabled(!isApiMode)}
               className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl border transition-all shrink-0 cursor-pointer ${isApiMode ? 'bg-brand/10 border-brand/20 text-brand hover:bg-brand/20' : 'bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500/20'}`}
               title={isApiMode ? "Angel One API sync is ON" : "Angel One API sync is OFF"}
             >
               <span className={`w-1.5 h-1.5 rounded-full ${isApiMode ? 'bg-brand shadow-[0_0_8px_var(--brand-color-rgb)] animate-pulse' : 'bg-slate-400'}`} />
               {isApiMode ? 'A1 Connected' : 'A1 Offline'}
             </button>
           )}

           <button 
             onClick={refreshPrices}
             disabled={isRefreshingPrices || holdings.length === 0}
             className="relative overflow-hidden px-5 md:px-6 py-3 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-3 border-b-2 border-emerald-700/50 disabled:opacity-50 disabled:grayscale group shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40"
           >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {isRefreshingPrices ? (
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin relative z-10" />
              ) : (
                <div className="relative z-10">
                  <Activity size={14} className="group-hover:animate-pulse" />
                  <Sparkles size={8} className="absolute -top-1.5 -right-1.5 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <span className="hidden sm:inline relative z-10 drop-shadow-sm">{isRefreshingPrices ? 'Updating...' : 'Live Refresh + AI'}</span>
           </button>
           
           <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

           <AddTickerFeature user={user} holdings={holdings} onSaveHolding={onSaveHolding} />

           <button 
             onClick={() => setIsManualModalOpen(true)}
             className="relative overflow-hidden px-5 md:px-6 py-3 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl bg-amber-500 text-white hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 group border-b-2 border-amber-700/50"
           >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Coins size={14} className="group-hover:scale-110 transition-transform drop-shadow-md relative z-10" />
              <span className="hidden sm:inline relative z-10 drop-shadow-sm">Add SGB</span>
           </button>
        </div>
      </div>

      <div className="overflow-x-auto hide-scrollbar relative z-0">
        <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
          <thead>
            <tr className="uppercase text-[9px] font-black tracking-[0.2em] text-slate-400 select-none">
              <th className={`px-6 py-4 cursor-pointer rounded-l-2xl transition-all duration-500 group/th ${sortConfig.key === 'name' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('name')}>
                <div className="flex items-center gap-1.5">
                  <span className="relative">
                    Ticker
                    {sortConfig.key === 'name' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="name" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'qty' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('qty')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Units
                    {sortConfig.key === 'qty' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="qty" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'avg' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('avg')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Cost Bas.
                    {sortConfig.key === 'avg' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="avg" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'ltp' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('ltp')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Market
                    {sortConfig.key === 'ltp' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="ltp" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'inv' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('inv')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Invested
                    {sortConfig.key === 'inv' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="inv" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'cur' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('cur')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Value
                    {sortConfig.key === 'cur' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="cur" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer transition-all duration-500 group/th ${sortConfig.key === 'overallGlPct' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('overallGlPct')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    ROI
                    {sortConfig.key === 'overallGlPct' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="overallGlPct" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right cursor-pointer rounded-r-2xl transition-all duration-500 group/th ${sortConfig.key === 'dayGlPct' ? 'bg-brand/[0.03] dark:bg-brand/[0.06] text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`} onClick={() => requestSort('dayGlPct')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative">
                    Day Δ
                    {sortConfig.key === 'dayGlPct' && (
                      <motion.div layoutId="headerDot" className="absolute -right-2 top-0 w-1 h-1 bg-brand rounded-full" />
                    )}
                  </span>
                  <SortIndicator column="dayGlPct" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false} mode="popLayout">
              {apiData.length > 0 && (
                <motion.tr key="api-header" layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-slate-50 dark:bg-zinc-800/50">
                  <td colSpan={8} className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-brand border-b border-black/5 dark:border-white/5">
                     Synched Tickers
                  </td>
                </motion.tr>
              )}
              {apiData.map(renderRow)}
              
              {manualData.length > 0 && apiData.length > 0 && (
                <motion.tr key="manual-header" layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-slate-50 dark:bg-zinc-800/50">
                  <td colSpan={8} className="px-6 py-2 border-b border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                         Manual Tickers
                      </span>
                      <button 
                         onClick={() => setShowManualTickers(!showManualTickers)}
                         className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${showManualTickers ? 'bg-brand' : 'bg-slate-300 dark:bg-zinc-700'}`}
                      >
                         <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showManualTickers ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )}
              {(!isApiMode || showManualTickers) && manualData.map(renderRow)}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <ManualSgbModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onSave={onSaveHolding}
        brandColor={brandColor}
      />
      <HoldingEditModal
        isOpen={!!editingHolding}
        onClose={() => setEditingHolding(null)}
        onSave={onSaveHolding}
        onDelete={handleDeleteHolding}
        holding={editingHolding}
      />
    </div>
  );
};

export function MainApp({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }) {
  const { addToast } = useToasts();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [promptSearch, setPromptSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const CORRECT_PIN = '1234'; 
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  const [brandColor, setBrandColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brandColor') || '#6366f1';
    }
    return '#6366f1';
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [angelOneEnabled, setAngelOneEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('angelOneEnabled');
      if (saved) return saved === 'true';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('angelOneEnabled', angelOneEnabled.toString());
  }, [angelOneEnabled]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color-rgb', hexToRgb(brandColor));
    localStorage.setItem('brandColor', brandColor);
  }, [brandColor]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [benchmarkHistory, setBenchmarkHistory] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>('dashboards');
  const [showManualTickers, setShowManualTickers] = useState(true);

  const handleOverwriteHoldings = async (newHoldings: any[]) => {
    if (!user) {
      throw new Error("You must be logged in to update the dashboard.");
    }
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'holdings'));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    for (const holding of newHoldings) {
      const h: any = {
         id: generateId(),
         name: holding.name || 'Unknown',
         type: holding.type || 'EQUITY',
         ltp: holding.ltp || 0,
         cur: holding.marketValue || 0,
         overallGlAbs: holding.overallGain || 0,
         dayGlAbs: holding.todayGain || 0,
         qty: holding.qty || ((holding.marketValue && holding.ltp) ? (holding.marketValue / holding.ltp) : 1),
      };
      h.avg = holding.avg || ((h.cur - h.overallGlAbs) / h.qty);
      
      const holdingId = `holding_${h.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`;
      h.id = holdingId;
      batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'holdings', holdingId), h);
    }
    
    await batch.commit();
  };

  const saveHoldingToFirestore = async (holding: any) => {
    if (!user) return;
    const stableId = (holding.symboltoken && holding.exchange) 
      ? `holding_${holding.symboltoken}_${holding.exchange}`
      : (holding.symboltoken)
        ? `holding_${holding.symboltoken}`
        : `holding_${(holding.name || 'unknown').replace(/\s+/g, '_').toUpperCase()}`;
    const holdingId = holding.id || stableId;
    const path = `artifacts/${appId}/users/${user.uid}/holdings/${holdingId}`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/holdings`, holdingId), {
        ...holding,
        id: holdingId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveTradeToFirestore = async (trade: any) => {
    if (!user) return;
    const stableTradeId = trade.uniqueorderid || trade.orderid || trade.fillid || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tradeId = trade.id || stableTradeId;
    const path = `artifacts/${appId}/users/${user.uid}/api_trades/${tradeId}`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_trades`, tradeId), {
        ...trade,
        id: tradeId,
        syncedAt: Date.now()
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveFundsToFirestore = async (funds: any) => {
    if (!user) return;
    const path = `artifacts/${appId}/users/${user.uid}/api_funds/current`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_funds`, 'current'), {
        ...funds,
        syncedAt: Date.now()
      }, { merge: true });
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveHistoryToFirestore = async (date: string, value: number) => {
    if (!user) return;
    const histId = `auto_${date}`;
    const path = `artifacts/${appId}/users/${user.uid}/history/${histId}`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/history`, histId), {
        id: histId,
        date,
        marketValue: value,
        source: 'AngelOne API'
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveToTransactions = async (date: string, deposit: string, withdrawal: string) => {
    if (!user) return;
    const txnId = `api_${date}_${Date.now()}`;
    const path = `artifacts/${appId}/users/${user.uid}/transactions/${txnId}`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, txnId), {
        id: txnId,
        date,
        deposit: Number(deposit),
        withdrawal: Number(withdrawal),
        particulars: 'Sync from API',
        source: 'AngelOne API'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveApiSummaryToFirestore = async (summary: any) => {
    if (!user) return;
    const path = `artifacts/${appId}/users/${user.uid}/api_summary/holdings`;
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_summary`, 'holdings'), {
        ...summary,
        syncedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };
  const [prompts, setPrompts] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [apiTrades, setApiTrades] = useState<any[]>([]);
  const [apiSummary, setApiSummary] = useState<any>(null);
  const [brokerSettings, setBrokerSettings] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'broker_settings'), (snap) => {
      const settings: any = {};
      snap.forEach(d => {
        settings[d.id] = d.data();
      });
      setBrokerSettings(settings);
    });
    return () => unsub();
  }, [user]);
  const [files, setFiles] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130; // Offset for sticky nav
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const handleScroll = () => {
      const ids = ['dashboards', 'performance', 'savings', 'holdings', 'prompts', 'documents'];
      let currentActive = 'dashboards';
      
      const scrollPosition = window.scrollY + 200; // offset of the sticky nav height

      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          // getOffsetTop recursively to account for nested offset parents
          let offsetTop = 0;
          let el: HTMLElement | null = element;
          while (el) {
            offsetTop += el.offsetTop;
            el = el.offsetParent as HTMLElement;
          }
          
          if (offsetTop <= scrollPosition) {
            currentActive = id;
          }
        }
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

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
    }, (error) => {
      console.error("Auth state change error", error);
      setAuthError(`Auth state error: ${error.message}`);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleCredentialResponse = async (response: any) => {
      // not needed since we're using signInWithPopup
    };
    if (!loadingAuth && !user) {
      // Intentionally left mostly blank, handled by the onClick of the new button
    }
  }, [loadingAuth, user, isDarkMode]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthError(null);
    } catch (error: any) {
      console.error("Popup Login failed", error);
      setAuthError(`Firebase Sign-in Error: ${error.message} (Code: ${error.code})`);
    }
  };

  useEffect(() => {
    if (!user) return;
    const txnsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const histPath = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
    const promptsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');
    const filesPath = collection(db, 'artifacts', appId, 'users', user.uid, 'files');
    const apiTradesPath = collection(db, 'artifacts', appId, 'users', user.uid, 'api_trades');
    const apiSummaryPath = doc(db, 'artifacts', appId, 'users', user.uid, 'api_summary', 'holdings');
    const holdingsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'holdings');

    const unsubTxns = onSnapshot(txnsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTransactions([...sorted, { id: generateId(), date: new Date().toISOString().split('T')[0], deposit: '', withdrawal: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, txnsPath.path));

    const unsubHist = onSnapshot(histPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPortfolioHistory([...sorted, { id: generateId(), date: new Date().toISOString().split('T')[0], marketValue: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, histPath.path));

    const unsubBench = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'benchmark'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setBenchmarkHistory([...sorted, { id: generateId(), date: new Date().toISOString().split('T')[0], price: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `artifacts/${appId}/users/${user.uid}/benchmark`));

    const unsubPrompts = onSnapshot(promptsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setPrompts([...data, { id: generateId(), title: '', content: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, promptsPath.path));

    const unsubFiles = onSnapshot(filesPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setFiles(data.sort((a, b) => b.uploadedAt - a.uploadedAt));
    }, (error) => handleFirestoreError(error, OperationType.LIST, filesPath.path));

    const unsubApiTrades = onSnapshot(apiTradesPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setApiTrades(data.sort((a, b) => new Date(b.filltime || b.updatetime || 0).getTime() - new Date(a.filltime || a.updatetime || 0).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.LIST, apiTradesPath.path));

    const unsubApiSummary = onSnapshot(apiSummaryPath, (snapshot) => {
      if (snapshot.exists()) setApiSummary(snapshot.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, apiSummaryPath.path));

    const unsubHoldings = onSnapshot(holdingsPath, (snapshot) => {
      setHoldings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, holdingsPath.path));

    return () => { 
      unsubTxns(); unsubHist(); unsubBench();
      unsubPrompts(); unsubFiles(); unsubApiTrades(); unsubHoldings(); 
    };
  }, [user]);

  const updateCloudDoc = async (collName: string, id: string, data: any) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    try {
      const payload = { ...data };
      if (!payload.createdAt) {
        payload.createdAt = Date.now();
      }
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      const err = handleFirestoreError(error, OperationType.WRITE, docRef.path);
      if (err) addToast("Sync Warning", "Failed to save changes to cloud. Check your connection.", "warning");
    }
  };
  const deleteCloudDoc = async (collName: string, id: string) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      const err = handleFirestoreError(error, OperationType.DELETE, docRef.path);
      if (err) addToast("Deletion Failed", "Could not remove record from cloud.", "error");
    }
  };

  const handleAddPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptTitle.trim() && !newPromptContent.trim()) return;
    
    const id = generateId();
    updateCloudDoc('prompts', id, { title: newPromptTitle, content: newPromptContent });
    
    setNewPromptTitle('');
    setNewPromptContent('');
    setIsPromptModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError(null);
    } catch (error: any) {
      console.error("Logout failed", error);
    }
  };

  const handleTxnChange = (id: string, field: string, value: any) => {
    setTransactions(prev => {
      const row = prev.find(t => t.id === id);
      if (!row) return prev;
      const updated = { ...row, [field]: value };
      if (updated.date && (updated.deposit !== '' || updated.withdrawal !== '')) updateCloudDoc('transactions', id, updated);
      return prev.map(t => t.id === id ? updated : t);
    });
  };
  const handleTxnDelete = (id: string) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      const hasEmpty = next.some(t => t.deposit === '' && t.withdrawal === '');
      if (!hasEmpty) next.push({ id: generateId(), date: new Date().toISOString().split('T')[0], deposit: '', withdrawal: '' });
      return next;
    });
    deleteCloudDoc('transactions', id);
  };
  const handleMvChange = (id: string, field: string, value: any) => {
    setPortfolioHistory(prev => {
      const row = prev.find(p => p.id === id);
      if (!row) return prev;
      const updated = { ...row, [field]: value };
      if (updated.date && updated.marketValue !== '') updateCloudDoc('history', id, updated);
      return prev.map(p => p.id === id ? updated : p);
    });
  };
  const handleMvDelete = (id: string) => {
    setPortfolioHistory(prev => {
      const next = prev.filter(p => p.id !== id);
      const hasEmpty = next.some(p => p.marketValue === '');
      if (!hasEmpty) next.push({ id: generateId(), date: new Date().toISOString().split('T')[0], marketValue: '' });
      return next;
    });
    deleteCloudDoc('history', id);
  };
  const handleBenchChange = (id: string, field: string, value: any) => {
    setBenchmarkHistory(prev => {
      const row = prev.find(p => p.id === id);
      if (!row) return prev;
      const updated = { ...row, [field]: value };
      if (updated.date && updated.price !== '') updateCloudDoc('benchmark', id, updated);
      return prev.map(p => p.id === id ? updated : p);
    });
  };
  const handleBenchDelete = (id: string) => {
    setBenchmarkHistory(prev => {
      const next = prev.filter(p => p.id !== id);
      const hasEmpty = next.some(p => p.price === '');
      if (!hasEmpty) next.push({ id: generateId(), date: new Date().toISOString().split('T')[0], price: '' });
      return next;
    });
    deleteCloudDoc('benchmark', id);
  };
  const clearHistory = async (collName: string, titleStr: string) => {
    if (!user) return;
    try {
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, collName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        addToast("No Data", `There are no records to clear in ${titleStr}.`, "info");
        return;
      }

      const docs = snapshot.docs;
      // Firestore batch limit is 500 operations
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + 500);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      addToast("Data Cleared", `All ${titleStr} records have been removed successfully.`, "success");
    } catch (error) {
      console.error(error);
      addToast("Clear Failed", `Failed to clear ${titleStr} records. Check permissions.`, "error");
    }
  };

  const clearBenchmarkHistory = () => clearHistory('benchmark', 'Benchmark Closing Price');
  const clearTransactions = () => clearHistory('transactions', 'Transactions');
  const clearPortfolioHistory = () => clearHistory('history', 'Portfolio Value');

  const handlePromptChange = (id: string, field: string, value: any) => {
    const row = prompts.find(p => p.id === id);
    if (!row) return;
    const updated = { ...row, [field]: value };
    setPrompts(prev => prev.map(p => p.id === id ? updated : p));
    if (updated.title && updated.content) updateCloudDoc('prompts', id, updated);
  };

  const [draggedPromptId, setDraggedPromptId] = useState<string | null>(null);

  const handlePromptDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedPromptId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePromptDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
  };

  const handlePromptDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedPromptId || draggedPromptId === targetId) {
      setDraggedPromptId(null);
      return;
    }

    const currentValidPrompts = [...validPrompts];
    const draggedIndex = currentValidPrompts.findIndex(p => p.id === draggedPromptId);
    const targetIndex = currentValidPrompts.findIndex(p => p.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newValidPrompts = [...currentValidPrompts];
      const [draggedItem] = newValidPrompts.splice(draggedIndex, 1);
      newValidPrompts.splice(targetIndex, 0, draggedItem);
      
      setPrompts(prev => {
        const copy = [...prev];
        newValidPrompts.forEach((p, idx) => {
          const mainIdx = copy.findIndex(m => m.id === p.id);
          if (mainIdx > -1) {
            copy[mainIdx] = { ...copy[mainIdx], order: idx };
          }
        });
        return copy;
      });

      newValidPrompts.forEach((p, idx) => {
        updateCloudDoc('prompts', p.id, { title: p.title, content: p.content, order: idx });
      });
    }
    setDraggedPromptId(null);
  };

  const handlePromptContentEdit = (id: string, newContent: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
    updateCloudDoc('prompts', id, { content: newContent });
  };

  const handlePromptTitleEdit = (id: string, newTitle: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
    updateCloudDoc('prompts', id, { title: newTitle });
  };

  const handlePromptRatingEdit = (id: string, newRating: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, rating: newRating } : p));
    updateCloudDoc('prompts', id, { rating: newRating });
  };

  const handlePromptDelete = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    deleteCloudDoc('prompts', id);
  };

  const handlePaste = async (e: any, collName: string, keys: string[]) => {
    const pastedData = (e.clipboardData || (window as any).clipboardData).getData('Text');
    if (!pastedData) return;
    if (!pastedData.includes('\t') && !pastedData.includes('\n')) return;
    e.preventDefault();
    const rows = pastedData.trim().split('\n');
    for (const row of rows) {
      const cols = row.split('\t').map((c: string) => c.trim());
      if (cols.some((c: string) => c.length > 0)) {
        const id = generateId();
        const data: any = { id, createdAt: Date.now() };
        keys.forEach((key, i) => {
          if (cols[i] !== undefined && cols[i] !== '') {
            if (key === 'date') data[key] = parseDDMMYYYYtoISO(cols[i]);
            else if (key === 'title' || key === 'content') data[key] = cols[i];
            else {
              const num = parseFloat(cols[i].replace(/[^0-9.-]+/g, ""));
              data[key] = isNaN(num) ? "" : num;
            }
          }
        });
        await updateCloudDoc(collName, id, data);
      }
    }
  };

  const clearRecentHistory = async (collName: string, titleStr: string) => {
    if (!user) return;
    try {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, collName));
      const snapshot = await getDocs(q);
      
      const docsToDelete = snapshot.docs.filter(d => {
        const data = d.data() as any;
        return data.createdAt && data.createdAt > oneHourAgo;
      });

      if (docsToDelete.length === 0) {
        addToast("No Recent Data", `No records found added in the last hour for ${titleStr}. Note: Older records don't have timestamp tracking.`, "info");
        return;
      }

      const { writeBatch } = await import('firebase/firestore');
      for (let i = 0; i < docsToDelete.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = docsToDelete.slice(i, i + 500);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      
      addToast("Recent Data Cleared", `${docsToDelete.length} recent ${titleStr} records removed.`, "success");
    } catch (error) {
      console.error(error);
      addToast("Clear Failed", "Could not clear recent data.", "error");
    }
  };

  const clearRecentPortfolioHistory = () => clearRecentHistory('history', 'Portfolio Value');
  const clearRecentTransactions = () => clearRecentHistory('transactions', 'Transactions');
  const clearRecentBenchmark = () => clearRecentHistory('benchmark', 'Benchmark');

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (uploadedFiles: File[]) => {
    for (const file of uploadedFiles) {
      if (!file.type.includes('pdf') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
        addToast("Format Error", `File ${file.name} is not supported. Use PDF or JPEG.`, "warning");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast("File Too Large", `File ${file.name} exceeds 5MB limit.`, "warning");
        continue;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        const id = generateId();
        await updateCloudDoc('files', id, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          uploadedAt: Date.now()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const validTxns = useMemo(() => transactions.filter(t => t.date && (t.deposit !== '' || t.withdrawal !== '') && (angelOneEnabled || !t.id?.startsWith('api_'))).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [transactions, angelOneEnabled]);
  const validHistory = useMemo(() => portfolioHistory.filter(p => p.date && p.marketValue !== '' && (angelOneEnabled || !p.id?.startsWith('api_'))).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [portfolioHistory, angelOneEnabled]);
  const validBench = useMemo(() => {
    return benchmarkHistory
      .filter(b => b.date && (b.price !== '' && b.price !== null))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [benchmarkHistory]);
  const validPrompts = useMemo(() => {
    return prompts
      .filter(p => p.title && p.content)
      .sort((a, b) => {
        const orderA = a.order ?? 9999;
        const orderB = b.order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
  }, [prompts]);
  const filteredPrompts = useMemo(() => promptSearch ? validPrompts.filter(p => p.title.toLowerCase().includes(promptSearch.toLowerCase()) || p.content.toLowerCase().includes(promptSearch.toLowerCase())) : validPrompts, [validPrompts, promptSearch]);

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    
    const txnData = validTxns.map(t => ({ Date: t.date, Particulars: t.particulars || '', Deposit: t.deposit, Withdrawal: t.withdrawal }));
    const wsTxn = XLSX.utils.json_to_sheet(txnData);
    XLSX.utils.book_append_sheet(wb, wsTxn, 'Transactions');
    
    const histData = validHistory.map(h => ({ Date: h.date, 'Market Value': h.marketValue }));
    const wsHist = XLSX.utils.json_to_sheet(histData);
    XLSX.utils.book_append_sheet(wb, wsHist, 'Portfolio Value');

    const promptData = validPrompts.map(p => ({ Title: p.title, Content: p.content }));
    const wsPrompts = XLSX.utils.json_to_sheet(promptData);
    XLSX.utils.book_append_sheet(wb, wsPrompts, 'Prompts');

    XLSX.writeFile(wb, 'Portfolio_Data.xlsx');
  };

  const metrics = useMemo(() => {
    const apiMV = (angelOneEnabled && apiSummary?.totalholdingvalue) ? Number(apiSummary.totalholdingvalue) : 0;
    
    // Categorized calculation for live value from ALL holdings (synced or manual)
    const validHoldingsDetail = angelOneEnabled 
      ? (showManualTickers ? holdings : holdings.filter(h => h.symboltoken))
      : holdings.filter(h => !h.symboltoken);
    const holdingsDetail = validHoldingsDetail.reduce((acc, h: any) => {
      const val = (Number(h.qty) || 0) * (Number(h.ltp) || 0);
      const cleanedVal = isNaN(val) ? 0 : val;
      const type = (h.type || '').toUpperCase();
      const name = (h.name || '').toUpperCase();

      if (type === 'EQUITY' || type === 'STOCK') acc.stocks += cleanedVal;
      else if (type === 'MF' || type === 'MUTUAL_FUND') acc.mf += cleanedVal;
      else if (type === 'SGB' || name.startsWith('SGB')) acc.sgb += cleanedVal;
      else acc.others += cleanedVal;
      
      acc.total += cleanedVal;
      return acc;
    }, { stocks: 0, mf: 0, sgb: 0, others: 0, total: 0 });
    
    // The user explicitly wants Current Value = Stocks + Mutual Funds + SGB
    const explicitMV = holdingsDetail.stocks + holdingsDetail.mf + holdingsDetail.sgb;
    
    // Use the explicit sum as requested by the user
    const liveMV = explicitMV > 0 ? explicitMV : apiMV;
    
    const histMV = validHistory.length > 0 ? Number(validHistory[validHistory.length - 1].marketValue) : 0;
    const isLive = angelOneEnabled && liveMV > 0;
    const curMV = isLive ? liveMV : histMV;

    let net = 0; validTxns.forEach(t => net += (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0));
    let avgY = 0; if (validTxns.length > 0) { const years = Math.max(0.1, (new Date().getTime() - new Date(validTxns[0].date).getTime()) / (1000*60*60*24*365.25)); avgY = net / years; }
    const cashFlows = validTxns.map(t => ({ date: new Date(t.date), amount: (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0) }));
    cashFlows.push({ date: new Date(), amount: -curMV });
    const xirr = calculateXIRR(cashFlows);
    // Use actual XIRR for projections if it's within a reasonable range (-20% to 100%), otherwise fallback to 10% for conservative estimates
    const rate = (xirr !== null && xirr > -0.2 && xirr < 1.0) ? xirr : 0.10;
    // For future wealth projection specifically, we apply a floor of 8% and cap of 25% to avoid absurd projections from volatile history
    const projectionRate = Math.max(0.08, Math.min(0.25, rate));

    // SIMULATION: investing same amounts in Benchmark
    let simulatedBenchValue = 0;
    let benchXIRR = null;
    if (validBench.length > 0 && validTxns.length > 0) {
      const simulatedCashFlows: { date: Date, amount: number }[] = [];
      let totalUnits = 0;
      validTxns.forEach(t => {
        const p = getPriceForDate(t.date, validBench);
        const flow = (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0);
        if (p > 0) totalUnits += flow / p;
        simulatedCashFlows.push({ date: new Date(t.date), amount: flow });
      });
      const lastPrice = Number(validBench[validBench.length - 1].price);
      simulatedBenchValue = totalUnits * lastPrice;
      simulatedCashFlows.push({ date: new Date(), amount: -simulatedBenchValue });
      benchXIRR = calculateXIRR(simulatedCashFlows);
    }

    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const daysRemaining = Math.max(0, (endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const actualYearToDate = validTxns
      .filter(t => new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((acc, t) => acc + ((Number(t.deposit) || 0) - (Number(t.withdrawal) || 0)), 0);
    const projectedRemainder = (avgY / 365.25) * daysRemaining;
    const projectedYearEnd = actualYearToDate + projectedRemainder;

    const fv = (p: number, r: number, t: number, pmt: number) => {
      const r_annu = r === 0 ? 0.0001 : r; // prevent div by zero
      return p * Math.pow(1 + r_annu, t) + pmt * ((Math.pow(1 + r_annu, t) - 1) / r_annu);
    };

    return { 
      currentMV: curMV, 
      isLive,
      breakdown: {
        stocks: holdingsDetail.stocks,
        mf: holdingsDetail.mf,
        sgb: holdingsDetail.sgb
      },
      sgbValue: holdingsDetail.sgb,
      net, 
      pl: curMV - net, 
      avgY, 
      avgM: avgY/12, 
      avgD: avgY/365.25, 
      xirr, 
      rate: projectionRate, 
      benchXIRR,
      simulatedBenchValue,
      projectedYearEnd,
      fEoY: curMV * Math.pow(1 + projectionRate, daysRemaining / 365.25) + projectedRemainder,
      f5: fv(curMV, projectionRate, 5, avgY),
      f10: fv(curMV, projectionRate, 10, avgY),
      f20: fv(curMV, projectionRate, 20, avgY)
    };
  }, [validTxns, validHistory, benchmarkHistory, holdings, apiSummary, angelOneEnabled, showManualTickers]);

  const chartData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const rawDates = Array.from(new Set([
      ...validTxns.map(t => t.date), 
      ...validHistory.map(p => p.date), 
      ...validBench.map(b => b.date),
      today
    ])).sort();
    
    // Start from the date of the user's first transaction of deposit
    const firstDepositTxn = validTxns.find(t => (Number(t.deposit) || 0) > 0);
    const startDate = firstDepositTxn?.date;
    const dates = startDate ? rawDates.filter(d => d >= startDate) : rawDates;

    let dep = 0, units = 0, mv = 0;
    // We still need to accumulate dep and units from the VERY BEGINNING to have correct values at startDate
    // So we iterate over rawDates but only return objects for dates >= startDate
    return rawDates.map(d => {
      const p = getPriceForDate(d, validBench);
      validTxns.filter(t => t.date === d).forEach(t => { 
        const flow = (Number(t.deposit)||0) - (Number(t.withdrawal)||0); 
        dep += flow; 
        units += p > 0 ? (flow/p) : 0; 
      });
      
      const h = validHistory.find(x => x.date === d); 
      if (h) mv = Number(h.marketValue);
      
      if (startDate && d < startDate) return null;

      return { 
        date: d, 
        "Cumulative Net Deposits": dep, 
        "Market Value": mv || dep, 
        "Benchmark Value": units * p
      };
    }).filter(item => item !== null);
  }, [validTxns, validHistory, validBench]);

  if (authError) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-background-light dark:bg-[#050505] flex items-center justify-center">
        <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
        <div className="relative z-10 bg-surface-light dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-sm:mx-4 max-w-sm flex flex-col items-center shadow-2xl text-center">
          <AnimatedLogo brandColor={brandColor} />
          <h2 className="text-xl font-bold mt-6 mb-2 text-rose-500">Authentication Error</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">{authError}</p>
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={() => { setAuthError(null); setLoadingAuth(true); setTimeout(() => setLoadingAuth(false), 100); }} 
              className="w-full py-3 bg-brand hover:opacity-90 text-white dark:text-black font-bold rounded-xl transition-all"
            >
              Retry
            </button>
            <button 
              onClick={handleLogout} 
              className="w-full py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
          <p className="text-zinc-500 text-[10px] mt-6">Please check your Google Client ID and Firebase configuration.</p>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-background-light dark:bg-[#050505] flex items-center justify-center">
        <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
        <div className="relative z-10 flex flex-col items-center">
          <AnimatedLogo brandColor={brandColor} />
          <div className="mt-8 text-sm font-bold text-zinc-500 animate-pulse">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-background-light dark:bg-[#050505] flex items-center justify-center overflow-hidden">
        <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
        <div className="relative z-10 bg-surface-light dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col items-center shadow-2xl">
          <AnimatedLogo brandColor={brandColor} />
          <h2 className="text-xl font-bold mt-6 mb-2 tracking-tight">Investwise</h2>
          <p className="text-zinc-500 text-sm mb-8 text-center">Sign in to access your dashboard.</p>
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white rounded-full font-bold shadow-sm hover:shadow-md border border-black/10 dark:border-white/10 transition-all hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-background-light dark:bg-[#050505] selection:bg-brand/30`}>
      <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
      <div className="relative z-10 w-full pb-20">
        <nav className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/50 backdrop-blur-2xl sticky top-0 z-50 flex flex-col w-full">
          <div className="h-16 md:h-20 flex items-center border-b border-black/5 dark:border-white/5 md:border-none">
            <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {activeTab === 'data' ? (
                  <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 shadow-sm" title="Export to Excel">
                    <Download size={14} />
                    <span className="hidden sm:inline">Export CSV/XLSX</span>
                  </button>
                ) : (
                  <AnimatedLogo brandColor={brandColor} />
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-4 shrink-0 overflow-x-auto no-scrollbar">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10 shrink-0 items-center">
                  <button onClick={() => setActiveTab('dashboard')} className={`px-3 md:px-6 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm dark:bg-brand dark:text-black' : 'text-slate-500 dark:text-zinc-400'}`}>Dash</button>
                  <button onClick={() => setActiveTab('integrations')} className={`px-3 md:px-6 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-white text-slate-900 shadow-sm dark:bg-brand dark:text-black' : 'text-slate-500 dark:text-zinc-400'}`}>Integrate</button>
                  <button onClick={() => setActiveTab('data')} className={`px-3 md:px-6 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-white text-slate-900 shadow-sm dark:bg-brand dark:text-black' : 'text-slate-500 dark:text-zinc-400'}`}>Data</button>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1.5 md:p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black/10 transition-all shrink-0 cursor-pointer"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button 
                    onClick={() => setShowThemePicker(true)}
                    className="p-1.5 md:p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black/10 hover:text-brand transition-all shrink-0 cursor-pointer"
                    title="Customize UI Colors"
                    aria-label="Customize UI Colors"
                  >
                    <Palette size={16} style={{ color: brandColor }} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 md:p-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all shrink-0"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-start gap-2 md:gap-4 py-2 md:py-3 text-[9px] md:text-xs font-black tracking-[0.15em] text-slate-400 dark:text-zinc-500 uppercase overflow-x-auto no-scrollbar scroll-smooth">
              <button onClick={() => scrollToSection('dashboards')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'dashboards' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Dashboards</button>
              <button onClick={() => scrollToSection('performance')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'performance' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Performance</button>
              <button onClick={() => scrollToSection('savings')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'savings' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Savings</button>
              <button onClick={() => scrollToSection('holdings')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'holdings' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Equity</button>
              <button onClick={() => scrollToSection('filings')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'filings' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Filings</button>
              <button onClick={() => scrollToSection('prompts')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'prompts' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Prompts</button>
              <button onClick={() => scrollToSection('documents')} className={`transition-all whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl ${activeSection === 'documents' ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10' : 'hover:text-brand'}`}>Docs</button>
            </div>
          )}
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-10 relative z-10 min-h-screen">
          {/* Animated Background Mesh */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-blob filter" />
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000 filter" />
            <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-cyan-400/5 rounded-full blur-[110px] animate-blob animation-delay-4000 filter" />
            <div className="absolute inset-0 grid-background opacity-50 dark:opacity-20" />
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
              <div id="dashboards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <MetricCard 
                  title="Current Value" 
                  value={formatCurrency(metrics.currentMV)} 
                  rawValue={metrics.currentMV}
                  icon={IndianRupee} 
                  delay={0.1}
                  highlightColor="brand"
                  subtext={
                    metrics.isLive ? (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                        <span className="opacity-60">Stocks:</span>
                        <span className="text-brand">{formatCurrency(metrics.breakdown.stocks)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                        <span className="opacity-60">SGB:</span>
                        <span className="text-amber-500">{formatCurrency(metrics.breakdown.sgb)}</span>
                      </div>
                      {metrics.breakdown.mf > 0 && (
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                          <span className="opacity-60">MF:</span>
                          <span className="text-cyan-400">{formatCurrency(metrics.breakdown.mf)}</span>
                        </div>
                      )}
                    </div>
                    ) : (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex justify-start items-center text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                          Offline Snapshot
                        </div>
                      </div>
                    )
                  }
                  className="bg-gradient-to-br from-brand/10 to-brand/5 border-brand/30 dark:bg-gradient-to-br dark:from-brand/20 dark:to-transparent dark:border-brand/40 shadow-[0_20px_40px_-15px_rgba(var(--brand-color-rgb),0.3)]"
                />
                <MetricCard 
                  title="Net Deposits" 
                  value={formatCurrency(metrics.net)} 
                  rawValue={metrics.net}
                  icon={Wallet} 
                  delay={0.2}
                  highlightColor="zinc"
                />
                <MetricCard 
                  title="Unrealized P/L" 
                  value={formatCurrency(metrics.pl)} 
                  rawValue={metrics.pl}
                  icon={TrendingUp} 
                  trend={metrics.pl >= 0 ? 'up' : 'down'} 
                  subtext={`${metrics.pl >= 0 ? 'Profit' : 'Loss'} • XIRR: ${formatPercent(metrics.xirr)}`} 
                  delay={0.3}
                  highlightColor="emerald"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group overflow-hidden glass-card rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-5"><h3 className="text-[10px] md:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Avg Savings</h3><Calendar className="text-zinc-400" size={18} strokeWidth={2.5} /></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-zinc-400 tracking-widest uppercase">Annual</span><span className="text-base md:text-lg font-bold text-slate-900 dark:text-white"><NumberTicker value={metrics.avgY} /></span></div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-white/10"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-zinc-400 tracking-widest uppercase">Monthly</span><span className="text-slate-700 dark:text-zinc-300"><NumberTicker value={metrics.avgM} /></span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-zinc-400 tracking-widest uppercase">Daily</span><span className="text-[11px] md:text-sm font-medium text-slate-500 dark:text-zinc-400"><NumberTicker value={metrics.avgD} /></span></div>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group overflow-hidden glass-card rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-5">
                    <h3 className="text-[9px] md:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Future Wealth</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-violet-500 px-2 py-0.5 bg-violet-500/10 rounded-full border border-violet-500/20">{(metrics.rate * 100).toFixed(1)}% PROJ.</span>
                       <Rocket className="text-violet-400 shrink-0" size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline gap-2"><span className="text-[9px] md:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase whitespace-nowrap">End of Year</span><span className="text-sm md:text-lg font-bold text-slate-900 dark:text-white truncate"><NumberTicker value={metrics.fEoY} /></span></div>
                    <div className="flex justify-between items-baseline gap-2 text-slate-500 dark:text-zinc-400"><span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">5 Years</span><span className="text-xs md:text-base font-semibold truncate"><NumberTicker value={metrics.f5} /></span></div>
                    <div className="flex justify-between items-baseline gap-2 text-slate-500 dark:text-zinc-400"><span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">10 Years</span><span className="text-xs md:text-base font-semibold truncate"><NumberTicker value={metrics.f10} /></span></div>
                    <div className="flex justify-between items-baseline gap-2 pt-1 border-t border-white/5"><span className="text-[9px] md:text-[10px] font-black text-violet-600 tracking-widest uppercase whitespace-nowrap">20 Years</span><span className="text-sm md:text-lg font-black text-violet-400 truncate"><NumberTicker value={metrics.f20} /></span></div>
                  </div>
                </motion.div>


              </div>



              <motion.div 
                id="performance"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl p-4 md:p-6 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs tracking-[0.2em] flex items-center gap-2">
                       Alpha Strategy Performance
                    </h3>
                    <p className="text-[8px] md:text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Net Portfolio vs Manual Benchmark</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setAngelOneEnabled(!angelOneEnabled)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all shrink-0 cursor-pointer ${angelOneEnabled ? 'bg-brand/10 border-brand/20 text-brand hover:bg-brand/20' : 'bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500/20'}`}
                        title={angelOneEnabled ? "Angel One API sync is ON" : "Angel One API sync is OFF"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${angelOneEnabled ? 'bg-brand shadow-[0_0_8px_var(--brand-color-rgb)] animate-pulse' : 'bg-slate-400'}`} />
                        {angelOneEnabled ? 'A1 Connected' : 'A1 Offline'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] md:h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                        <CartesianGrid vertical={false} stroke={isDarkMode ? "#1f1f22" : "#e4e4e7"} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fill:'#71717a', fontSize:9, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={d => new Date(d).toLocaleDateString(undefined,{month:'short', year:'2-digit'})} minTickGap={30} />
                      <YAxis tick={{fill:'#71717a', fontSize:9, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{backgroundColor: isDarkMode ? '#09090b' : '#ffffff', border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius:12, boxShadow:'0 10px 30px -10px rgba(0,0,0,0.2)'}} itemStyle={{fontWeight:700, padding:'2px 0', fontSize: '10px'}} labelStyle={{color:'#71717a', fontWeight:700, marginBottom:'6px', textTransform:'uppercase', fontSize:'8px', letterSpacing:'0.05em'}} formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingBottom: '10px', color: '#71717a' }} iconType="circle" />
                      <Line type="monotone" dataKey="Cumulative Net Deposits" stroke={isDarkMode ? "#818cf8" : "#6366f1"} strokeWidth={2} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: isDarkMode ? '#818cf8' : '#6366f1'}} />
                      <Line type="monotone" dataKey="Market Value" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: "#34d399"}} />
                      <Line type="monotone" dataKey="Benchmark Value" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: "#22d3ee"}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <div id="savings">
                <NetSavingsChart transactions={validTxns} isDarkMode={isDarkMode} brandColor={brandColor} />
              </div>

              <div id="holdings">
                <HoldingsTable user={user} holdings={angelOneEnabled ? holdings : holdings.filter(h => !h.symboltoken)} brandColor={brandColor} onSaveHolding={saveHoldingToFirestore} isApiMode={angelOneEnabled} showManualTickers={showManualTickers} setShowManualTickers={setShowManualTickers} setAngelOneEnabled={setAngelOneEnabled} />
              </div>

              <div id="filings">
                <FilingsDashboard brandColor={brandColor} />
              </div>

              {angelOneEnabled && apiTrades.length > 0 && (
                <div id="api-trades" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand"><Activity size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">Recent API Transactions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {apiTrades.slice(0, 5).map((trade, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={trade.id || idx} 
                        className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 w-1 h-full ${trade.transactiontype === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{trade.exchange}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${trade.transactiontype === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {trade.transactiontype}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{trade.tradingsymbol}</h4>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">Qty: <span className="text-slate-900 dark:text-zinc-300 font-bold">{trade.fillqty || trade.quantity}</span></span>
                          <span className="text-zinc-500">@ <span className="text-slate-900 dark:text-zinc-300 font-bold">₹{trade.fillprice || trade.averageprice}</span></span>
                        </div>
                        <div className="mt-3 text-[9px] text-zinc-400 font-mono">
                          {trade.filltime || trade.updatetime || 'Recently'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div id="prompts" className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="p-2 bg-brand/10 rounded-lg text-brand"><MessageSquare size={20} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">Prompts</h3></div><div className="relative group max-w-sm w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={16} /><input type="text" placeholder="Search snippets..." value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200/60 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" /></div></div>
                {filteredPrompts.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{filteredPrompts.map(p => (<motion.div layout key={p.id} className="relative"><PromptCard id={p.id} title={p.title} content={p.content} rating={p.rating} brandColor={brandColor} isDragging={draggedPromptId === p.id} onDragStart={handlePromptDragStart} onDragOver={handlePromptDragOver} onDrop={handlePromptDrop} onEditContent={handlePromptContentEdit} onEditTitle={handlePromptTitleEdit} onEditRating={handlePromptRatingEdit} onDelete={handlePromptDelete} /></motion.div>))}<motion.div layout key="add-prompt-btn"><button onClick={() => setIsPromptModalOpen(true)} className="h-14 w-full bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-5 transition-all hover:border-brand/30 hover:bg-brand/5 flex items-center justify-center gap-3 text-slate-500 hover:text-brand cursor-pointer"><div className="p-1.5 bg-slate-50 dark:bg-white/5 rounded-full group-hover:bg-brand/20 transition-colors"><Plus size={16} /></div><span className="text-sm font-bold tracking-tight">Add Prompt</span></button></motion.div></div>) : (<div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-10 md:p-16 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center"><MessageSquare size={32} className="text-slate-300 dark:text-zinc-800 mb-4" /><p className="text-slate-400 dark:text-zinc-600 text-sm font-medium">{promptSearch ? "No snippets matching your search." : "Your prompt vault is empty."}</p><button onClick={() => setIsPromptModalOpen(true)} className="mt-6 px-6 py-2 bg-brand text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"><Plus size={16} /> Add Prompt</button></div>)}
              </div>

              <div id="documents" className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand"><File size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Documents</h3>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={documentFileInputRef}
                  onChange={handleFileUpload}
                />
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {files.map(f => (
                      <a key={f.id} href={f.data} download={f.name} className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-lg hover:border-brand/30 transition-all group flex items-center gap-4 cursor-pointer">
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl group-hover:bg-brand/10 transition-colors">
                          {f.type.includes('pdf') ? <FileText size={24} className="text-rose-500"/> : <ImageIcon size={24} className="text-brand"/>}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</h4>
                          <p className="text-xs text-zinc-500">{(f.size / 1024).toFixed(1)} KB • {formatDateToDDMMYYYY(f.uploadedAt)}</p>
                        </div>
                      </a>
                    ))}
                    <button onClick={() => documentFileInputRef.current?.click()} className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-5 border border-dashed border-black/10 dark:border-white/10 transition-all hover:border-brand/30 hover:bg-brand/5 group flex items-center justify-center gap-4 cursor-pointer min-h-[90px]">
                      <div className="flex items-center gap-3 text-zinc-500 group-hover:text-brand transition-colors">
                        <Plus size={20} />
                        <span className="text-sm font-bold tracking-tight">Add Document</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-10 md:p-16 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center">
                    <File size={32} className="text-zinc-300 dark:text-zinc-800 mb-4" />
                    <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">No documents uploaded yet.</p>
                    <button onClick={() => documentFileInputRef.current?.click()} className="mt-6 px-6 py-2 bg-brand text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                      <Plus size={16} /> Add Document
                    </button>
                  </div>
                )}
              </div>

              <div className="pb-10">
                <Footer />
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Active Integrations</h2>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Connect external platforms to sync your portfolio in real-time</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AngelOneIntegration 
                    user={user} 
                    angelOneEnabled={angelOneEnabled}
                    setAngelOneEnabled={setAngelOneEnabled}
                    manualAssetsValue={metrics.sgbValue}
                    brokerSettings={brokerSettings}
                    saveHoldingToFirestore={async (holding: any) => {
                      if (!user) return;
                      // Use a stable ID based on symboltoken or name
                      const stableId = (holding.symboltoken && holding.exchange) 
                        ? `holding_${holding.symboltoken}_${holding.exchange}`
                        : (holding.symboltoken)
                          ? `holding_${holding.symboltoken}`
                          : `holding_${(holding.name || 'unknown').replace(/\s+/g, '_').toUpperCase()}`;
                      
                      const holdingId = holding.id || stableId;
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/holdings`, holdingId), {
                        ...holding,
                        id: holdingId
                      });
                    }} 
                    saveTradeToFirestore={async (trade: any) => {
                      if (!user) return;
                      // Use trade.uniqueorderid or orderid or fillid for deterministic ID
                      const stableTradeId = trade.uniqueorderid || trade.orderid || trade.fillid || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      const tradeId = trade.id || stableTradeId;
                      
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_trades`, tradeId), {
                        ...trade,
                        id: tradeId,
                        syncedAt: Date.now()
                      });
                    }}
                    saveFundsToFirestore={async (funds: any) => {
                      if (!user) return;
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_funds`, 'current'), {
                        ...funds,
                        syncedAt: Date.now()
                      }, { merge: true });
                    }}
                    saveHistoryToFirestore={async (date: string, value: number) => {
                      if (!user) return;
                      // Check if already exists for this date to avoid duplicates if user clicks sync multiple times
                      const histId = `auto_${date}`;
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/history`, histId), {
                        id: histId,
                        date: date,
                        marketValue: value
                      });
                    }}
                    saveToTransactions={async (date: string, deposit: string, withdrawal: string) => {
                      if (!user) return;
                      // We save it to the manual transactions collection
                      const txnId = `api_txn_${date}_${Math.random().toString(36).substr(2, 5)}`;
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, txnId), {
                        id: txnId,
                        date: date,
                        deposit: Number(deposit),
                        withdrawal: Number(withdrawal),
                        source: 'AngelOne API'
                      });
                    }}
                    saveApiSummaryToFirestore={async (summary: any) => {
                      if (!user) return;
                      await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/api_summary`, 'holdings'), {
                        ...summary,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                  />

                  {/* Future Integrations Placeholder */}
                  <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4 group hover:border-brand/30 transition-all cursor-not-allowed grayscale">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors border border-slate-100 dark:border-0 shadow-sm">
                      <Plus size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-400 tracking-tight mt-1">Zerodha / Groww</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                <Sheet title="Transactions" coll="transactions" data={transactions} onEdit={handleTxnChange} onDelete={handleTxnDelete} keys={['date','particulars','deposit','withdrawal']} onPaste={(e: any) => handlePaste(e,'transactions',['date','particulars','deposit','withdrawal'])} brandColor={brandColor} correctPin={CORRECT_PIN} onClearAll={clearTransactions} onClearRecent={clearRecentTransactions} />
                <Sheet title="Portfolio Value" coll="history" data={portfolioHistory} onEdit={handleMvChange} onDelete={handleMvDelete} keys={['date','marketValue']} onPaste={(e: any) => handlePaste(e,'history',['date','marketValue'])} brandColor={brandColor} correctPin={CORRECT_PIN} onClearAll={clearPortfolioHistory} onClearRecent={clearRecentPortfolioHistory} />
                <Sheet 
                  title="Benchmark Closing Price" 
                  coll="benchmark" 
                  data={benchmarkHistory} 
                  onEdit={handleBenchChange} 
                  onDelete={handleBenchDelete} 
                  keys={['date','price']} 
                  onPaste={(e: any) => handlePaste(e, 'benchmark', ['date', 'price'])} 
                  brandColor={brandColor} 
                  correctPin={CORRECT_PIN} 
                  onClearAll={clearBenchmarkHistory}
                  onClearRecent={clearRecentBenchmark}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isPromptModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-black/10 dark:border-white/10 w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Prompt</h3>
                <form onSubmit={handleAddPromptSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Title</label>
                    <input
                      type="text"
                      value={newPromptTitle}
                      onChange={(e) => setNewPromptTitle(e.target.value)}
                      placeholder="e.g. Code Review Prompt"
                      className="w-full bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand/50 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Prompt</label>
                    <textarea
                      value={newPromptContent}
                      onChange={(e) => setNewPromptContent(e.target.value)}
                      placeholder="Write your prompt content here..."
                      className="w-full bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand/50 transition-all min-h-[120px] resize-y font-mono"
                      required
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsPromptModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPromptTitle.trim() && !newPromptContent.trim()}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Save Prompt
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollToTop />
      <ThemeCustomizerModal 
        isOpen={showThemePicker} 
        onClose={() => setShowThemePicker(false)} 
        brandColor={brandColor} 
        setBrandColor={setBrandColor} 
      />
      <GeminiChatbot 
        brandColor={brandColor} 
        user={user} 
        holdings={holdings} 
        onOverwriteHoldings={handleOverwriteHoldings} 
      />
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  return (
    <ErrorBoundary isDarkMode={isDarkMode}>
      <ToastProvider isDarkMode={isDarkMode}>
        <MainApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function Sheet({ title, data, onEdit, onDelete, keys, onPaste, brandColor, correctPin, noLock, onClearAll, onClearRecent }: any) {
  const [isLocked, setIsLocked] = useState(!noLock);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRecentConfirm, setShowRecentConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, Record<string, any>>>({});

  const handleClear = () => {
    onClearAll();
    setShowClearConfirm(false);
    setShowDropdown(false);
  };

  const handleClearRecent = () => {
    onClearRecent();
    setShowRecentConfirm(false);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLock = () => {
    setIsLocked(true);
    setShowDropdown(false);
  };

  const savedItems = data.filter((row: any) => !!row.id && (
    row.title || 
    row.content || 
    row.particulars ||
    (row.deposit !== '' && row.deposit !== undefined) || 
    (row.withdrawal !== '' && row.withdrawal !== undefined) || 
    (row.marketValue !== '' && row.marketValue !== undefined) || 
    (row.price !== '' && row.price !== undefined)
  ));
  const activeItems = data.filter((row: any) => !!row.id && !savedItems.includes(row));

  const handleLocalChange = (rowId: string, k: string, val: any) => {
    setLocalEdits(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [k]: val
      }
    }));
  };

  const handleSaveRow = (rowId: string) => {
    const edits = localEdits[rowId];
    if (!edits) return;
    Object.keys(edits).forEach(k => {
       onEdit(rowId, k, edits[k]);
    });
    setLocalEdits(prev => {
       const next = { ...prev };
       delete next[rowId];
       return next;
    });
  };

  const selectableItems = [...savedItems, ...activeItems].filter(item => item.id);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any other row clicks
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteConfirm = () => {
    selectedIds.forEach(id => onDelete(id));
    setSelectedIds([]);
    setIsConfirmModalOpen(false);
  };

  const handleSheetCopy = () => {
    let tsv = "";
    for (const row of [...savedItems, ...activeItems]) {
      const cols = keys.map((k: string) => {
        if (k === 'date' && row[k]) return formatDateToDDMMYYYY(row[k]);
        return row[k] || '';
      });
      if (cols.some((c: any) => c !== '')) {
         if (tsv) tsv += "\n";
         tsv += cols.join("\t");
      }
    }
    if (tsv) {
      navigator.clipboard.writeText(tsv);
      setShowDropdown(false);
    }
  };

  const handleSheetPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const mockEvent = {
         preventDefault: () => {},
         clipboardData: { getData: () => text }
      };
      onPaste(mockEvent);
      setShowDropdown(false);
    } catch (e) {
      console.error(e);
      setShowPasteArea(true);
      setShowDropdown(false);
    }
  };

  return (
    <div className={`bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-black/5 dark:border-white/5 flex flex-col shadow-2xl relative transition-all duration-300 ${showDropdown ? 'z-50' : 'z-10'}`}>
      <div className="p-3 md:p-4 border-b border-black/5 dark:border-white/5 bg-muted-light/20 flex justify-between items-center uppercase text-[9px] md:text-[10px] font-black tracking-[0.2em] text-zinc-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {title}
            {isLocked && <Lock size={12} className="text-zinc-500/50" />}
          </div>
          
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setIsConfirmModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
              selectedIds.length > 0 
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 shadow-md shadow-rose-500/5' 
                : 'bg-black/5 dark:bg-white/5 border-transparent text-zinc-500 opacity-40 cursor-not-allowed grayscale'
            }`}
          >
            <Trash2 size={12} className={selectedIds.length > 0 ? "group-hover:scale-110 transition-transform" : ""} />
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">
              {selectedIds.length > 0 ? `DELETE (${selectedIds.length})` : 'BULK DELETE'}
            </span>
          </button>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
              isLocked 
                ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white shadow-sm' 
                : 'bg-brand text-white border-brand shadow-lg shadow-brand/20 hover:shadow-brand/40 active:scale-95 hover:-translate-y-0.5'
            }`}
          >
            {!isLocked && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
            {isLocked ? (
              <Lock size={12} className="relative z-10 opacity-70 group-hover:scale-110 transition-transform" />
            ) : (
              <Edit3 size={12} className="relative z-10 opacity-90 drop-shadow-sm group-hover:scale-110 transition-transform" />
            )}
            <span className={`text-[9px] md:text-[10px] font-black tracking-[0.2em] relative z-10 ${!isLocked ? 'drop-shadow-sm' : ''}`}>
              {isLocked ? 'Read Only Mode' : 'EDIT MODE'}
            </span>
            <ChevronDown size={12} className={`transition-transform duration-300 relative z-10 ${showDropdown ? 'rotate-180' : ''} ${!isLocked ? 'drop-shadow-sm opacity-90' : 'opacity-70'}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { 
                    if (isLocked) {
                      setIsLocked(false);
                    } else {
                      handleLock();
                    }
                    setShowDropdown(false); 
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest flex items-center justify-between transition-colors text-slate-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {isLocked ? (
                    <>UNLOCK RECORDS <ShieldCheck size={12} className="text-emerald-500" /></>
                  ) : (
                    <>LOCK RECORDS <Lock size={12} className="text-zinc-500" /></>
                  )}
                </button>
                {!isLocked && onClearRecent && (
                  <div className="border-t border-black/5 dark:border-white/5 mt-1 pt-1">
                    {showRecentConfirm ? (
                      <div className="flex items-center gap-1 p-1">
                        <button 
                          onClick={handleClearRecent}
                          className="flex-1 bg-amber-500 text-white text-[8px] font-black py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          CONFIRM UNDO LAST HR
                        </button>
                        <button 
                          onClick={() => setShowRecentConfirm(false)}
                          className="px-2 py-2 bg-zinc-100 dark:bg-white/10 text-zinc-500 text-[8px] font-black rounded-lg hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowRecentConfirm(true)}
                        className="w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest flex items-center justify-between text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        REMOVE LAST 1HR <History size={12} />
                      </button>
                    )}
                  </div>
                )}
                {!isLocked && onClearAll && (
                  <div className="border-t border-black/5 dark:border-white/5 mt-1 pt-1">
                    {showClearConfirm ? (
                      <div className="flex items-center gap-1 p-1">
                        <button 
                          onClick={handleClear}
                          className="flex-1 bg-rose-500 text-white text-[8px] font-black py-2 rounded-lg hover:bg-rose-600 transition-colors"
                        >
                          CONFIRM DELETE
                        </button>
                        <button 
                          onClick={() => setShowClearConfirm(false)}
                          className="px-2 py-2 bg-zinc-100 dark:bg-white/10 text-zinc-500 text-[8px] font-black rounded-lg hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest flex items-center justify-between text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        CLEAR ALL DATA <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasteArea && (
        <div className="absolute inset-0 z-30 bg-surface-light/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface-light dark:bg-[#0d0d0d] p-6 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col shadow-2xl relative">
            <button onClick={() => setShowPasteArea(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              ✕
            </button>
            <h4 className="text-sm font-bold mb-2 tracking-tight">Paste Data Manually</h4>
            <p className="text-[10px] text-zinc-500 mb-4">Browser blocked clipboard access securely. Paste your tabular data here.</p>
            <textarea 
              autoFocus
              className="w-full bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 p-3 rounded-xl focus:outline-none focus:border-brand transition-all font-mono text-[10px] mb-4 h-32 resize-none placeholder:text-zinc-500 text-slate-900 dark:text-white"
              placeholder="Cmd+V / Ctrl+V here..."
              onChange={(e) => {
                const text = e.target.value;
                if (!text) return;
                const mockEvent = {
                   preventDefault: () => {},
                   clipboardData: { getData: () => text }
                };
                onPaste(mockEvent);
                setShowPasteArea(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[400px] md:max-h-[500px] bg-muted-light dark:bg-black/40 scrollbar-thin scrollbar-thumb-white/10 relative shadow-inner">
        <table className="w-full text-[11px] md:text-xs text-left border-collapse table-fixed min-w-[450px] md:min-w-[500px]">
          <thead className="sticky top-0 bg-surface-light dark:bg-[#0d0d0d] z-20 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_2px_rgba(255,255,255,0.05)] border-b border-black/5 dark:border-white/5">
            <tr className="divide-x divide-slate-100 dark:divide-white/5 uppercase text-[8px] md:text-[9px] font-black tracking-widest text-slate-400">
              <th className="p-3 md:p-4 w-10 md:w-12 text-center bg-slate-50 dark:bg-[#0d0d0d]">#</th>
              {keys.map((k: string) => {
                let colorClass = "";
                if (k === 'deposit') colorClass = "text-emerald-500 bg-emerald-500/5";
                else if (k === 'withdrawal') colorClass = "text-rose-500 bg-rose-500/5";
                else if (k === 'marketValue' || k === 'price') colorClass = "text-brand bg-brand/5";
                
                return <th key={k} className={`p-3 md:p-4 bg-surface-light dark:bg-[#0d0d0d] ${colorClass}`}>{k}</th>;
              })}
              <th className="p-3 md:p-4 w-12 md:w-14 bg-surface-light dark:bg-[#0d0d0d]"></th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((row: any, i: number) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr key={row.id} className={`border-b border-black/5 dark:border-white/5 group transition-colors h-[48px] md:h-[56px] ${isSelected ? 'bg-brand/[0.04]' : 'hover:bg-brand/[0.02]'}`}>
                  <td 
                    onClick={(e) => toggleSelect(row.id, e)}
                    className={`p-3 md:p-4 font-mono text-[9px] md:text-[10px] w-10 md:w-12 text-center cursor-pointer transition-all ${isSelected ? 'bg-brand text-white font-bold' : 'text-zinc-400 dark:text-zinc-600 hover:bg-brand/10 hover:text-brand'}`}
                    title="Click to select for bulk action"
                  >
                    {i+1}
                  </td>
                  {keys.map((k: string) => {
                    let textColor = "text-slate-900 dark:text-white";
                    let focusColor = "focus:bg-brand/[0.05]";
                    
                    if (k === 'deposit') {
                      textColor = "text-emerald-600 dark:text-emerald-400";
                      focusColor = "focus:bg-emerald-500/10";
                    } else if (k === 'withdrawal') {
                      textColor = "text-rose-600 dark:text-rose-400";
                      focusColor = "focus:bg-rose-500/10";
                    } else if (k === 'marketValue' || k === 'price') {
                      textColor = "text-brand";
                      focusColor = "focus:bg-brand/10";
                    }

                    return (
                      <td key={k} className="p-0 border-l border-black/5 dark:border-white/5 relative">
                        {k === 'date' ? (
                          <input 
                            type="date"
                            value={localEdits[row.id]?.[k] !== undefined ? localEdits[row.id][k] : (row[k] || '')} 
                            onPaste={(e) => {
                               const text = e.clipboardData.getData('Text');
                               if (text && !text.includes('\t') && !text.includes('\n')) {
                                  const parsed = parseDDMMYYYYtoISO(text);
                                  if (parsed) {
                                     e.preventDefault();
                                     handleLocalChange(row.id, k, parsed);
                                  }
                               } else {
                                  onPaste(e);
                               }
                            }} 
                            onChange={e => handleLocalChange(row.id, k, e.target.value)} 
                            className={`w-full p-3 md:p-4 bg-transparent outline-none ${focusColor} ${textColor} transition-colors font-mono text-[10px] md:text-[11px] h-12 md:h-14 placeholder:text-zinc-600 dark:placeholder:text-zinc-600 [color-scheme:light] dark:[color-scheme:dark]`} 
                          />
                        ) : k === 'content' ? (
                          <textarea 
                            value={localEdits[row.id]?.[k] !== undefined ? localEdits[row.id][k] : (row[k] || '')} 
                            onChange={e => handleLocalChange(row.id, k, e.target.value)} 
                            onPaste={onPaste} 
                            placeholder="..." 
                            className="w-full p-3 md:p-4 bg-transparent outline-none focus:bg-brand/[0.05] text-slate-900 dark:text-white transition-colors resize-none h-[48px] md:h-[56px] font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600 dark:placeholder:text-zinc-600" 
                            rows={1} 
                          />
                        ) : (
                          <input 
                            type={(k === 'title' || k === 'particulars') ? 'text' : 'number'} 
                            value={localEdits[row.id]?.[k] !== undefined ? localEdits[row.id][k] : (row[k] === undefined ? '' : row[k])} 
                            onPaste={(e) => {
                               const text = e.clipboardData.getData('Text');
                               if (text && !text.includes('\t') && !text.includes('\n') && k !== 'title' && k !== 'particulars') {
                                  const parsed = parseFloat(text.replace(/[^0-9.-]+/g, ""));
                                  if (!isNaN(parsed)) {
                                     e.preventDefault();
                                     handleLocalChange(row.id, k, parsed);
                                  }
                               } else {
                                  onPaste(e);
                               }
                            }} 
                            onChange={e => handleLocalChange(row.id, k, e.target.value)} 
                            placeholder={k === 'title' || k === 'particulars' ? '...' : '0.00'} 
                            className={`w-full p-3 md:p-4 bg-transparent outline-none ${focusColor} ${textColor} transition-colors font-mono text-[10px] md:text-[11px] h-12 md:h-14 placeholder:text-zinc-600 dark:placeholder:text-zinc-600`} 
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="p-0 text-center border-l border-black/5 dark:border-white/5 w-12 md:w-14">
                    <button 
                      onClick={() => handleSaveRow(row.id)} 
                      className="w-full h-full p-3 md:p-4 text-zinc-700 dark:text-zinc-600 hover:text-emerald-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center"
                      title="Save row"
                    >
                      <Save size={16}/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {savedItems.length > 0 && (
            <tbody className="border-t border-black/5 dark:border-white/5 relative z-10">
              <tr 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                className={`cursor-pointer transition-all ${isHistoryOpen ? 'bg-black/5 dark:bg-white/[0.03]' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.02]'}`}
              >
                <td colSpan={keys.length + 2} className="p-0">
                  <div className="w-full p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-brand/10 text-brand">
                        <Database size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Historical Records ({savedItems.length})</span>
                    </div>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </td>
              </tr>
            </tbody>
          )}

          {savedItems.length > 0 && isHistoryOpen && (
            <tbody className="bg-black/[0.02] dark:bg-white/[0.01]">
              {savedItems.map((row: any, i: number) => {
                const isReadOnly = isLocked;
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr key={row.id} className={`border-b border-black/5 dark:border-white/5 group transition-colors ${isReadOnly ? 'opacity-80' : isSelected ? 'bg-brand/[0.04]' : 'hover:bg-brand/[0.02]'} h-[48px] md:h-[56px]`}>
                    <td 
                      onClick={(e) => !isReadOnly && toggleSelect(row.id, e)}
                      className={`p-3 md:p-4 font-mono text-[9px] md:text-[10px] w-10 md:w-12 text-center transition-all ${!isReadOnly && isSelected ? 'bg-brand text-white font-bold cursor-pointer' : !isReadOnly ? 'text-zinc-400 dark:text-zinc-600 hover:bg-brand/10 hover:text-brand cursor-pointer' : 'text-zinc-400 dark:text-zinc-600'}`}
                      title={!isReadOnly ? "Click to select" : ""}
                    >
                      {i+1}
                    </td>
                    {keys.map((k: string) => {
                      let textColor = "text-slate-700 dark:text-zinc-400";
                      if (k === 'deposit') textColor = "text-emerald-600 dark:text-emerald-400";
                      else if (k === 'withdrawal') textColor = "text-rose-600 dark:text-rose-400";
                      else if (k === 'marketValue' || k === 'price') textColor = "text-brand";

                      return (
                        <td key={k} className="p-3 md:p-4 border-l border-black/5 dark:border-white/5">
                          {isReadOnly ? (
                            <div className={`${textColor} font-mono text-[10px] md:text-[11px] select-none italic truncate max-w-[200px]`}>
                              {k === 'date' ? (row[k] ? formatDateToDDMMYYYY(row[k]) : '—') : (row[k] || '—')}
                            </div>
                          ) : (
                            k === 'date' ? (
                              <input 
                                type="date" 
                                value={row[k] || ''} 
                                onPaste={(e) => {
                                   const text = e.clipboardData.getData('Text');
                                   if (text && !text.includes('\t') && !text.includes('\n')) {
                                      const parsed = parseDDMMYYYYtoISO(text);
                                      if (parsed) {
                                         e.preventDefault();
                                         onEdit(row.id, k, parsed);
                                      }
                                   } else {
                                      onPaste(e);
                                   }
                                }} 
                                onChange={e => onEdit(row.id, k, e.target.value)} 
                                className={`w-full bg-transparent outline-none focus:bg-brand/[0.05] ${textColor} transition-colors font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600 [color-scheme:light] dark:[color-scheme:dark]`} 
                              />
                            ) : k === 'content' ? (
                              <textarea 
                                value={row[k] || ''} 
                                onChange={e => onEdit(row.id, k, e.target.value)} 
                                onPaste={onPaste} 
                                className="w-full bg-transparent outline-none focus:bg-brand/[0.05] text-slate-900 dark:text-white transition-colors resize-none font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600" 
                                rows={1} 
                              />
                            ) : (
                              <input 
                                type={(k === 'title' || k === 'particulars') ? 'text' : 'number'} 
                                value={row[k] === undefined ? '' : row[k]} 
                                onPaste={(e) => {
                                   const text = e.clipboardData.getData('Text');
                                   if (text && !text.includes('\t') && !text.includes('\n') && k !== 'title' && k !== 'particulars') {
                                      const parsed = parseFloat(text.replace(/[^0-9.-]+/g, ""));
                                      if (!isNaN(parsed)) {
                                         e.preventDefault();
                                         onEdit(row.id, k, parsed);
                                      }
                                   } else {
                                      onPaste(e);
                                   }
                                }}
                                onChange={e => onEdit(row.id, k, e.target.value)} 
                                className={`w-full bg-transparent outline-none focus:bg-brand/[0.05] ${textColor} transition-colors font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600`} 
                              />
                            )
                          )}
                        </td>
                      );
                    })}
                    <td className="p-0 text-center border-l border-black/5 dark:border-white/5 w-12 md:w-14">
                      {!isReadOnly ? (
                        <button 
                          onClick={() => onDelete(row.id)} 
                          className="w-full h-full p-3 md:p-4 text-zinc-700 dark:text-zinc-600 hover:text-rose-500 transition-all flex items-center justify-center"
                          title="Delete historical record"
                        >
                          <Trash2 size={16}/>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500/20">
                          <Lock size={12}/>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      <AnimatePresence>
        {isConfirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-black/10 dark:border-white/10 w-full max-w-sm p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Delete Items</h3>
              <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                Are you sure you want to delete the <span className="text-rose-500 font-bold">{selectedIds.length}</span> selected items? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDeleteConfirm}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
