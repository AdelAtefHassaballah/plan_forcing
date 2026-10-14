import React, { useEffect, useState } from 'react';
import type { PlanConfig, UserSelection } from '../types/plan';
import { launchGrandConfetti, launchOfficialConfetti } from '../utils/confetti';
import { playCelebrationSound } from '../utils/audio';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  RotateCcw,
  MailCheck,
} from 'lucide-react';

interface FinalScreenProps {
  config: PlanConfig;
  selections: UserSelection[];
  soundEnabled: boolean;
  onRestart: () => void;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({
  config,
  selections,
  soundEnabled,
  onRestart,
}) => {
  const { finalScreen, recipientName } = config;
  const [isOfficial, setIsOfficial] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Play grand celebration sound & confetti on mount
  useEffect(() => {
    launchGrandConfetti();
    playCelebrationSound(soundEnabled);
  }, [soundEnabled]);

  const handleMakeOfficial = () => {
    setIsOfficial(true);
    launchOfficialConfetti();
    playCelebrationSound(soundEnabled);
  };

  // Build clean text summary for copying
  const summaryText = [
    `💌 Official Date Plan ❤️`,
    recipientName ? `With: ${recipientName}` : '',
    ...selections.map((s, idx) => `• Step ${idx + 1} (${s.questionText}): ${s.selectedOptionText}`),
    `\nStatus: Officially Confirmed! Deal sealed with love. 💌✨`,
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopySummary = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Build Google Calendar URL
  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Our Date Plan ❤️`);
    const details = encodeURIComponent(
      `Date chosen together!\n\n${selections
        .map((s) => `${s.questionText}: ${s.selectedOptionText}`)
        .join('\n')}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-pop-in relative z-10">
      <div className="glass-card rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl shadow-rose-300/40">
        {/* Soft background glows */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-5 border border-rose-200/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Mission Accomplished</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-rose-600 tracking-tight leading-tight mb-3">
          {finalScreen.heading}
        </h1>

        {/* Subheading */}
        <p className="text-slate-700 text-sm sm:text-base font-medium mb-6 max-w-md mx-auto leading-relaxed">
          {finalScreen.subheading}
        </p>

        {/* Summary Card / Ticket */}
        <div className="bg-white/90 rounded-2xl p-5 sm:p-6 border-2 border-rose-100 shadow-md mb-6 text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-100">
            <span className="font-heading font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              {finalScreen.summaryHeading}
            </span>
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Verified 100% Legit
            </span>
          </div>

          <div className="space-y-3">
            {selections.map((item, idx) => (
              <div
                key={item.questionId}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-500 font-medium block truncate">
                    {item.questionText}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-800 block">
                    {item.selectedOptionText}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
              </div>
            ))}
          </div>

          {/* Sweet Closing Line */}
          <div className="mt-5 pt-4 border-t border-dashed border-rose-200 text-center">
            <p className="font-handwritten text-2xl sm:text-3xl font-bold text-rose-600">
              "{finalScreen.finalMessage}"
            </p>
          </div>
        </div>

        {/* Interactive Official Confirmation Area */}
        <div className="space-y-4">
          {!isOfficial ? (
            <button
              onClick={handleMakeOfficial}
              type="button"
              className="w-full sm:w-auto min-w-[260px] px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white font-heading font-bold text-lg shadow-xl shadow-rose-400/40 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-white animate-pulse" />
              <span>{finalScreen.officialButtonText}</span>
            </button>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 shadow-md text-center animate-pop-in">
              <div className="inline-flex items-center gap-2 text-rose-600 font-extrabold text-base sm:text-lg mb-1">
                <MailCheck className="w-5 h-5 text-rose-600" />
                <span>{finalScreen.officialConfirmedMessage}</span>
              </div>
              <p className="text-xs text-slate-500">
                No refunds, no cancellations, only happy vibes ahead! 🥰
              </p>
            </div>
          )}

          {/* Action buttons (Copy, Google Calendar, Restart) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={handleCopySummary}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-white/90 hover:bg-rose-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{finalScreen.copySuccessText}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-500" />
                  <span>{finalScreen.copyButtonText}</span>
                </>
              )}
            </button>

            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Add to Calendar</span>
            </a>

            <button
              onClick={onRestart}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{finalScreen.restartButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
