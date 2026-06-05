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
      const response = await fetch(`/api/nse/calendar${periodFilter === '1M' ? '?period=1M' : ''}`);
      const data = await response.json();
      if (data.status === 'success') {
        setFilings(data.data);
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
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
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setPeriodFilter('1M')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                periodFilter === '1M'
                  ? 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Last 1 Month
            </button>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 outline-none focus:ring-1"
            style={{ '--tw-ring-color': brandColor } as any}
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat as string}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 text-center text-rose-500 font-medium">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              {error}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-zinc-500 animate-pulse font-bold tracking-widest uppercase text-sm">
              Fetching Data...
            </div>
          ) : filteredFilings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-zinc-500">
              No recent filings found for the selected criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  <th className="p-4 font-bold">Symbol</th>
                  <th className="p-4 font-bold">Company</th>
                  <th className="p-4 font-bold">Purpose</th>
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredFilings.map((filing, index) => {
                  let dateStr = filing.date || '';

                  return (
                    <tr key={index} className="border-b border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-bold text-brand whitespace-nowrap text-xs">
                        {filing.symbol}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {filing.company || filing.symbol}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {filing.purpose || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 relative group max-w-md">
                        <div className="line-clamp-2 md:line-clamp-none">{filing.bm_desc}</div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="p-4 text-right">
                        {filing.pdfLink && (
                          <a 
                            href={filing.pdfLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                          >
                            <ExternalLink size={14} />
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
