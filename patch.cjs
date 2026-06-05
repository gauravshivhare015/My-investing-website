const fs = require('fs');
let code = fs.readFileSync('src/components/AddTickerFeature.tsx', 'utf8');

code = code.replace(
  '{results.map((res: any, idx: number) => (',
  `{results.map((res: any, idx: number) => {
                  const isInWatchlist = watchlist.some(w => (w.symbol || '').toUpperCase() === res.symbol.toUpperCase());
                  return (`
);

code = code.replace(
  `<button 
                      onClick={() => handleSelectTicker(res)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group-hover:scale-110"
                    >
                      <Plus size={16} className="stroke-[3px]" />
                    </button>`,
  `<div className="flex gap-2 items-center">
                        <button 
                          onClick={(e) => toggleWatchlist(res, e)}
                          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                          className={\`p-2.5 rounded-xl shadow-lg transition-all active:scale-95 group-hover:scale-110 \${isInWatchlist ? 'bg-brand/20 text-brand shadow-brand/10' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400 hover:bg-brand/10 hover:text-brand shadow-black/5 dark:shadow-white/5'}\`}
                        >
                          {isInWatchlist ? <Eye size={16} className="stroke-[2px]" /> : <EyeOff size={16} className="stroke-[2px]" />}
                        </button>
                        <button 
                          onClick={() => handleSelectTicker(res)}
                          title="Add to Portfolio"
                          className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group-hover:scale-110"
                        >
                          <Plus size={16} className="stroke-[3px]" />
                        </button>
                      </div>`
);

code = code.replace(
  `</div>
                ))}
              </div>`,
  `</div>
                  );
                })}
              </div>`
)

fs.writeFileSync('src/components/AddTickerFeature.tsx', code);
