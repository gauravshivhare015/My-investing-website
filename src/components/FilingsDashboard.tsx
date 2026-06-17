import React, { useState, useEffect, useMemo } from 'react';
import { Download, ExternalLink, Calendar, Search, AlertCircle, FileText, Bell, Filter } from 'lucide-react';
import { format, parse } from 'date-fns';

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

  const categories = ['All', ...Array.from(new Set(filings.map(f => f.purpose))).filter(Boolean)];

  const highImpactCount = filings.filter(f => 
    f.purpose?.toLowerCase().includes('result') || 
    f.purpose?.toLowerCase().includes('dividend') ||
    f.bm_desc?.toLowerCase().includes('financial results') ||
    f.bm_desc?.toLowerCase().includes('dividend')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 
            className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 cursor-pointer hover:underline hover:text-brand transition-colors"
            onClick={() => window.open('https://aistudio.google.com/apps/a1706b14-3507-47c1-9c7e-80e788253ee6?showPreview=true&showAssistant=true&project=gen-lang-client-0213064099&fullscreenApplet=true', '_blank')}
          >
            <Calendar size={24} style={{ color: brandColor }} />
            Corporate Announcements
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Latest announcements from the NSE Corporate Filings
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search company or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-64 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 transition-all shadow-sm"
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
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] md:h-[800px]">
        <iframe 
          src="https://aistudio.google.com/apps/a1706b14-3507-47c1-9c7e-80e788253ee6?showPreview=true&showAssistant=true&project=gen-lang-client-0213064099&fullscreenApplet=true" 
          className="w-full h-full border-0"
          title="Embedded AI Studio App"
          allow="cross-origin-isolated"
        />
      </div>
    </div>
  );
}
