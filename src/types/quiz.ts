export type AppView = 'quiz' | 'admin' | 'preview';

export interface QuizOption {
  id: string; // e.g. "a", "b", "c", "d"
  letter: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  id: string | number;
  question: string;
  options: QuizOption[];
  correctOptionLetter: string; // "A", "B", "C", "D"
  correctOptionId: string; // "a", "b", "c", "d"
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface CSVValidationReport {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errors: CSVValidationError[];
  warnings: CSVValidationError[];
}

export interface UserSelection {
  questionId: string | number;
  questionText: string;
  selectedOptionLetter: string;
  selectedOptionText: string;
}

export interface CSVRawRow {
  question_id?: string | number;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  option_f?: string;
  correct_option?: string;
  [key: string]: unknown;
}
