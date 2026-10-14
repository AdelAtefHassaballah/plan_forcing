import React from 'react';
import { Sparkles, HeartHandshake, ArrowRight, Smile } from 'lucide-react';
import type { PlanConfig } from '../types/plan';

interface StartScreenProps {
  config: PlanConfig;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ config, onStart }) => {
  const { startScreen, recipientName } = config;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 animate-pop-in relative z-10">
      <div className="glass-card rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl shadow-rose-200/50">
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-6 border border-rose-200/70 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>{startScreen.badge}</span>
        </div>

        {/* Hero Emoji / Icon Illustration */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-400/20 to-rose-400/30 rounded-3xl rotate-6 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-400/40 text-white transform hover:scale-105 transition-transform duration-300">
            <HeartHandshake className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight mb-3">
          {startScreen.title}
        </h1>

        {recipientName && (
          <p className="font-handwritten text-2xl text-rose-600 font-bold mb-2">
            Hey {recipientName}! ✨
          </p>
        )}

        {/* Subtitle / Description */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
          {startScreen.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          type="button"
          className="group relative w-full sm:w-auto min-w-[220px] px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white font-heading font-bold text-lg shadow-lg shadow-rose-400/40 hover:shadow-xl hover:shadow-rose-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <span>{startScreen.startButtonText}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Playful hint text */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <Smile className="w-3.5 h-3.5 text-rose-400" />
          <span>{startScreen.hintText}</span>
        </div>
      </div>
    </div>
  );
};
