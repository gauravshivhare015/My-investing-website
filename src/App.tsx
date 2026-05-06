import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, IndianRupee, Activity, 
  Calendar, Wallet, ArrowUpRight, ArrowDownRight,
  Database, LayoutDashboard, Trash2, LineChart as LineChartIcon, Rocket, Lock, Cloud,
  Copy, Check, MessageSquare, Search, Target, Sun, Moon,
  UploadCloud, FileText, Image as ImageIcon, File, Download, LogOut,
  ChevronDown, ShieldCheck, GripVertical, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Firebase Imports ---
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from './firebase';

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
      ctx.fillStyle = isDarkMode ? '#050505' : '#fdfcfb';
      ctx.fillRect(0, 0, width, height);

      const brandRgbCanvas = hexToRgb(brandColor).replace(/ /g, ', ');
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
      glow.addColorStop(0, isDarkMode ? `rgba(${brandRgbCanvas}, 0.05)` : `rgba(${brandRgbCanvas}, 0.1)`); 
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

      const growthColor = '#34d399'; // Emerald 400
      const capitalColor = isDarkMode ? '#ffffff' : '#4b5563'; // Crisp White / Zinc 600
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
      const growthColor = '#10b981'; // Emerald 500
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
  }, [transactions, selectedYear, brandColor]);

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
          return tooltipItem.raw !== 0 || tooltipItem.dataset.label !== 'Projected Remainder';
        },
        callbacks: {
          title: (items: any[]) => {
            return `📅 ${items[0].label}`;
          },
          label: function(context: any) {
            let label = context.dataset.label || '';
            const isActual = label === 'Actual Net Savings';
            const icon = isActual ? '💰 ' : '🔮 ';
            
            if (label) {
              label = icon + label + ': ';
            }
            if (context.parsed.y !== null) {
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
        <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-50">
          Net Savings {selectedYear ? `(${selectedYear})` : '(Yearly)'}
        </h3>
        {selectedYear !== null && (
          <button 
            onClick={() => setSelectedYear(null)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-slate-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all self-start md:self-auto"
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

const MetricCard = ({ title, value, rawValue, icon: Icon, subtext, trend, highlightColor = 'brand', delay = 0 }: any) => {
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
      className="relative group overflow-hidden glass-card rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/50 dark:hover:bg-white/[0.06]"
    >
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-white/0 ${lineGlow} blur-[1px] transition-all duration-500`} />
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[10px] md:text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase">{title}</h3>
        <div className={`p-1.5 md:p-2 bg-black/5 dark:bg-white/5 rounded-lg md:rounded-xl ${colorClass} group-hover:scale-110 transition-all duration-300`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <div className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight truncate">
          {typeof rawValue === 'number' ? <NumberTicker value={rawValue} /> : value}
        </div>
        {subtext && (
          <div className={`text-[10px] md:text-sm flex items-center gap-1 mt-1 md:mt-2 font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'}`}>
            {trend === 'up' && <ArrowUpRight size={14} strokeWidth={2.5} />}
            {trend === 'down' && <ArrowDownRight size={14} strokeWidth={2.5} />}
            {subtext}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PromptCard = ({ id, title, content, isDragging, onDragStart, onDragOver, onDrop, onEditContent }: any) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

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

  return (
    <div 
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, id)}
      onDragOver={(e) => !isEditing && onDragOver(e, id)}
      onDrop={(e) => !isEditing && onDrop(e, id)}
      className={`bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border ${isDragging ? 'border-brand border-dashed opacity-50' : 'border-black/5 dark:border-white/5'} p-4 md:p-5 transition-all hover:border-brand/30 group ${isEditing ? '' : 'cursor-grab active:cursor-grabbing'} flex flex-col justify-center h-40 w-full relative overflow-hidden`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 max-w-[80%]">
          <div className={`text-zinc-400 dark:text-zinc-600 ${isEditing ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}><GripVertical size={14} /></div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white transition-colors truncate">{title || 'Untitled Prompt'}</h4>
        </div>
        {!isEditing && (
          <button onClick={handleCopy} className={`opacity-0 group-hover:opacity-100 p-1.5 md:p-2 rounded-lg transition-all shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-brand hover:bg-brand/10'}`}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
      <div className={`grid transition-all duration-300 ease-in-out w-full ${isEditing ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mt-3'}`}>
        <div className="overflow-hidden w-full">
          <div className="bg-muted-light dark:bg-black/40 rounded-xl p-3 border border-black/5 dark:border-white/5 h-full max-h-[80px] overflow-y-auto">
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
                className="w-full bg-transparent text-xs text-zinc-500 font-mono resize-none focus:outline-none min-h-[48px]"
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
      if (dPart.length <= 2 && mPart.length <= 2 && yPart.length === 4) return `${dPart.padStart(2, '0')}-${mPart.padStart(2, '0')}-${yPart}`;
    }
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDDMMYYYYtoISO = (val: string) => {
  if (!val) return '';
  const parts = val.split(/[-/]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return val;
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

  const [brandColor, setBrandColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brandColor') || '#10b981';
    }
    return '#10b981';
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color-rgb', hexToRgb(brandColor));
    localStorage.setItem('brandColor', brandColor);
  }, [brandColor]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [benchmarkHistory, setBenchmarkHistory] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130; // Offset for sticky nav
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

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
    const benchPath = collection(db, 'artifacts', appId, 'users', user.uid, 'benchmark');
    const promptsPath = collection(db, 'artifacts', appId, 'users', user.uid, 'prompts');
    const filesPath = collection(db, 'artifacts', appId, 'users', user.uid, 'files');

    const unsubTxns = onSnapshot(txnsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTransactions([...sorted, { id: generateId(), date: '', deposit: '', withdrawal: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, txnsPath.path));
    const unsubHist = onSnapshot(histPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPortfolioHistory([...sorted, { id: generateId(), date: '', marketValue: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, histPath.path));
    const unsubBench = onSnapshot(benchPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setBenchmarkHistory([...sorted, { id: generateId(), date: '', price: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, benchPath.path));
    const unsubPrompts = onSnapshot(promptsPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setPrompts([...data, { id: generateId(), title: '', content: '' }]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, promptsPath.path));
    const unsubFiles = onSnapshot(filesPath, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setFiles(data.sort((a, b) => b.uploadedAt - a.uploadedAt));
    }, (error) => handleFirestoreError(error, OperationType.LIST, filesPath.path));
    return () => { unsubTxns(); unsubHist(); unsubBench(); unsubPrompts(); unsubFiles(); };
  }, [user]);

  const updateCloudDoc = async (collName: string, id: string, data: any) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    try {
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docRef.path);
    }
  };
  const deleteCloudDoc = async (collName: string, id: string) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collName, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docRef.path);
    }
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

  const handlePaste = async (e: any, collName: string, keys: string[]) => {
    const pastedData = (e.clipboardData || (window as any).clipboardData).getData('Text');
    if (!pastedData || !pastedData.includes('\t')) return;
    e.preventDefault();
    const rows = pastedData.trim().split('\n');
    for (const row of rows) {
      const cols = row.split('\t').map((c: string) => c.trim());
      if (cols.length >= keys.length) {
        const id = generateId();
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

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (uploadedFiles: File[]) => {
    for (const file of uploadedFiles) {
      if (!file.type.includes('pdf') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
        alert(`File ${file.name} is not a supported format. Only PDF and JPEG are allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please upload files under 5MB.`);
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

  const validTxns = useMemo(() => transactions.filter(t => t.date && (t.deposit !== '' || t.withdrawal !== '')).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [transactions]);
  const validHistory = useMemo(() => portfolioHistory.filter(p => p.date && p.marketValue !== '').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [portfolioHistory]);
  const validBench = useMemo(() => benchmarkHistory.filter(b => b.date && b.price !== '').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [benchmarkHistory]);
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
    
    const txnData = validTxns.map(t => ({ Date: t.date, Deposit: t.deposit, Withdrawal: t.withdrawal }));
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
    const curMV = validHistory.length > 0 ? Number(validHistory[validHistory.length - 1].marketValue) : 0;
    let net = 0; validTxns.forEach(t => net += (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0));
    let avgY = 0; if (validTxns.length > 0) { const years = Math.max(0.1, (new Date().getTime() - new Date(validTxns[0].date).getTime()) / (1000*60*60*24*365.25)); avgY = net / years; }
    const cashFlows = validTxns.map(t => ({ date: new Date(t.date), amount: (Number(t.deposit) || 0) - (Number(t.withdrawal) || 0) }));
    cashFlows.push({ date: new Date(), amount: -curMV });
    const xirr = calculateXIRR(cashFlows);
    const rate = (xirr !== null && xirr > 0 && xirr < 0.5) ? xirr : 0.10;

    // Calculate Benchmark CAGR
    let benchCAGR = null;
    if (validBench.length > 1) {
      const startPrice = Number(validBench[0].price);
      const endPrice = Number(validBench[validBench.length - 1].price);
      const startTime = new Date(validBench[0].date).getTime();
      const endTime = new Date(validBench[validBench.length - 1].date).getTime();
      const years = Math.max(0.001, (endTime - startTime) / (1000 * 60 * 60 * 24 * 365.25));
      if (startPrice > 0 && endPrice > 0) {
        benchCAGR = Math.pow(endPrice / startPrice, 1 / years) - 1;
      }
    }

    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const daysRemaining = Math.max(0, (endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const actualYearToDate = validTxns
      .filter(t => new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((acc, t) => acc + ((Number(t.deposit) || 0) - (Number(t.withdrawal) || 0)), 0);
    const projectedRemainder = (avgY / 365.25) * daysRemaining;
    const projectedYearEnd = actualYearToDate + projectedRemainder;

    return { 
      currentMV: curMV, 
      net, 
      pl: curMV - net, 
      avgY, 
      avgM: avgY/12, 
      avgD: avgY/365.25, 
      xirr, 
      rate, 
      benchCAGR,
      projectedYearEnd,
      fEoY: curMV * Math.pow(1 + rate, daysRemaining / 365.25) + projectedRemainder,
      f5: curMV*Math.pow(1+rate,5) + avgY*((Math.pow(1+rate,5)-1)/rate), 
      f10: curMV*Math.pow(1+rate,10) + avgY*((Math.pow(1+rate,10)-1)/rate), 
      f20: curMV*Math.pow(1+rate,20) + avgY*((Math.pow(1+rate,20)-1)/rate) 
    };
  }, [validTxns, validHistory, validBench]);

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
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
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
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden">
        <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
        <div className="relative z-10 bg-surface-light dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-sm flex flex-col items-center shadow-2xl">
          <AnimatedLogo brandColor={brandColor} />
          <h2 className="text-xl font-bold mt-6 mb-2 tracking-tight">Portfolio Tracker Pro</h2>
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
    <div className={`relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-[#050505] selection:bg-brand/30`}>
      <InteractiveBackground isDarkMode={isDarkMode} brandColor={brandColor} />
      <div className="relative z-10 w-full pb-20">
        <nav className="border-b border-black/5 dark:border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0 z-50 flex flex-col w-full">
          <div className="h-20 flex items-center border-b border-black/5 dark:border-white/5 md:border-none">
            <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AnimatedLogo brandColor={brandColor} />

                <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors cursor-pointer shrink-0">
                  <Download size={12} className="text-blue-400" />
                  <span className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-tight">Export</span>
                </button>
              </div>
              <div className="flex items-center gap-2 md:gap-4 font-mono">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10 shrink-0">
                  <button onClick={() => setActiveTab('dashboard')} className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-brand text-black dark:text-black shadow-[0_0_15px_rgb(var(--brand-color-rgb)_/_0.3)]' : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}>Dashboard</button>
                  <button onClick={() => setActiveTab('data')} className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-brand text-black dark:text-black shadow-[0_0_15px_rgb(var(--brand-color-rgb)_/_0.3)]' : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}>Data</button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all"
                  title="Log Out"
                >
                  <LogOut size={18} />
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto px-4 w-full overflow-x-auto hide-scrollbar flex items-center justify-start gap-6 py-3 text-xs md:text-sm font-bold tracking-tight text-zinc-500 uppercase">
              <button onClick={() => scrollToSection('dashboards')} className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">Dashboards</button>
              <button onClick={() => scrollToSection('performance')} className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">Performance Comparison</button>
              <button onClick={() => scrollToSection('savings')} className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">Net Savings</button>
              <button onClick={() => scrollToSection('prompts')} className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">Prompts</button>
              <button onClick={() => scrollToSection('documents')} className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">Documents</button>
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
                  highlightColor="zinc"
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
                    <div className="flex justify-between items-baseline"><span className="text-[9px] md:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Annual</span><span className="text-base md:text-lg font-bold text-slate-900 dark:text-white"><NumberTicker value={metrics.avgY} /></span></div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-black/5 dark:border-white/10"><span className="text-[9px] md:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Monthly</span><span className="text-zinc-700 dark:text-zinc-300"><NumberTicker value={metrics.avgM} /></span></div>
                    <div className="flex justify-between items-baseline"><span className="text-[9px] md:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Daily</span><span className="text-[11px] md:text-sm font-medium text-zinc-500 dark:text-zinc-400"><NumberTicker value={metrics.avgD} /></span></div>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group overflow-hidden glass-card rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-5"><h3 className="text-[10px] md:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Future Wealth</h3><Rocket className="text-violet-400" size={18} strokeWidth={2.5} /></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline"><span className="text-[9px] md:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">End of Year</span><span className="text-base md:text-lg font-bold text-slate-900 dark:text-white"><NumberTicker value={metrics.fEoY} /></span></div>
                    <div className="flex justify-between items-baseline text-zinc-500 dark:text-zinc-400"><span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">5 Years</span><span className="text-sm md:text-base font-semibold"><NumberTicker value={metrics.f5} /></span></div>
                    <div className="flex justify-between items-baseline text-zinc-500 dark:text-zinc-400"><span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">10 Years</span><span className="text-sm md:text-base font-semibold"><NumberTicker value={metrics.f10} /></span></div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-white/5"><span className="text-[9px] md:text-[10px] font-black text-violet-600 tracking-widest uppercase">20 Years</span><span className="text-base md:text-lg font-black text-violet-400"><NumberTicker value={metrics.f20} /></span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-2"><div className="flex justify-between items-center text-[7px] md:text-[8px] font-bold tracking-widest uppercase text-zinc-500"><span>Progress to 10 Cr</span><span className="text-violet-400">{((metrics.f20 / 100000000) * 100).toFixed(1)}%</span></div><div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.f20 / 100000000) * 100)}%` }} /></div></div>
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
                    <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs">Performance Comparison</h3>
                    <p className="text-[8px] md:text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Total market value vs benchmark cagr</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[8px] md:text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5"><div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-400" /> Net Deposits</div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5"><div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400" /> Market Value</div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5"><div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400" /> Benchmark</div>
                  </div>
                </div>
                <div className="h-[250px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                        <CartesianGrid vertical={false} stroke={isDarkMode ? "#1f1f22" : "#e4e4e7"} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{fill:'#71717a', fontSize:9, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={d => new Date(d).toLocaleDateString(undefined,{month:'short', year:'2-digit'})} minTickGap={30} />
                      <YAxis tick={{fill:'#71717a', fontSize:9, fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{backgroundColor: isDarkMode ? '#09090b' : '#ffffff', border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius:12, boxShadow:'0 10px 30px -10px rgba(0,0,0,0.2)'}} itemStyle={{fontWeight:700, padding:'2px 0', fontSize: '10px'}} labelStyle={{color:'#71717a', fontWeight:700, marginBottom:'6px', textTransform:'uppercase', fontSize:'8px', letterSpacing:'0.05em'}} formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="Cumulative Net Deposits" stroke={isDarkMode ? "#71717a" : "#94a3b8"} strokeWidth={2} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: isDarkMode ? '#71717a' : '#94a3b8'}} />
                      <Line type="monotone" dataKey="Market Value" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: "#34d399"}} />
                      <Line type="monotone" dataKey="Benchmark Value" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{r:4, stroke: isDarkMode ? '#050505' : '#ffffff', strokeWidth:2, fill: '#22d3ee'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <div id="savings">
                <NetSavingsChart transactions={validTxns} isDarkMode={isDarkMode} brandColor={brandColor} />
              </div>

              <div id="prompts" className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="p-2 bg-brand/10 rounded-lg text-brand"><MessageSquare size={20} /></div><h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Prompts</h3></div><div className="relative group max-w-sm w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand transition-colors" size={16} /><input type="text" placeholder="Search snippets..." value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} className="w-full bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand/30 transition-all placeholder:text-zinc-400 dark:text-zinc-600" /></div></div>
                {filteredPrompts.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{filteredPrompts.map(p => (<motion.div layout key={p.id}><PromptCard id={p.id} title={p.title} content={p.content} brandColor={brandColor} isDragging={draggedPromptId === p.id} onDragStart={handlePromptDragStart} onDragOver={handlePromptDragOver} onDrop={handlePromptDrop} onEditContent={handlePromptContentEdit} /></motion.div>))}<motion.div layout><button onClick={() => setActiveTab('data')} className="h-full w-full bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-5 transition-all hover:border-brand/30 hover:bg-brand/5 flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-brand cursor-pointer min-h-[160px]"><div className="p-3 bg-black/5 dark:bg-white/5 rounded-full group-hover:bg-brand/20 transition-colors"><Plus size={24} /></div><span className="text-sm font-bold tracking-tight">Add Prompt</span></button></motion.div></div>) : (<div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-10 md:p-16 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center"><MessageSquare size={32} className="text-zinc-300 dark:text-zinc-800 mb-4" /><p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">{promptSearch ? "No snippets matching your search." : "Your prompt vault is empty."}</p><button onClick={() => setActiveTab('data')} className="mt-6 px-6 py-2 bg-brand text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"><Plus size={16} /> Add Prompt</button></div>)}
              </div>

              <div id="documents" className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><File size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Documents</h3>
                  </div>
                </div>
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {files.map(f => (
                      <a key={f.id} href={f.data} download={f.name} className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-lg hover:border-cyan-500/30 transition-all group flex items-center gap-4 cursor-pointer">
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                          {f.type.includes('pdf') ? <FileText size={24} className="text-rose-500"/> : <ImageIcon size={24} className="text-cyan-500"/>}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</h4>
                          <p className="text-xs text-zinc-500">{(f.size / 1024).toFixed(1)} KB • {formatDateToDDMMYYYY(f.uploadedAt)}</p>
                        </div>
                      </a>
                    ))}
                    <button onClick={() => setActiveTab('data')} className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-5 border border-dashed border-black/10 dark:border-white/10 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 group flex items-center justify-center gap-4 cursor-pointer min-h-[90px]">
                      <div className="flex items-center gap-3 text-zinc-500 group-hover:text-cyan-500 transition-colors">
                        <Plus size={20} />
                        <span className="text-sm font-bold tracking-tight">Add Document</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl p-10 md:p-16 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center">
                    <File size={32} className="text-zinc-300 dark:text-zinc-800 mb-4" />
                    <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">No documents uploaded yet.</p>
                    <button onClick={() => setActiveTab('data')} className="mt-6 px-6 py-2 bg-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                      <Plus size={16} /> Add Document
                    </button>
                  </div>
                )}
              </div>

              <div className="pb-10">

              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 items-start">
                <Sheet title="Transactions" coll="transactions" data={transactions} onEdit={handleTxnChange} onDelete={(id: string) => deleteCloudDoc('transactions', id)} keys={['date','deposit','withdrawal']} onPaste={(e: any) => handlePaste(e,'transactions',['date','deposit','withdrawal'])} brandColor={brandColor} correctPin={CORRECT_PIN} />
                <Sheet title="Portfolio Value" coll="history" data={portfolioHistory} onEdit={handleMvChange} onDelete={(id: string) => deleteCloudDoc('history', id)} keys={['date','marketValue']} onPaste={(e: any) => handlePaste(e,'history',['date','marketValue'])} brandColor={brandColor} correctPin={CORRECT_PIN} />
                <Sheet title="Benchmark Sim" coll="benchmark" data={benchmarkHistory} onEdit={handleBmChange} onDelete={(id: string) => deleteCloudDoc('benchmark', id)} keys={['date','price']} onPaste={(e: any) => handlePaste(e,'benchmark',['date','price'])} brandColor={brandColor} correctPin={CORRECT_PIN} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sheet({ title, data, onEdit, onDelete, keys, onPaste, brandColor, correctPin }: any) {
  const [isLocked, setIsLocked] = useState(true);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      setIsLocked(false);
      setShowPinInput(false);
      setPin('');
      setError(false);
      setShowDropdown(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setShowDropdown(false);
  };

  const savedItems = data.filter((row: any) => !!row.id && (row.date || row.title || row.content));
  const activeItems = data.filter((row: any) => !(!!row.id && (row.date || row.title || row.content)));

  return (
    <div className="bg-surface-light dark:bg-[#0d0d0d] rounded-2xl border border-black/5 dark:border-white/5 flex flex-col shadow-2xl relative transition-all duration-300">
      <div className="p-3 md:p-4 border-b border-black/5 dark:border-white/5 bg-muted-light/20 flex justify-between items-center uppercase text-[9px] md:text-[10px] font-black tracking-[0.2em] text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          {title}
          {isLocked && <Lock size={12} className="text-zinc-500/50" />}
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isLocked ? 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-500' : 'bg-brand/10 border-brand/20 text-brand'}`}
          >
            <span className="text-[8px] font-bold tracking-widest">{isLocked ? 'READ-ONLY' : 'EDIT MODE'}</span>
            <ChevronDown size={10} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 space-y-1">
                <button 
                  onClick={handleLock}
                  disabled={isLocked}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest flex items-center justify-between transition-colors ${isLocked ? 'text-brand bg-brand/5' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  LOCK RECORDS {isLocked && <Check size={12} />}
                </button>
                <button 
                  onClick={() => { if(isLocked) setShowPinInput(true); setShowDropdown(false); }}
                  disabled={!isLocked}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold tracking-widest flex items-center justify-between transition-colors ${!isLocked ? 'text-brand bg-brand/5' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  UNLOCK TO MODIFY {!isLocked && <ShieldCheck size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPinInput && (
        <div className="absolute inset-0 z-30 bg-surface-light/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form onSubmit={handleUnlock} className={`bg-surface-light dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/5 w-full max-w-xs flex flex-col items-center transition-all ${error ? 'animate-shake border-rose-500/50' : 'shadow-2xl'}`}>
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-4 border border-brand/20">
              <Lock className="text-brand" size={20} />
            </div>
            <h4 className="text-sm font-bold mb-1 tracking-tight">Sheet Locked</h4>
            <p className="text-[10px] text-zinc-500 mb-6 text-center">Verify PIN to enable modifications.</p>
            <input 
              type="password" 
              maxLength={4}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g,''))}
              placeholder="••••"
              className={`w-full bg-surface-light dark:bg-black border ${error ? 'border-rose-500' : 'border-black/10 dark:border-white/10'} text-center text-2xl py-4 rounded-xl focus:outline-none focus:border-brand tracking-[0.5em] transition-all font-mono mb-4`}
            />
            <div className="flex gap-2 w-full">
              <button type="button" onClick={() => setShowPinInput(false)} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-center">Cancel</button>
              <button type="submit" className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-brand text-white dark:text-black rounded-lg transition-all hover:opacity-90">Verify</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-auto max-h-[400px] md:max-h-[500px] bg-muted-light dark:bg-black/40 scrollbar-thin scrollbar-thumb-white/10 relative shadow-inner">
        <table className="w-full text-[11px] md:text-xs text-left border-collapse table-fixed min-w-[450px] md:min-w-[500px]">
          <thead className="sticky top-0 bg-surface-light dark:bg-[#0d0d0d] z-20 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_2px_rgba(255,255,255,0.05)] border-b border-black/5 dark:border-white/5">
            <tr className="divide-x divide-black/5 dark:divide-white/5 uppercase text-[8px] md:text-[9px] font-black tracking-widest text-zinc-400">
              <th className="p-3 md:p-4 w-10 md:w-12 text-center">#</th>
              {keys.map((k: string) => {
                let colorClass = "";
                if (k === 'deposit') colorClass = "text-emerald-500 bg-emerald-500/5";
                else if (k === 'withdrawal') colorClass = "text-rose-500 bg-rose-500/5";
                else if (k === 'marketValue' || k === 'price') colorClass = "text-brand bg-brand/5";
                
                return <th key={k} className={`p-3 md:p-4 ${colorClass}`}>{k}</th>;
              })}
              <th className="p-3 md:p-4 w-12 md:w-14"></th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((row: any, i: number) => (
              <tr key={row.id} className="border-b border-black/5 dark:border-white/5 group transition-colors hover:bg-brand/[0.02] h-[48px] md:h-[56px]">
                <td className="p-3 md:p-4 text-zinc-400 dark:text-zinc-600 font-mono text-[9px] md:text-[10px] w-10 md:w-12 text-center">{i+1}</td>
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
                          type="text"
                          value={formatDateToDDMMYYYY(row[k])} 
                          placeholder="DD-MM-YYYY"
                          onPaste={onPaste} 
                          onChange={e => onEdit(row.id, k, parseDDMMYYYYtoISO(e.target.value))} 
                          className={`w-full p-3 md:p-4 bg-transparent outline-none ${focusColor} ${textColor} transition-colors font-mono text-[10px] md:text-[11px] h-12 md:h-14 placeholder:text-zinc-600 dark:placeholder:text-zinc-600`} 
                        />
                      ) : k === 'content' ? (
                        <textarea 
                          value={row[k] || ''} 
                          onChange={e => onEdit(row.id, k, e.target.value)} 
                          onPaste={onPaste} 
                          placeholder="..." 
                          className="w-full p-3 md:p-4 bg-transparent outline-none focus:bg-brand/[0.05] text-slate-900 dark:text-white transition-colors resize-none h-[48px] md:h-[56px] font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600 dark:placeholder:text-zinc-600" 
                          rows={1} 
                        />
                      ) : (
                        <input 
                          type={k === 'title' ? 'text' : 'number'} 
                          value={row[k] === undefined ? '' : row[k]} 
                          onPaste={onPaste} 
                          onChange={e => onEdit(row.id, k, e.target.value)} 
                          placeholder="0.00" 
                          className={`w-full p-3 md:p-4 bg-transparent outline-none ${focusColor} ${textColor} transition-colors font-mono text-[10px] md:text-[11px] h-12 md:h-14 placeholder:text-zinc-600 dark:placeholder:text-zinc-600`} 
                        />
                      )}
                    </td>
                  );
                })}
                <td className="p-0 text-center border-l border-black/5 dark:border-white/5 w-12 md:w-14">
                  <button 
                    onClick={() => { if (window.confirm("Are you sure you want to delete this row?")) onDelete(row.id); }} 
                    className="w-full h-full p-3 md:p-4 text-zinc-700 dark:text-zinc-600 hover:text-rose-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center"
                    title="Delete row"
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {savedItems.length > 0 && (
          <div className="mt-2 border-t border-black/5 dark:border-white/5">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
              className={`w-full p-4 flex items-center justify-between group transition-all ${isHistoryOpen ? 'bg-black/5 dark:bg-white/[0.03]' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.02]'}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-brand/10 text-brand">
                  <Database size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Historical Records ({savedItems.length})</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="overflow-hidden bg-black/[0.02] dark:bg-white/[0.01]"
                >
                  <table className="w-full text-left border-collapse table-fixed min-w-[450px] md:min-w-[500px]">
                    <tbody>
                      {savedItems.map((row: any, i: number) => {
                        const isReadOnly = isLocked;
                        return (
                          <tr key={row.id} className={`border-b border-black/5 dark:border-white/5 group transition-colors ${isReadOnly ? 'opacity-80' : 'hover:bg-brand/[0.02]'} h-[48px] md:h-[56px]`}>
                            <td className="p-3 md:p-4 text-zinc-400 dark:text-zinc-600 font-mono text-[9px] md:text-[10px] w-10 md:w-12 text-center">{i+1}</td>
                            {keys.map((k: string) => {
                              let textColor = "text-slate-700 dark:text-zinc-400";
                              if (k === 'deposit') textColor = "text-emerald-600 dark:text-emerald-400";
                              else if (k === 'withdrawal') textColor = "text-rose-600 dark:text-rose-400";
                              else if (k === 'marketValue' || k === 'price') textColor = "text-brand";

                              return (
                                <td key={k} className="p-3 md:p-4 border-l border-black/5 dark:border-white/5">
                                  {isReadOnly ? (
                                    <div className={`${textColor} font-mono text-[10px] md:text-[11px] select-none italic truncate max-w-[200px]`}>
                                      {k === 'date' ? formatDateToDDMMYYYY(row[k]) : (row[k] || '—')}
                                    </div>
                                  ) : (
                                    k === 'date' ? (
                                      <input 
                                        type="text" 
                                        value={formatDateToDDMMYYYY(row[k])} 
                                        onChange={e => onEdit(row.id, k, parseDDMMYYYYtoISO(e.target.value))} 
                                        placeholder="DD-MM-YYYY"
                                        className={`w-full bg-transparent outline-none focus:bg-brand/[0.05] ${textColor} transition-colors font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600`} 
                                      />
                                    ) : k === 'content' ? (
                                      <textarea 
                                        value={row[k] || ''} 
                                        onChange={e => onEdit(row.id, k, e.target.value)} 
                                        className="w-full bg-transparent outline-none focus:bg-brand/[0.05] text-slate-900 dark:text-white transition-colors resize-none font-mono text-[10px] md:text-[11px] placeholder:text-zinc-600" 
                                        rows={1} 
                                      />
                                    ) : (
                                      <input 
                                        type={k === 'title' ? 'text' : 'number'} 
                                        value={row[k] === undefined ? '' : row[k]} 
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
                                  onClick={() => { if (window.confirm("Are you sure you want to delete this historical record?")) onDelete(row.id); }} 
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
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
