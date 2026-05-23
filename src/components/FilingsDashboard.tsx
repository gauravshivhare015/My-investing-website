import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Calendar, Search, AlertCircle, FileText, Bell } from 'lucide-react';
import { format, parse } from 'date-fns';

export function FilingsDashboard({ brandColor }: { brandColor: string }) {
  const [filings, setFilings] = useState<any[]>([]);
  const [filteredFilings, setFilteredFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const fetchFilings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch latest general filings. Hardcoded scripCode empty to prevent BSE API 404 errors on names.
      const response = await fetch(`/api/bse/filings?scripCode=&days=30`);
      const data = await response.json();
      if (data.status === 'success') {
        setFilings(data.data);
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
  }, []); // Initial load

  useEffect(() => {
    let result = filings;
    
    // Lightning-fast client-side filtering by multiple fields
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        (f.SLONGNAME && f.SLONGNAME.toLowerCase().includes(q)) ||
        (f.SCRIP_CD && f.SCRIP_CD.toString().includes(q)) ||
        (f.NEWSSUB && f.NEWSSUB.toLowerCase().includes(q))
      );
    }
    
    if (categoryFilter !== 'All') {
      result = result.filter(f => f.CATEGORYNAME === categoryFilter);
    }
    
    setFilteredFilings(result);
  }, [filings, categoryFilter, searchQuery]);

  const categories = ['All', ...Array.from(new Set(filings.map(f => f.CATEGORYNAME))).filter(Boolean)];

  const highImpactCount = filings.filter(f => 
    f.CATEGORYNAME?.toLowerCase().includes('result') || 
    f.CATEGORYNAME?.toLowerCase().includes('board meeting') ||
    f.NEWSSUB?.toLowerCase().includes('financial results') ||
    f.NEWSSUB?.toLowerCase().includes('dividend')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell size={24} style={{ color: brandColor }} />
            Corporate Filings
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Latest 30 days announcements from BSE
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
          <button 
            onClick={fetchFilings}
            disabled={loading}
            className="px-4 py-2 text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Filings</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{filings.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
            <FileText size={24} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1">High Impact</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{highImpactCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Announcements</h3>
          
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
              Fetching BSE Data...
            </div>
          ) : filteredFilings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-zinc-500">
              No recent filings found for the selected criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  <th className="p-4 font-bold">Company</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Headline</th>
                  <th className="p-4 font-bold text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredFilings.map((filing, index) => {
                  let dateStr = filing.NEWS_DT;
                  if (dateStr && dateStr.includes('T')) {
                     try {
                       dateStr = format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
                     } catch(e) {}
                  }

                  const attachUrl = filing.ATTACHMENTNAME 
                    ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${filing.ATTACHMENTNAME}`
                    : null;

                  return (
                    <tr key={index} className="border-b border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {filing.SLONGNAME || filing.SCRIP_CD}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {filing.CATEGORYNAME || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 relative group max-w-md">
                        <div className="line-clamp-2 md:line-clamp-none">{filing.NEWSSUB}</div>
                      </td>
                      <td className="p-4 text-right">
                        {attachUrl ? (
                          <a 
                            href={attachUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="View PDF"
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-600 text-xs">-</span>
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
