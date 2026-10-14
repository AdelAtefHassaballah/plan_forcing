import React, { useState, useRef, useId } from 'react';
import type { QuizQuestion, CSVValidationReport } from '../types/quiz';
import { parseAndValidateCSV, exportQuestionsToCSV, downloadCSV } from '../utils/csv';
import {
  UploadCloud,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Play,
  RotateCcw,
  FileText,
  AlertCircle,
  Info,
  GitBranch,
} from 'lucide-react';

interface AdminDashboardProps {
  questions: QuizQuestion[];
  onSaveQuestions: (updated: QuizQuestion[]) => void;
  onResetToDefault: () => void;
  onLaunchPublic: () => void;
  onPreview: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({

  questions,
  onSaveQuestions,
  onResetToDefault,
  onLaunchPublic,
  onPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Staged CSV parse results awaiting confirmation
  const [stagedData, setStagedData] = useState<{
    questions: QuizQuestion[];
    report: CSVValidationReport;
    filename: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  /**
   * Handle CSV file drop or file select
   */
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const result = parseAndValidateCSV(text);
      setStagedData({
        questions: result.questions,
        report: result.report,
        filename: file.name,
      });
    };
    reader.readAsText(file, 'utf-8');
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  /**
   * Apply validated staged questions to the active working draft
   */
  const handleApplyImport = () => {
    if (!stagedData || !stagedData.report.isValid) return;
    onSaveQuestions(stagedData.questions);
    showToast(`Successfully imported ${stagedData.questions.length} questions into working draft!`);
    setStagedData(null);
  };

  /**
   * Download sample CSV template
   */
  const handleDownloadSample = () => {
    const sampleContent =
      'question_id,question,option_a,option_b,option_c,option_d,correct_option\n' +
      '1,What should we do?,Go for coffee,Go for a walk,Watch a movie,Stay home,A\n' +
      '2,When should we do it?,Tomorrow,This weekend,Next month,Whenever,B\n' +
      '3,What time works best?,Morning,Afternoon,Evening,Night,C\n' +
      '4,Are you ready to decide?,Yes,No,Maybe,Ask me later,A\n';
    downloadCSV('sample_template.csv', sampleContent);
    showToast('Downloaded sample_template.csv');
  };

  /**
   * Export current questionnaire to CSV file
   */
  const handleExportCSV = () => {
    const csvContent = exportQuestionsToCSV(questions);
    downloadCSV('questions.csv', csvContent);
    showToast('Exported questions.csv (ready for public/questions.csv)');
  };

  /**
   * Edit question in table
   */
  const handleUpdateQuestionText = (index: number, newText: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], question: newText };
    onSaveQuestions(updated);
  };

  const handleUpdateOptionText = (qIndex: number, optLetter: string, newText: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    const newOptions = q.options.map((opt) =>
      opt.letter === optLetter ? { ...opt, text: newText } : opt
    );
    updated[qIndex] = { ...q, options: newOptions };
    onSaveQuestions(updated);
  };

  const handleUpdateCorrectOption = (qIndex: number, newCorrectLetter: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    updated[qIndex] = {
      ...q,
      correctOptionLetter: newCorrectLetter,
      correctOptionId: newCorrectLetter.toLowerCase(),
    };
    onSaveQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newId = String(questions.length + 1);
    const newQuestion: QuizQuestion = {
      id: newId,
      question: 'New Question?',
      options: [
        { id: 'a', letter: 'A', text: 'Option A' },
        { id: 'b', letter: 'B', text: 'Option B' },
        { id: 'c', letter: 'C', text: 'Option C' },
        { id: 'd', letter: 'D', text: 'Option D' },
      ],
      correctOptionLetter: 'A',
      correctOptionId: 'a',
    };
    onSaveQuestions([...questions, newQuestion]);
    showToast('Added new question');
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('The questionnaire must have at least one question.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== index);
    onSaveQuestions(updated);
    showToast('Deleted question');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-pop-in">
          {notification}
        </div>
      )}

