import { useState } from 'react';
import { planConfig } from './config/planConfig';
import type { AnswerOption, UserSelection } from './types/plan';

import { FloatingHearts } from './components/FloatingHearts';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { FinalScreen } from './components/FinalScreen';

export function App() {
  const [appState, setAppState] = useState<'start' | 'question' | 'final'>('start');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selections, setSelections] = useState<UserSelection[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(planConfig.soundEnabledDefault);

  const totalQuestions = planConfig.questions.length;
  const currentQuestion = planConfig.questions[currentIndex];

  const handleStart = () => {
    setCurrentIndex(0);
    setSelections([]);
    setAppState('question');
  };

  const handleSelectOption = (option: AnswerOption) => {
    const newSelection: UserSelection = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedOptionId: option.id,
      selectedOptionText: option.text,
    };

    const nextSelections = [...selections, newSelection];
    setSelections(nextSelections);

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setAppState('final');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelections([]);
    setAppState('start');
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50/70 to-purple-50 text-slate-800">
      {/* Dreamy animated floating hearts background */}
      <FloatingHearts />

      {/* Main Container */}
      <div className="w-full flex-1 flex flex-col items-center justify-between relative z-10 pb-6">
        {/* Navigation / Header */}
        <Header
          title={planConfig.title}
          recipientName={planConfig.recipientName}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onReset={handleRestart}
          showReset={appState !== 'start'}
        />

        {/* Progress Bar (Visible only during questionnaire) */}
        {appState === 'question' && (
          <ProgressBar
            currentQuestion={currentIndex + 1}
            totalQuestions={totalQuestions}
          />
        )}

        {/* Screen Content */}
        <main className="w-full flex-1 flex items-center justify-center my-auto">
          {appState === 'start' && (
            <StartScreen config={planConfig} onStart={handleStart} />
          )}

          {appState === 'question' && currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionIndex={currentIndex + 1}
              totalQuestions={totalQuestions}
              evasionMessages={planConfig.evasionMessages}
              soundEnabled={soundEnabled}
              onSelectOption={handleSelectOption}
            />
          )}

          {appState === 'final' && (
            <FinalScreen
              config={planConfig}
              selections={selections}
              soundEnabled={soundEnabled}
              onRestart={handleRestart}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full text-center py-2 text-xs text-slate-400 select-none">
          <p>
            Made with <span className="text-rose-500 animate-pulse">❤️</span> for unforgettable plans
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
