import React from 'react';
import { Volume2, VolumeX, RotateCcw, Heart } from 'lucide-react';

interface HeaderProps {
  title: string;
  recipientName?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  showReset: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  recipientName,
  soundEnabled,
  onToggleSound,
  onReset,
  showReset,
}) => {
  return (
    <header className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-5 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-300/50">
          <Heart className="w-5 h-5 fill-white animate-heartbeat" />
        </div>
        <div>
          <span className="font-heading font-bold text-lg text-slate-800 tracking-tight block leading-tight">
            {title}
          </span>
          {recipientName && (
            <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 inline-block">
              For {recipientName} 🌸
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          type="button"
          aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          title={soundEnabled ? 'Sound effects ON' : 'Sound effects OFF'}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
            soundEnabled
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              : 'bg-white/80 border-slate-200 text-slate-400 hover:bg-slate-100'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {showReset && (
          <button
            onClick={onReset}
            type="button"
            aria-label="Restart questionnaire"
            title="Start over from beginning"
            className="p-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