      {/* Top Banner Alert regarding Browser Local Storage & Static Hosting */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 space-y-1">
          <p className="font-bold">
            Important Notice: Browser Local Storage & Static Hosting
          </p>
          <p className="text-amber-800 leading-relaxed">
            Changes made here are saved to this browser's <code>localStorage</code> so your work is preserved across refreshes. However, because GitHub Pages is a static host without a central database, this storage is <strong>browser-specific and not shared with other devices or public visitors</strong>.
          </p>
          <p className="text-amber-800 font-medium">
            To publish your updated questions for everyone, click <strong>"Export questions.csv"</strong> below, save it as <code>public/questions.csv</code> in your repository, and push to GitHub.
          </p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLaunchPublic}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Public Quiz</span>
          </button>

          <button
            onClick={onPreview}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview Draft</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSample}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export questions.csv</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset local draft back to original default questions?')) {
                onResetToDefault();
                showToast('Reset working draft to default questions');
              }
            }}
            type="button"
            title="Reset to default questions"
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. CSV File Upload Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            Import Questionnaire from CSV
          </h2>
          <span className="text-xs text-slate-500">Supports UTF-8 & Arabic</span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileSelect}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm text-slate-700">
            Click to upload or drag & drop your CSV file here
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Columns: <code>question_id, question, option_a, option_b, option_c, option_d, correct_option</code>
          </p>
        </div>

        {/* Validation Report & Staged Preview */}
        {stagedData && (
          <div className="mt-4 p-5 rounded-2xl border bg-slate-50 space-y-3 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stagedData.report.isValid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    File: {stagedData.filename}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {stagedData.report.validRows} valid of {stagedData.report.totalRows} rows parsed
                  </p>
                </div>
              </div>

              {stagedData.report.isValid && (
                <button
                  onClick={handleApplyImport}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Apply {stagedData.questions.length} Questions to Draft
                </button>
              )}
            </div>

            {/* Error Messages */}
            {stagedData.report.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Validation Errors:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                  {stagedData.report.errors.map((err, i) => (
                    <li key={i}>
                      {err.row > 0 ? `Row ${err.row} [${err.field}]: ` : ''}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {stagedData.report.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <p className="font-bold">Warnings:</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                  {stagedData.report.warnings.map((warn, i) => (
                    <li key={i}>
                      Row {warn.row} [{warn.field}]: {warn.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Editable Table of Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-800">
              Current Working Questionnaire ({questions.length} Questions)
            </h2>
            <p className="text-xs text-slate-500">
              Edit text, options, and secret correct answers in real-time.
            </p>
          </div>
          <button
            onClick={handleAddQuestion}
            type="button"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={q.id || qIndex}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {qIndex + 1}
                </span>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleUpdateQuestionText(qIndex, e.target.value)}
                  placeholder="Enter question text..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={() => handleDeleteQuestion(qIndex)}
                  type="button"
                  title="Delete question"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Options & Correct Answer Radio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt) => {
                  const isCorrect = q.correctOptionLetter === opt.letter;
                  return (
                    <div
                      key={opt.letter}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateCorrectOption(qIndex, opt.letter)}
                        title={`Set ${opt.letter} as correct answer`}
                        className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.letter}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleUpdateOptionText(qIndex, opt.letter, e.target.value)}
                        placeholder={`Option ${opt.letter} text...`}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none font-medium"
                      />

                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Target
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GitHub Pages Publishing Guide */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md space-y-3">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Publishing to GitHub Pages
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Because this website is hosted statically without a backend, follow these 3 simple steps whenever you want to update the public questionnaire:
        </p>
        <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-300 space-y-2 pl-1">
          <li>
            Click <strong>"Export questions.csv"</strong> above to download your finalized questionnaire.
          </li>
          <li>
            Place the downloaded file into your project's <code>public/questions.csv</code> location.
          </li>
          <li>
            Commit and push the file to your repository's <code>main</code> branch:
            <pre className="mt-1.5 p-2.5 rounded-xl bg-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
              git add public/questions.csv{'\n'}git commit -m "Update questionnaire"{'\n'}git push origin main
            </pre>
          </li>
        </ol>
        <p className="text-xs text-slate-400">
          The included GitHub Actions workflow will automatically build and publish your changes to GitHub Pages in under 60 seconds!
        </p>
      </div>
    </div>
  );
};
