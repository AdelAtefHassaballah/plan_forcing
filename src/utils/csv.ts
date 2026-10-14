import Papa from 'papaparse';
import type { QuizQuestion, QuizOption, CSVValidationReport, CSVValidationError } from '../types/quiz';

/**
 * Letters mapped to option column names
 */
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Parses a CSV string and returns validated questions along with a comprehensive validation report.
 */
export function parseAndValidateCSV(csvText: string): {
  questions: QuizQuestion[];
  report: CSVValidationReport;
} {
  const errors: CSVValidationError[] = [];
  const warnings: CSVValidationError[] = [];
  const questions: QuizQuestion[] = [];

  // Remove possible UTF-8 BOM
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();

  if (!cleanText) {
    return {
      questions: [],
      report: {
        isValid: false,
        totalRows: 0,
        validRows: 0,
        errors: [{ row: 0, field: 'file', message: 'CSV file is completely empty', type: 'error' }],
        warnings: [],
      },
    };
  }

  const parsed = Papa.parse<Record<string, string>>(cleanText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach((pe) => {
      errors.push({
        row: (pe.row ?? 0) + 1,
        field: 'syntax',
        message: pe.message,
        type: 'error',
      });
    });
  }

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    return {
      questions: [],
      report: {
        isValid: false,
        totalRows: 0,
        validRows: 0,
        errors: [{ row: 0, field: 'header', message: 'No data rows found in CSV', type: 'error' }],
        warnings,
      },
    };
  }

  // Validate presence of required headers
  const headers = Object.keys(rows[0] || {});
  const hasQuestionHeader = headers.includes('question');
  const hasCorrectHeader = headers.includes('correct_option');

  if (!hasQuestionHeader) {
    errors.push({
      row: 1,
      field: 'header',
      message: 'Missing required header column: "question"',
      type: 'error',
    });
  }

  if (!hasCorrectHeader) {
    errors.push({
      row: 1,
      field: 'header',
      message: 'Missing required header column: "correct_option"',
      type: 'error',
    });
  }

  // If critical headers are missing, abort row parsing
  if (!hasQuestionHeader || !hasCorrectHeader) {
    return {
      questions: [],
      report: {
        isValid: false,
        totalRows: rows.length,
        validRows: 0,
        errors,
        warnings,
      },
    };
  }

  // Process and validate each row
  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header line
    const questionText = (row['question'] || '').trim();
    const correctLetter = (row['correct_option'] || '').trim().toUpperCase();
    const rawId = row['question_id'] ? String(row['question_id']).trim() : String(index + 1);

    let rowHasError = false;

    // 1. Validate question text
    if (!questionText) {
      errors.push({
        row: rowNum,
        field: 'question',
        message: 'Question text is empty',
        type: 'error',
      });
      rowHasError = true;
    }

    // 2. Extract options dynamically (option_a, option_b, option_c, ...)
    const options: QuizOption[] = [];
    LETTERS.forEach((letter) => {
      const colName = `option_${letter.toLowerCase()}`;
      if (colName in row) {
        const optText = (row[colName] || '').trim();
        if (optText) {
          options.push({
            id: letter.toLowerCase(),
            letter,
            text: optText,
          });
        }
      }
    });

    // 3. Validate minimum options count
    if (options.length < 2) {
      errors.push({
        row: rowNum,
        field: 'options',
        message: `Question must have at least 2 non-empty options (found ${options.length})`,
        type: 'error',
      });
      rowHasError = true;
    }

    // 4. Validate correct_option
    if (!correctLetter) {
      errors.push({
        row: rowNum,
        field: 'correct_option',
        message: 'Missing correct_option value',
        type: 'error',
      });
      rowHasError = true;
    } else {
      const targetOption = options.find((opt) => opt.letter === correctLetter);
      if (!targetOption) {
        errors.push({
          row: rowNum,
          field: 'correct_option',
          message: `correct_option "${correctLetter}" points to an empty or non-existent choice`,
          type: 'error',
        });
        rowHasError = true;
      }
    }

    // 5. Add warnings for potential data quirks
    if (questionText.length > 300) {
      warnings.push({
        row: rowNum,
        field: 'question',
        message: 'Question text is very long and may wrap heavily on mobile screens',
        type: 'warning',
      });
    }

    if (!rowHasError) {
      questions.push({
        id: rawId,
        question: questionText,
        options,
        correctOptionLetter: correctLetter,
        correctOptionId: correctLetter.toLowerCase(),
      });
    }
  });

  return {
    questions,
    report: {
      isValid: errors.length === 0 && questions.length > 0,
      totalRows: rows.length,
      validRows: questions.length,
      errors,
      warnings,
    },
  };
}

/**
 * Converts questionnaire list to standard CSV string
 */
export function exportQuestionsToCSV(questions: QuizQuestion[]): string {
  // Determine maximum options count across questions (at least 4)
  let maxOptions = 4;
  questions.forEach((q) => {
    if (q.options.length > maxOptions) {
      maxOptions = q.options.length;
    }
  });

  const headers = ['question_id', 'question'];
  for (let i = 0; i < maxOptions; i++) {
    headers.push(`option_${LETTERS[i].toLowerCase()}`);
  }
  headers.push('correct_option');

  const rows = questions.map((q, idx) => {
    const rowObj: Record<string, string> = {
      question_id: String(q.id || idx + 1),
      question: q.question,
    };

    for (let i = 0; i < maxOptions; i++) {
      const letter = LETTERS[i];
      const opt = q.options.find((o) => o.letter === letter);
      rowObj[`option_${letter.toLowerCase()}`] = opt ? opt.text : '';
    }

    rowObj['correct_option'] = q.correctOptionLetter;
    return rowObj;
  });

  return Papa.unparse(rows, {
    quotes: true,
    header: true,
  });
}

/**
 * Helper to trigger client-side download of a CSV file with UTF-8 BOM
 */
export function downloadCSV(filename: string, csvContent: string) {
  // \uFEFF is UTF-8 Byte Order Mark for Excel and Unicode viewers
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Encodes questions into a URL-safe base64 parameter (UTF-8 safe)
 */
export function encodeQuestionsToURLParam(questions: QuizQuestion[]): string {
  try {
    const csv = exportQuestionsToCSV(questions);
    const bytes = new TextEncoder().encode(csv);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return encodeURIComponent(btoa(binary));
  } catch (err) {
    console.error('Failed to encode questions to URL:', err);
    return '';
  }
}

/**
 * Decodes questions from a URL-safe base64 parameter (UTF-8 safe)
 */
export function decodeQuestionsFromURLParam(encoded: string): QuizQuestion[] | null {
  try {
    const binary = atob(decodeURIComponent(encoded));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const csv = new TextDecoder('utf-8').decode(bytes);
    const parsed = parseAndValidateCSV(csv);
    if (parsed.report.isValid && parsed.questions.length > 0) {
      return parsed.questions;
    }
  } catch (err) {
    console.error('Failed to decode questions from URL:', err);
  }
  return null;
}

