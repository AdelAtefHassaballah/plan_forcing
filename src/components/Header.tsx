import React from 'react';
import { Volume2, VolumeX, LayoutDashboard, Play, Sparkles, Eye } from 'lucide-react';
import type { AppView } from '../types/quiz';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasDraft: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  soundEnabled,
  onToggleSound,
  hasDraft,
}) => {
  return (
    <header className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Brand & Mode */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <button
            onClick={() => onNavigate('quiz')}
            className="text-left font-heading font-bold text-lg text-slate-800 tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Let's Make a Decision!
          </button>
          <div className="flex items-center gap-1.5 mt-0.5">
            {currentView === 'admin' && (
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Admin Dashboard
              </span>
            )}
            {currentView === 'preview' && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Preview Mode (Draft)
              </span>
            )}
            {currentView === 'quiz' && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Public Questionnaire
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-2">
        {currentView !== 'quiz' && (
          <button
            onClick={() => onNavigate('quiz')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Public Quiz</span>
          </button>
        )}

        {hasDraft && currentView !== 'preview' && (
          <button
            onClick={() => onNavigate('preview')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Preview Draft</span>
          </button>
        )}

        {currentView !== 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        )}

        <button
          onClick={onToggleSound}
          type="button"
          aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          title={soundEnabled ? 'Sound effects ON' : 'Sound effects OFF'}
          className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
            soundEnabled
              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
