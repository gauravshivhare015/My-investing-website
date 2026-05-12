import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
  isDarkMode?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isDarkMode = this.props.isDarkMode;
      let detailedMsg = this.state.error?.message || 'An unexpected error occurred';
      let isFirestoreError = false;
      let firestoreData = null;

      try {
        if (detailedMsg.startsWith('{') && detailedMsg.endsWith('}')) {
          firestoreData = JSON.parse(detailedMsg);
          isFirestoreError = true;
          detailedMsg = firestoreData.error || detailedMsg;
        }
      } catch (e) {
        // Not a JSON error
      }

      const containerClasses = isDarkMode 
        ? 'bg-[#050505] text-white' 
        : 'bg-[#fdfcfb] text-slate-900';
      
      const cardClasses = isDarkMode 
        ? 'bg-zinc-900/50 border-white/10' 
        : 'bg-white border-black/5';

      return (
        <div className={`min-h-screen flex items-center justify-center p-6 ${containerClasses}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`max-w-xl w-full p-8 md:p-12 rounded-[2.5rem] border ${cardClasses} shadow-2xl relative overflow-hidden`}
          >
            {/* Decorative background */}
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none blur-3xl rounded-full ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`} />
            
            <div className="relative z-10 space-y-8 text-center text-pretty">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 mb-2 border border-red-500/20 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
                  {isFirestoreError ? 'Database Access Denied' : 'System Disrupted'}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} font-medium leading-relaxed`}>
                  {isFirestoreError 
                    ? 'Our security protocols blocked this operation. This usually happens when permissions are missing or sessions expire.' 
                    : 'The application encountered a critical runtime error.'}
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-black/5 border-black/5'} border text-left font-mono text-[11px] leading-relaxed break-words overflow-auto max-h-[200px] scrollbar-thin`}>
                <div className="flex items-center gap-2 mb-3 text-red-400 font-bold uppercase tracking-widest text-[9px]">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   Error Payload
                </div>
                <div className={isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                  {detailedMsg}
                </div>
                {isFirestoreError && firestoreData && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2 opacity-60">
                    <div className="grid grid-cols-2 gap-2">
                       <div><span className="text-[9px] font-black uppercase text-zinc-500">Operation:</span> {firestoreData.operationType}</div>
                       <div><span className="text-[9px] font-black uppercase text-zinc-500">Path:</span> {firestoreData.path}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/20 active:scale-95"
                >
                  <RefreshCcw size={16} />
                  Restore
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className={`flex-1 px-8 py-4 ${isDarkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'} rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95`}
                >
                  <Home size={16} />
                  Home
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
