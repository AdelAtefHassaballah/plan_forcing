import React from 'react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
}) => {
  const percentage = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 my-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 px-1">
        <span className="text-indigo-600 font-medium">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-slate-400 font-mono text-[11px]">{percentage}% completed</span>
      </div>

      <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${Math.max(6, percentage)}%` }}
        />
      </div>
    </div>
  );
};
