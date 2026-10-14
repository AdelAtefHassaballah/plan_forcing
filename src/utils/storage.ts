import type { QuizQuestion } from '../types/quiz';

const STORAGE_KEY = 'decision_quiz_admin_draft_v1';

/**
 * Saves draft questions to localStorage
 */
export function saveDraftQuestions(questions: QuizQuestion[]): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      return true;
    }
  } catch (err) {
    console.error('Failed to save draft to localStorage:', err);
  }
  return false;
}

/**
 * Loads draft questions from localStorage
 */
export function loadDraftQuestions(): QuizQuestion[] | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as QuizQuestion[];
        }
      }
    }
  } catch (err) {
    console.error('Failed to load draft from localStorage:', err);
  }
  return null;
}

/**
 * Clears draft questions from localStorage
 */
export function clearDraftQuestions(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to clear localStorage draft:', err);
  }
}
