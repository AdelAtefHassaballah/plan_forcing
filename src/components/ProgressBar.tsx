import React from 'react';
import { Heart } from 'lucide-react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
}) => {
  const percentage = Math.round(((currentQuestion) / totalQuestions) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 my-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 px-1">
        <span className="flex items-center gap-1.5 text-rose-600 font-medium">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-slate-400 font-mono text-[11px]">{percentage}% completed</span>
      </div>

      <div className="relative w-full h-2.5 bg-rose-100/80 rounded-full overflow-hidden p-0.5 border border-rose-200/50 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${Math.max(8, percentage)}%` }}
        />
      </div>
    </div>
  );
};
