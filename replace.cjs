const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-\[\#050505\]/g, 'bg-slate-50 dark:bg-[#050505]');
content = content.replace(/bg-\[\#0d0d0d\]/g, 'bg-white dark:bg-[#0d0d0d]');
content = content.replace(/text-slate-50/g, 'text-slate-900 dark:text-slate-50');
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/border-white\/5/g, 'border-black/5 dark:border-white/5');
content = content.replace(/border-white\/10/g, 'border-black/10 dark:border-white/10');
content = content.replace(/bg-\[\#111\]/g, 'bg-gray-50 dark:bg-[#111]');
content = content.replace(/bg-black(?!\/)/g, 'bg-white dark:bg-black');
content = content.replace(/text-zinc-300/g, 'text-zinc-700 dark:text-zinc-300');
content = content.replace(/text-zinc-400/g, 'text-zinc-600 dark:text-zinc-400');
content = content.replace(/bg-white\/5/g, 'bg-black/5 dark:bg-white/5');
content = content.replace(/bg-zinc-900\/80/g, 'bg-white/80 dark:bg-zinc-900/80');
content = content.replace(/bg-black\/40/g, 'bg-gray-100 dark:bg-black/40');
content = content.replace(/text-zinc-800/g, 'text-zinc-300 dark:text-zinc-800');
content = content.replace(/text-zinc-600/g, 'text-zinc-400 dark:text-zinc-600');
content = content.replace(/bg-white(?!\/)(?! dark:)/g, 'bg-black dark:bg-white');
content = content.replace(/text-black(?!\/)(?! dark:)/g, 'text-white dark:text-black');

fs.writeFileSync('src/App.tsx', content);
console.log("Replacements done");
