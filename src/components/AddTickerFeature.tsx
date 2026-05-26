import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, AlertCircle } from 'lucide-react';
import { useToasts } from '../context/ToastContext';

export function AddTickerFeature({ 
  user,
  holdings, 
  onSaveHolding 
}: { 
  user: any;
  holdings: any[];
  onSaveHolding: (holding: any) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<any>(null);
  const [units, setUnits] = useState('1');
  const [avgPrice, setAvgPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToasts();
  const searchTimeout = useRef<any>(null);

  const [localTickers, setLocalTickers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch from Google Sheet exclusively for company/ticker search and market prices
    fetch('/api/sheets?id=1lWJXcBqHQia0qrD-FHb7oFM2kAQ_37P3tvPFFBiJ37o')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(csvText => {
        const lines = csvText.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim().toUpperCase());
          const symbolIdx = headers.indexOf('SYMBOL') > -1 ? headers.indexOf('SYMBOL') : 0;
          const nameIdx = headers.indexOf('NAME') > -1 ? headers.indexOf('NAME') : 1;
          const ltpIdx = headers.indexOf('LTP') > -1 ? headers.indexOf('LTP') : headers.length - 1;

          const parsed = lines.slice(1).map(line => {
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
            const symbol = cols[symbolIdx] || '';
            const name = cols[nameIdx] || '';
            const ltpStr = (cols[ltpIdx] || '').replace(/[^\d.-]/g, '');
            return {
              symbol: symbol,
              shortname: name,
              longname: name,
              ltp: parseFloat(ltpStr) || 0,
              exchDisp: 'NSE'
            };
          }).filter(t => t.symbol);
          setLocalTickers(parsed);
        }
      })
      .catch(err => {
        console.error('Failed to load tickers from Google Sheets', err);
        addToast("Sync Error", "Could not fetch ticker list from Sheets. You can still enter tickers manually.", "warning");
      });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchTicker = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    
    const qUpper = q.toUpperCase();
    const exactLocalMatches = localTickers.filter(t => 
      t.symbol.toUpperCase().startsWith(qUpper) || 
      t.shortname?.toUpperCase().includes(qUpper)
    ).slice(0, 8);

    setResults(exactLocalMatches);
    setIsLoading(false);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setIsOpen(true);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      searchTicker(q);
    }, 300);
  };

  const getLivePrice = async (symbol: string) => {
    const ticker = localTickers.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    return ticker ? ticker.ltp : 0;
  };

  const handleSelectTicker = async (ticker: any) => {
    // Deduplication check
    const existing = holdings.find((h: any) => h.name.toUpperCase() === ticker.symbol.toUpperCase());
    if (existing) {
      addToast(`${ticker.symbol} already exists in your portfolio`, "warning");
      return;
    }
    
    setSelectedTicker(ticker);
    setUnits('1');
    setAvgPrice('');
    
    try {
      const ltp = await getLivePrice(ticker.symbol);
      if (ltp > 0) setAvgPrice(ltp.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const confirmAdd = async () => {
    if (!selectedTicker) return;
    setIsLoading(true);
    
    try {
      const ltp = await getLivePrice(selectedTicker.symbol);
      const userAvg = parseFloat(avgPrice) || ltp;
      const userQty = parseFloat(units) || 1;
      
      const newHolding = {
        name: selectedTicker.symbol,
        type: 'EQUITY',
        qty: userQty,
        avg: userAvg,
        ltp: ltp,
        cur: ltp,
        overallGlAbs: 0,
        dayGlAbs: 0
      };
      
      await onSaveHolding(newHolding);
      addToast(`Added ${selectedTicker.symbol}`, "success");
      setQuery('');
      setResults([]);
      setSelectedTicker(null);
      setIsOpen(false);
    } catch (err: any) {
      addToast("Failed to add ticker", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={14} className="text-slate-400 dark:text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsOpen(true)}
          placeholder="SEARCH TICKERS..."
          className="w-full bg-zinc-900/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-11 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-brand focus:dark:border-brand transition-all backdrop-blur-sm shadow-inner"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 size={14} className="text-brand animate-spin" />
          </div>
        )}
        {query && !isLoading && (
          <button 
            onClick={() => { setQuery(''); setResults([]); setSelectedTicker(null); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (query.trim() !== '' || selectedTicker) && (
        <div className="absolute mt-2 md:mt-3 w-full bg-white dark:bg-[#111111] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden text-slate-800 dark:text-white/90">
          {selectedTicker ? (
             <div className="p-4 md:p-5 flex flex-col gap-4">
               <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                 <div>
                   <div className="font-bold text-brand text-sm">{selectedTicker.symbol}</div>
                   <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-bold truncate max-w-[200px] mt-1">{selectedTicker.longname || selectedTicker.shortname}</div>
                 </div>
                 <button onClick={() => setSelectedTicker(null)} className="text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 p-1.5 rounded-full"><X size={14} /></button>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                   <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500 block">Units</label>
                   <input type="number" value={units} onChange={e => setUnits(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono font-bold" min="1" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500 block">Avg Price</label>
                   <input type="number" step="0.01" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} placeholder="Live Price" className="w-full bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono font-bold" />
                 </div>
               </div>

               <button 
                 onClick={confirmAdd}
                 disabled={isLoading}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
               >
                 {isLoading && <Loader2 size={14} className="animate-spin" />}
                 Confirm Add
               </button>
             </div>
          ) : isLoading && results.length === 0 ? (
             <div className="p-6 flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-4 items-center animate-pulse">
                   <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl" />
                   <div className="flex-1 space-y-3">
                     <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-1/3" />
                     <div className="h-3 bg-black/5 dark:bg-white/5 rounded-full w-2/3" />
                   </div>
                 </div>
               ))}
             </div>
          ) : results.length > 0 ? (
             <div className="max-h-[300px] overflow-y-auto">
               {results.map((res: any, idx: number) => (
                 <div 
                   key={idx}
                   className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 hover:bg-brand/5 group transition-colors"
                 >
                   <div>
                     <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand">{res.symbol}</div>
                     <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-bold truncate max-w-[200px] mt-1">{res.longname || res.shortname} • {res.exchDisp}</div>
                   </div>
                   <button 
                     onClick={() => handleSelectTicker(res)}
                     className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group-hover:scale-110"
                   >
                     <Plus size={16} className="stroke-[3px]" />
                   </button>
                 </div>
               ))}
             </div>
          ) : !isLoading && (
             <div className="p-8 text-center text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex flex-col items-center gap-3">
               <AlertCircle size={24} className="text-brand/50" />
               No matching tickers found.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
