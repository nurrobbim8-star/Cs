import React, { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Sparkles, Award } from 'lucide-react';

export interface QuizAnswer {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizSectionProps {
  studentName: string;
  className: string;
  gameScore: number;
  batchNumber: 1 | 2; // 1 = Soalan 1-10, 2 = Soalan 11-20
  allQuestions: Question[];
  onCompleteBatch: (results: {
    batchNumber: 1 | 2;
    batchCorrectCount: number;
    answers: QuizAnswer[];
  }) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  studentName,
  className: studentClass,
  gameScore,
  batchNumber,
  allQuestions,
  onCompleteBatch,
}) => {
  // Slice 10 questions for this batch
  const batchQuestions =
    batchNumber === 1 ? allQuestions.slice(0, 10) : allQuestions.slice(10, 20);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answersLog, setAnswersLog] = useState<QuizAnswer[]>([]);

  // Reset when batch changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCorrectCount(0);
    setAnswersLog([]);
  }, [batchNumber]);

  if (batchQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-300">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        Menyediakan soalan RBT Tahun 5...
      </div>
    );
  }

  const currentQ = batchQuestions[currentIndex];
  const isLastQuestion = currentIndex === batchQuestions.length - 1;
  const globalQuestionNumber = (batchNumber - 1) * 10 + currentIndex + 1;

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(option);
    setHasAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      sound.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playWrong();
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        question: currentQ.question,
        selectedAnswer: option,
        correctAnswer: currentQ.correctAnswer,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    sound.playButtonClick();

    if (isLastQuestion) {
      const finalBatchCorrect = correctCount;

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe catch
      }

      sound.playFanfare();

      onCompleteBatch({
        batchNumber,
        batchCorrectCount: finalBatchCorrect,
        answers: answersLog,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
      {/* Quiz Header Bar */}
      <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Bahagian {batchNumber}: Soalan {globalQuestionNumber} / 20
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
              (Soalan {currentIndex + 1} daripada 10 dalam bahagian ini)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                currentQ.tpLevel === 'TP6'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                  : currentQ.tpLevel === 'TP5'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              Aras {currentQ.tpLevel}
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
              {currentQ.topic}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Murid: <span className="font-semibold text-slate-200">{studentName}</span> ({studentClass}) | Skor Ninja Terkumpul: <span className="text-amber-400 font-bold">{gameScore} mata</span>
          </div>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Betul (Bhg {batchNumber})</div>
            <div className="text-base font-black text-emerald-400">
              {correctCount} / {currentIndex + (hasAnswered ? 1 : 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar within this 10-question batch */}
      <div className="w-full bg-slate-800 h-2">
        <div
          className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 h-2 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / batchQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-4 sm:p-7">
        {/* Scenario / Context */}
        {currentQ.scenario && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm leading-relaxed flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Situasi / Konteks RBT
              </div>
              <div className="whitespace-pre-line text-slate-200 font-normal">{currentQ.scenario}</div>
            </div>
          </div>
        )}

        {/* Question Text */}
        <h3 className="text-base sm:text-xl font-bold text-white mb-5 sm:mb-6 leading-snug">
          {currentQ.question}
        </h3>

        {/* Randomized Multiple Choice Options */}
        <div className="space-y-2.5 sm:space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQ.correctAnswer;

            let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-100 hover:border-slate-500';
            let labelBadge = 'bg-slate-700 text-slate-300 border-slate-600';

            if (hasAnswered) {
              if (isCorrectOption) {
                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40';
                labelBadge = 'bg-emerald-600 text-white border-emerald-400';
              } else if (isSelected && !isCorrectOption) {
                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40';
                labelBadge = 'bg-rose-600 text-white border-rose-400';
              } else {
                btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                labelBadge = 'bg-slate-800 text-slate-600 border-slate-700';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border transition-colors ${labelBadge}`}
                >
                  {optionLabels[idx]}
                </div>
                <div className="flex-1 pt-0.5 text-xs sm:text-base font-medium leading-relaxed">
                  {option}
                </div>
                {hasAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {hasAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pedagogical Explanation Box when answered */}
        {hasAnswered && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs sm:text-sm leading-relaxed animate-fade-in">
            <div className="font-bold flex items-center gap-2 text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              Penerangan Jawapan (Refleksi Pembelajaran):
            </div>
            <p className="text-slate-300">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question / Finish Batch Button */}
        {hasAnswered && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>
                {isLastQuestion
                  ? batchNumber === 1
                    ? 'Selesai 10 Soalan! Teruskan ke Ninja Round 2 (1 Minit)'
                    : 'Selesai 10 Soalan! Teruskan ke Ninja Round Akhir (1 Minit)'
                  : 'Soalan Seterusnya'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
