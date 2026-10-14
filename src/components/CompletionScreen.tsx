import React, { useEffect, useState } from 'react';
import type { UserSelection } from '../types/quiz';
import { launchGrandConfetti } from '../utils/confetti';
import { playCelebrateSound } from '../utils/audio';
import { CheckCircle2, Copy, Check, RotateCcw, CheckSquare } from 'lucide-react';

interface CompletionScreenProps {
  selections: UserSelection[];
  soundEnabled: boolean;
  onRestart: () => void;
  onFinish?: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  selections,
  soundEnabled,
  onRestart,
  onFinish,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    launchGrandConfetti();
    playCelebrateSound(soundEnabled);
  }, [soundEnabled]);

  const handleCopy = async () => {
    const text = [
      'Decision Summary Results:',
      ...selections.map(
        (s, idx) => `${idx + 1}. ${s.questionText} -> [${s.selectedOptionLetter}] ${s.selectedOptionText}`
      ),
    ].join('\n');

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleFinishClick = () => {
    setIsFinished(true);
    if (onFinish) {
      onFinish();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-pop-in relative z-10">
      <div className="quiz-card rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-xl border border-slate-200">
        {/* Soft background tint spots */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-5 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Questionnaire Completed</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight mb-2">
          Decision complete!
        </h1>

        {/* Subheading */}
        <p className="text-slate-600 text-sm sm:text-base font-medium mb-6 max-w-md mx-auto leading-relaxed">
          All questions have been answered successfully.
        </p>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6 text-left">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <span className="font-heading font-bold text-slate-800 text-base flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Summary of Selected Answers
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {selections.length} items
            </span>
          </div>

          <div className="space-y-3">
            {selections.map((item, idx) => (
              <div
                key={item.questionId}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-500 font-medium block truncate">
                    {item.questionText}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800 block">
                    [{item.selectedOptionLetter}] {item.selectedOptionText}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions Area */}
        <div className="space-y-3">
          {!isFinished ? (
            <button
              onClick={handleFinishClick}
              type="button"
              className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-heading font-bold text-base shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Finish
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold animate-pop-in">
              Questionnaire finalized. Thank you!
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              onClick={onRestart}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
