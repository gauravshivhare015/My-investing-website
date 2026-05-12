import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  isDarkMode?: boolean;
}

export const ToastContainer = ({ toasts, removeToast, isDarkMode }: ToastProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[90%] max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} isDarkMode={isDarkMode} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onClose, isDarkMode }: { toast: ToastMessage, onClose: () => void, isDarkMode?: boolean }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    info: { icon: Info, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
  };

  const { icon: Icon, color, bg, border } = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border ${border} ${bg} backdrop-blur-xl shadow-2xl relative overflow-hidden group`}
    >
      <div className={`shrink-0 p-2 rounded-xl bg-white/10 ${color}`}>
        <Icon size={20} />
      </div>
      
      <div className="flex-1 space-y-1 pr-6">
        <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {toast.message}
          </p>
        )}
      </div>

      <button 
        onClick={onClose}
        className={`absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-40 hover:opacity-100 ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] ${color} bg-current opacity-30`}
      />
    </motion.div>
  );
};
