export interface AnswerOption {
  id: string;
  label: string; // e.g., 'A', 'B', 'C', 'D'
  text: string;
  icon?: string; // e.g. 'coffee', 'heart', 'calendar', 'clock', etc.
}

export interface QuestionItem {
  id: number;
  question: string;
  subtitle?: string;
  options: AnswerOption[];
  correctOptionId: string; // Secret correct answer ID that remains stationary & clickable
  successFeedback?: string; // Message shown when correct answer is picked
}

export interface PlanConfig {
  title: string;
  recipientName?: string; // Optional name of the person (e.g. "Sarah", or leave empty)
  startScreen: {
    title: string;
    subtitle: string;
    badge: string;
    startButtonText: string;
    hintText: string;
  };
  evasionMessages: string[];
  questions: QuestionItem[];
  finalScreen: {
    heading: string;
    subheading: string;
    summaryHeading: string;
    finalMessage: string;
    officialButtonText: string;
    officialConfirmedMessage: string;
    copyButtonText: string;
    copySuccessText: string;
    restartButtonText: string;
  };
  soundEnabledDefault: boolean;
}

export interface UserSelection {
  questionId: number;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
}
