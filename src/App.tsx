import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion, QuizOption, UserSelection, AppView } from './types/quiz';
import { parseAndValidateCSV, decodeQuestionsFromURLParam, encodeQuestionsToURLParam } from './utils/csv';
import { loadDraftQuestions, saveDraftQuestions, clearDraftQuestions } from './utils/storage';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { CompletionScreen } from './components/CompletionScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';

const DEFAULT_SAMPLE_CSV = `"question_id","question","option_a","option_b","option_c","option_d","correct_option"
"1","What we are going to eat tommorow?","برجر الوحش","كبدة الفلاح","البركة","هصوم","A"
"2","where to go after that?","cilantro ","Friends","Back home","Be homeless in the streets","B"
"4","Are you ready to decide?","Yes","No","Maybe","Ask me later","A"`;


export function App() {
  // Navigation view: 'quiz' (public) | 'admin' (dashboard) | 'preview' (test draft)
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('view');
      if (hash === '#admin' || mode === 'admin') return 'admin';
      if (hash === '#preview' || mode === 'preview') return 'preview';
    }
    return 'quiz';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [publicQuestions, setPublicQuestions] = useState<QuizQuestion[]>([]);
  const [draftQuestions, setDraftQuestions] = useState<QuizQuestion[]>([]);
  
  // Quiz progress state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selections, setSelections] = useState<UserSelection[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize questions on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // 1. Check if a shareable link was opened with URL-encoded data (?data=... or #quiz?data=...)
      let urlData: string | null = null;
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        urlData = searchParams.get('data') || searchParams.get('d');
        if (!urlData && window.location.hash.includes('data=')) {
          const hashQuery = window.location.hash.split('?')[1];
          if (hashQuery) {
            const hashParams = new URLSearchParams(hashQuery);
            urlData = hashParams.get('data') || hashParams.get('d');
          }
        }
      }

      if (urlData) {
        const decodedFromUrl = decodeQuestionsFromURLParam(urlData);
        if (decodedFromUrl && decodedFromUrl.length > 0) {
          setPublicQuestions(decodedFromUrl);
          setDraftQuestions(decodedFromUrl);
          setIsLoading(false);
          return;
        }
      }

      // 2. Load draft questions from localStorage (user uploaded or edited on this device)
      const savedDraft = loadDraftQuestions();
      if (savedDraft && savedDraft.length > 0) {
        setDraftQuestions(savedDraft);
        setPublicQuestions(savedDraft);
        setIsLoading(false);
        return;
      }

      // 3. Otherwise fetch public/questions.csv from site root
      try {
        const response = await fetch('./questions.csv');
        if (response.ok) {
          const csvText = await response.text();
          const parsed = parseAndValidateCSV(csvText);
          if (parsed.report.isValid && parsed.questions.length > 0) {
            setPublicQuestions(parsed.questions);
            setDraftQuestions(parsed.questions);
            saveDraftQuestions(parsed.questions);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      const fallbackParsed = parseAndValidateCSV(DEFAULT_SAMPLE_CSV).questions;
      setPublicQuestions(fallbackParsed);
      setDraftQuestions(fallbackParsed);
      saveDraftQuestions(fallbackParsed);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Sync URL hash with current view
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setCurrentIndex(0);
    setSelections([]);
    setIsCompleted(false);

    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        window.location.hash = 'admin';
      } else if (view === 'preview') {
        window.location.hash = 'preview';
      } else {
        const targetQ = draftQuestions.length > 0 ? draftQuestions : publicQuestions;
        if (targetQ.length > 0) {
          const encoded = encodeQuestionsToURLParam(targetQ);
          window.location.hash = `quiz?data=${encoded}`;
        } else {
          window.location.hash = 'quiz';
        }
      }
    }
  };

  const handleCopyQuizShareLink = async () => {
    const targetQ = draftQuestions.length > 0 ? draftQuestions : publicQuestions;
    if (targetQ.length === 0) return;
    const encoded = encodeQuestionsToURLParam(targetQ);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#quiz?data=${encoded}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Shareable link copied to clipboard!\n\nSend this link to anyone and it will load these exact questions!');
      } else {
        window.prompt('Copy this link to send to someone:', shareUrl);
      }
    } catch {
      window.prompt('Copy this link to send to someone:', shareUrl);
    }
  };


  // Listen to hash changes (back/forward browser buttons)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#admin')) setCurrentView('admin');
      else if (hash.startsWith('#preview')) setCurrentView('preview');
      else setCurrentView('quiz');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Save updated draft questions from Admin Dashboard (updates both draft and public view!)
  const handleSaveDraft = (updated: QuizQuestion[]) => {
    setDraftQuestions(updated);
    setPublicQuestions(updated);
    saveDraftQuestions(updated);
  };

  // Reset draft to original default
  const handleResetToDefault = async () => {
    clearDraftQuestions();
    try {
      const response = await fetch('./questions.csv');
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseAndValidateCSV(csvText);
        if (parsed.report.isValid && parsed.questions.length > 0) {
          setDraftQuestions(parsed.questions);
          setPublicQuestions(parsed.questions);
          saveDraftQuestions(parsed.questions);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackParsed = parseAndValidateCSV(DEFAULT_SAMPLE_CSV).questions;
    setDraftQuestions(fallbackParsed);
    setPublicQuestions(fallbackParsed);
    saveDraftQuestions(fallbackParsed);
  };


  // Active questions depending on view mode
  const activeQuestions = currentView === 'preview' ? draftQuestions : publicQuestions;
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = useCallback(
    (option: QuizOption) => {
      if (!currentQuestion) return;

      const newSelection: UserSelection = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedOptionLetter: option.letter,
        selectedOptionText: option.text,
      };

      const nextSelections = [...selections, newSelection];
      setSelections(nextSelections);

      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    },
    [currentQuestion, selections, currentIndex, totalQuestions]
  );

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelections([]);
    setIsCompleted(false);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading questionnaire...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        hasDraft={draftQuestions.length > 0}
        onShareLink={handleCopyQuizShareLink}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-4">
        {currentView === 'admin' ? (
          <AdminDashboard
            questions={draftQuestions}
            onSaveQuestions={handleSaveDraft}
            onResetToDefault={handleResetToDefault}
            onLaunchPublic={() => handleNavigate('quiz')}
            onPreview={() => handleNavigate('preview')}
          />
        ) : (
          <div className="w-full flex flex-col items-center justify-center my-auto">
            {!isCompleted && totalQuestions > 0 && (
              <ProgressBar
                currentQuestion={currentIndex + 1}
                totalQuestions={totalQuestions}
              />
            )}

            {!isCompleted && currentQuestion && (
              <QuestionCard
                key={`${currentView}-${currentQuestion.id}-${currentIndex}`}
                question={currentQuestion}
                questionIndex={currentIndex + 1}
                totalQuestions={totalQuestions}
                soundEnabled={soundEnabled}
                onSelectOption={handleSelectOption}
              />
            )}

            {isCompleted && (
              <CompletionScreen
                selections={selections}
                soundEnabled={soundEnabled}
                onRestart={handleRestartQuiz}
                onFinish={() => handleRestartQuiz()}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-xs text-slate-400 select-none border-t border-slate-200/60 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>Let's Make a Decision! • Interactive Escaping Options Quiz</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate('admin')}
              className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Admin Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('quiz')}
              className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Public Questionnaire
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
