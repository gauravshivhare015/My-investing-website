import React, { useState, useEffect, useMemo } from 'react';
import { Download, ExternalLink, Calendar, Search, AlertCircle, FileText, Bell, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FilingsDashboard({ brandColor, holdings = [], watchlist = [] }: { brandColor: string, holdings?: any[], watchlist?: any[] }) {
  const [filings, setFilings] = useState<any[]>([]);
  const [filteredFilings, setFilteredFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState('1M');

  const fetchFilings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bse/filings");
      
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error("Invalid response format from server");
      }

      if (data.status === "success" && data.data) {
        const filingsData = Array.isArray(data.data) ? data.data : [];
        const mappedFilings = filingsData.map((item: any) => ({
          symbol: item.symbol || '', 
          company: item.sm_name || 'Unknown',
          purpose: item.desc || 'Announcement',
          date: item.an_dt || '',
          bm_desc: item.attchmntText || '',
          pdfLink: item.attchmntFile || null,
        }));
        
        setFilings(mappedFilings);
        if (data.error) {
          setError(data.error);
        }
      } else {
        setError(data.error || 'Failed to fetch filings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, [periodFilter]); // Refetch when periodFilter changes

  const investedSymbols = useMemo(() => {
    const fromHoldings = holdings.map(h => {
      let sym = h.name || '';
      sym = sym.replace('.NS', '').replace('.BO', '');
      return sym.toUpperCase().trim();
    });
    const fromWatchlist = watchlist.map(w => {
      let sym = w.symbol || '';
      sym = sym.replace('.NS', '').replace('.BO', '');
      return sym.toUpperCase().trim();
    });
    return [...fromHoldings, ...fromWatchlist].filter(Boolean);
  }, [holdings, watchlist]);

  useEffect(() => {
    let result = filings;
    
    // Always filter by Invested Tickers Only
    result = result.filter(f => {
      const fileSym = (f.symbol || '').toUpperCase().trim();
      return investedSymbols.includes(fileSym);
    });

    // Lightning-fast client-side filtering by multiple fields
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        (f.company && f.company.toLowerCase().includes(q)) ||
        (f.symbol && f.symbol.toLowerCase().includes(q)) ||
        (f.bm_desc && f.bm_desc.toLowerCase().includes(q)) ||
        (f.purpose && f.purpose.toLowerCase().includes(q))
      );
    }
    
    if (categoryFilter !== 'All') {
      result = result.filter(f => f.purpose === categoryFilter);
    }
    
    setFilteredFilings(result);
  }, [filings, categoryFilter, searchQuery, investedSymbols]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(filings.map(f => f.purpose))).filter(Boolean)];
  }, [filings]);

  const highImpactCount = useMemo(() => {
    return filings.filter(f => 
      f.purpose?.toLowerCase().includes('result') || 
      f.purpose?.toLowerCase().includes('dividend') ||
      f.bm_desc?.toLowerCase().includes('financial results') ||
      f.bm_desc?.toLowerCase().includes('dividend')
    ).length;
  }, [filings]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (e) {}
    return dateStr;
  };

  const getCategoryColor = (purpose: string) => {
    const p = (purpose || '').toLowerCase();
    if (p.includes('result') || p.includes('financial')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (p.includes('dividend') || p.includes('bonus') || p.includes('split') || p.includes('dividend/interest')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (p.includes('meeting') || p.includes('agm') || p.includes('egm') || p.includes('board meeting')) {
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
    }
    if (p.includes('acquisition') || p.includes('allotment') || p.includes('issue')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar size={24} style={{ color: brandColor }} />
            Corporate Announcements
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Real-time corporate actions, board meetings, and financial results for your holdings & watchlist
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer text-slate-800 dark:text-zinc-200"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search company or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-64 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 transition-all shadow-sm text-slate-900 dark:text-white"
              style={{ '--tw-ring-color': brandColor } as any}
            />
            {searchQuery && (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               >
                 <span className="text-xs font-bold font-mono">✕</span>
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px] max-h-[600px]">
        {/* Top Summary Bar */}
        <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Bell size={12} style={{ color: brandColor }} />
            {filteredFilings.length === 0 
              ? 'No announcements match' 
              : `Showing ${filteredFilings.length} announcements for your portfolio`}
          </span>
          {highImpactCount > 0 && (
            <span className="text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
              {highImpactCount} High Impact Events
            </span>
          )}
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${brandColor} transparent ${brandColor} transparent` }} />
              <p className="text-sm font-semibold text-slate-400 dark:text-zinc-600 animate-pulse">Loading corporate actions...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Unable to Load Announcements</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mt-1">{error}</p>
              <button 
                onClick={fetchFilings} 
                className="mt-4 px-4 py-1.5 rounded-xl text-xs font-bold transition-all text-white hover:opacity-95"
                style={{ backgroundColor: brandColor }}
              >
                Retry Fetching
              </button>
            </div>
          ) : filteredFilings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Corporate Actions Found</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mt-1">
                {investedSymbols.length === 0 
                  ? "Add stocks to your Holdings or Watchlist to see their real-time filings here."
                  : searchQuery || categoryFilter !== 'All' 
                    ? "Try resetting your search query or choosing another category filter."
                    : "There are no recent corporate announcements for your added stocks."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredFilings.map((filing, index) => (
                  <motion.div
                    key={`${filing.symbol}-${filing.date}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                    className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Left: Ticker & Date */}
                      <div className="flex flex-col items-start gap-1 shrink-0">
                        <span 
                          className="text-xs font-black px-2.5 py-1 rounded-lg tracking-wider"
                          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                        >
                          {filing.symbol}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-zinc-500 ml-1">
                          {formatDate(filing.date)}
                        </span>
                      </div>

                      {/* Middle: Company & Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {filing.company}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(filing.purpose)}`}>
                            {filing.purpose}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                          {filing.bm_desc || "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {filing.pdfLink && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={filing.pdfLink}
                        target="_blank"
                        rel="noreferrer"
                        className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:border-brand/30 hover:bg-brand/5 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                        <ExternalLink size={10} className="text-slate-400" />
                      </motion.a>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
