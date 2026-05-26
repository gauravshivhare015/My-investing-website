import React from 'react';
import { Mail, MessageSquare, Bug, Youtube, ShieldAlert, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const contactEmail = "gauravshivhare15@gmail.com";

  const getGmailLink = (subject: string) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=${encodeURIComponent(subject)}`;
  };

  const socialLinks = [
    { name: 'X', icon: <XIcon size={18} />, href: 'https://x.com/Wellverse_' },
    { name: 'YouTube', icon: <Youtube size={18} />, href: 'https://www.youtube.com/@gauravshivhare015' },
  ];

  return (
    <footer className="relative mt-20 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand & Socials Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20">M</span>
                My Investing Website
              </h3>
              <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                Empowering your financial journey with AI-driven market intelligence and real-time portfolio tracking.
              </p>
            </div>
            <div className="flex flex-col items-start gap-5">
              <a 
                href="https://drive.google.com/uc?export=download&id=14eFa0zneSHnSfZjnUTkG7bl_vhfO2dDN" 
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40"
              >
                <Download size={18} className="animate-bounce" />
                <span>Download Android App</span>
              </a>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-brand hover:text-white dark:hover:bg-brand transition-all shadow-sm hover:shadow-lg hover:shadow-brand/30"
                >
                  {social.icon}
                </motion.a>
              ))}
              </div>
            </div>
          </div>

          {/* Improvement & Support Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Support & Feedback</h4>
            <div className="flex flex-col gap-3">
              <a 
                href={getGmailLink("Site Feedback & Suggestions")}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-brand/20 transition-all hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-xl hover:shadow-brand/5 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">Feedback</div>
                  <div className="text-[10px] text-slate-500 font-medium">Share your suggestions</div>
                </div>
              </a>
              <a 
                href={getGmailLink("Bug Report - My Investing Website")}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-rose-500/20 transition-all hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-xl hover:shadow-rose-500/5 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                  <Bug size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">Report Bug</div>
                  <div className="text-[10px] text-slate-500 font-medium">Help us improve the app</div>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Connect</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-3 group">
                <div className="w-5 h-5 mt-0.5 text-brand group-hover:scale-125 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Email Support</p>
                  <a 
                    href={getGmailLink("Support Inquiry")} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-slate-700 dark:text-zinc-300 hover:text-brand transition-all border-b-2 border-dotted border-slate-300 dark:border-zinc-700 hover:border-brand pb-0.5"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 text-brand">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Live Site</p>
                  <a href="https://my-investing-website.vercel.app/" target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-brand transition-colors">
                    my-investing-website.vercel.app
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
          <p>© {currentYear} Gaurav Shivhare. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
