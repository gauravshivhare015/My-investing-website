import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, Loader2, Bot, User } from 'lucide-react';
import { useToasts } from '../context/ToastContext';

export function GeminiChatbot({ 
  brandColor, 
  user,
  holdings, 
  onOverwriteHoldings 
}: { 
  brandColor: string;
  user: any;
  holdings: any[];
  onOverwriteHoldings: (newHoldings: any[]) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', text: 'Hello! I am your AI assistant. I can explain the app features, financial calculations, or extract data from a portfolio screenshot to update your Equity Dashboard. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToasts();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: any = { role: 'user', text: input };
    if (selectedImage) {
      userMessage.image = selectedImage;
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Build history payload for the backend
      const historyPayload = newMessages.map(msg => {
        const parts = [];
        if (msg.text) parts.push({ text: msg.text });
        if (msg.image) {
          const mimeType = msg.image.split(';')[0].split(':')[1];
          const data = msg.image.split(',')[1];
          parts.push({ inlineData: { mimeType, data } });
        }
        return { role: msg.role === 'model' ? 'model' : 'user', parts };
      });

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyPayload })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Handle function call if any
      if (data.functionCall) {
        if (data.functionCall.name === 'overwriteEquityDashboard') {
          addToast("Overwriting Equity Dashboard...", "info");
          try {
            await onOverwriteHoldings(data.functionCall.args.holdings);
            addToast("Dashboard updated successfully!", "success");
            setMessages(prev => [...prev, { role: 'model', text: "I have successfully extracted the data and updated your Equity Dashboard." }]);
          } catch (err: any) {
            console.error("Dashboard update error", err);
            addToast("Failed to update dashboard", "error");
            setMessages(prev => [...prev, { role: 'model', text: "I tried to update the dashboard, but an error occurred." }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      addToast(err.message || 'Failed to communicate with AI', "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full text-white shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center animate-bounce"
        style={{ backgroundColor: brandColor }}
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: brandColor }}>
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Copilot</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Powered by Gemini Vision</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'model' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
              {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               {msg.image && (
                 <img src={msg.image} alt="Upload" className="rounded-xl border border-black/10 dark:border-white/10 w-48 object-cover opacity-90 hover:opacity-100 transition-opacity" />
               )}
               {msg.text && (
                 <div className={`px-4 py-2 text-[13px] rounded-2xl leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-white border border-black/5 dark:bg-zinc-800 dark:border-white/5 text-slate-700 dark:text-slate-300 shadow-sm'}`}
                      style={msg.role === 'user' ? { backgroundColor: brandColor } : {}}
                 >
                   {msg.text}
                 </div>
               )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
               <Bot size={16} />
             </div>
             <div className="bg-white border border-black/5 dark:bg-zinc-800 dark:border-white/5 shadow-sm px-4 py-2 text-[13px] rounded-2xl flex flex-row gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 flex flex-col gap-2">
        {selectedImage && (
          <div className="relative inline-block w-16 h-16 ml-2">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-black/10" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 transition-colors bg-slate-100 dark:bg-zinc-800 rounded-xl"
             title="Upload Portfolio Screenshot"
           >
             <ImageIcon size={20} />
           </button>
           <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
           
           <textarea 
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={e => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
               }
             }}
             placeholder="Ask a question or upload screenshot..."
             className="flex-1 bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:ring-1 text-slate-800 dark:text-slate-200 min-h-[44px] max-h-[120px]"
             style={{ '--tw-ring-color': brandColor } as any}
             rows={1}
           />
           <button 
             onClick={handleSend}
             disabled={(!input.trim() && !selectedImage) || isLoading}
             className="p-2.5 text-white rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
             style={{ backgroundColor: brandColor }}
           >
             <Send size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
