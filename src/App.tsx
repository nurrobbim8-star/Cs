/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NinjaGame } from './components/NinjaGame';
import { QuizSection, QuizAnswer } from './components/QuizSection';
import { Leaderboard, ScoreRecord } from './components/Leaderboard';
import { TeacherPortal } from './components/TeacherPortal';
import { sound } from './utils/audio';
import { Question, getPreparedQuestions } from './data/questions';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  GraduationCap,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check,
} from 'lucide-react';

type FlowState = 'register' | 'game1' | 'quiz1' | 'game2' | 'quiz2' | 'game3' | 'summary';

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'teacher'>('play');
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  // Registration & Flow State
  const [flowState, setFlowState] = useState<FlowState>('register');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');

  // 3 Game Rounds (1 minute each)
  const [gameRounds, setGameRounds] = useState<{
    round1: number;
    round2: number;
    round3: number;
  }>({
    round1: 0,
    round2: 0,
    round3: 0,
  });

  // 2 Quiz Batches (10 questions each = 20 total)
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizBatch1, setQuizBatch1] = useState<{
    correctCount: number;
    answers: QuizAnswer[];
  }>({
    correctCount: 0,
    answers: [],
  });
  const [quizBatch2, setQuizBatch2] = useState<{
    correctCount: number;
    answers: QuizAnswer[];
  }>({
    correctCount: 0,
    answers: [],
  });

  const [lastSubmittedRecord, setLastSubmittedRecord] = useState<ScoreRecord | null>(null);

  // Scores State
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real-time scores from server
  const fetchScores = useCallback(async () => {
    setIsLoadingScores(true);
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        if (data.scores && Array.isArray(data.scores)) {
          setScores(data.scores);
          try {
            localStorage.setItem('rbt_scores_backup', JSON.stringify(data.scores));
          } catch {
            // Safe catch
          }
        }
      }
    } catch (err) {
      console.warn('Network fetch error, reading local backup:', err);
      try {
        const cached = localStorage.getItem('rbt_scores_backup');
        if (cached) {
          setScores(JSON.parse(cached));
        }
      } catch {
        // Safe catch
      }
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  // Initial load & periodic poll
  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 15000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  // Audio Toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Student Registration submission -> Start Game Round 1
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playButtonClick();

    if (!studentName.trim() || !studentClass.trim()) {
      alert('Sila lengkapkan Nama Penuh dan Nama Kelas terlebih dahulu!');
      return;
    }

    // Prepare randomized questions for both batches
    const prepared = getPreparedQuestions();
    setAllQuestions(prepared);

    setGameRounds({ round1: 0, round2: 0, round3: 0 });
    setQuizBatch1({ correctCount: 0, answers: [] });
    setQuizBatch2({ correctCount: 0, answers: [] });
    setLastSubmittedRecord(null);

    setFlowState('game1');
  };

  // Stage 1 finish: Game Round 1 (1 min) -> Go to Quiz Batch 1 (10 questions)
  const handleFinishGame1 = (roundScore: number) => {
    setGameRounds((prev) => ({ ...prev, round1: roundScore }));
    setFlowState('quiz1');
  };

  // Stage 2 finish: Quiz Batch 1 (10 questions) -> Go to Game Round 2 (1 min)
  const handleFinishQuizBatch1 = (results: {
    batchNumber: 1 | 2;
    batchCorrectCount: number;
    answers: QuizAnswer[];
  }) => {
    setQuizBatch1({
      correctCount: results.batchCorrectCount,
      answers: results.answers,
    });
    setFlowState('game2');
  };

  // Stage 3 finish: Game Round 2 (1 min) -> Go to Quiz Batch 2 (10 questions)
  const handleFinishGame2 = (roundScore: number) => {
    setGameRounds((prev) => ({ ...prev, round2: roundScore }));
    setFlowState('quiz2');
  };

  // Stage 4 finish: Quiz Batch 2 (10 questions) -> Go to Game Round 3 (1 min Akhir)
  const handleFinishQuizBatch2 = (results: {
    batchNumber: 1 | 2;
    batchCorrectCount: number;
    answers: QuizAnswer[];
  }) => {
    setQuizBatch2({
      correctCount: results.batchCorrectCount,
      answers: results.answers,
    });
    setFlowState('game3');
  };

  // Stage 5 finish: Game Round 3 (1 min Akhir) -> Calculate Final Overall Scores & Submit
  const handleFinishGame3 = async (roundScore: number) => {
    setIsSubmitting(true);
    const finalRound3 = roundScore;
    const finalGameScore = gameRounds.round1 + gameRounds.round2 + finalRound3;
    setGameRounds((prev) => ({ ...prev, round3: finalRound3 }));

    const totalCorrect = quizBatch1.correctCount + quizBatch2.correctCount;
    const totalQuizScore = totalCorrect * 50;
    const overallScore = finalGameScore + totalQuizScore;

    let tp: 'TP4' | 'TP5' | 'TP6' = 'TP4';
    if (totalCorrect >= 17) tp = 'TP6';
    else if (totalCorrect >= 12) tp = 'TP5';

    const allAnswers = [...quizBatch1.answers, ...quizBatch2.answers];

    const payload = {
      name: studentName.trim(),
      className: studentClass.trim(),
      gameScore: finalGameScore,
      quizScore: totalQuizScore,
      totalScore: overallScore,
      correctCount: totalCorrect,
      totalQuestions: 20,
      tpLevel: tp,
      answers: allAnswers,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setLastSubmittedRecord(data.record);
        }
      } else {
        const localRecord: ScoreRecord = {
          id: 'local_' + Date.now(),
          ...payload,
        };
        setLastSubmittedRecord(localRecord);
      }
    } catch (err) {
      console.error('Error submitting score to server:', err);
      const localRecord: ScoreRecord = {
        id: 'local_' + Date.now(),
        ...payload,
      };
      setLastSubmittedRecord(localRecord);
    } finally {
      setIsSubmitting(false);
      setFlowState('summary');
      fetchScores();
    }
  };

  // Delete score (Teacher only)
  const handleDeleteScore = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/scores/${id}`, {
        method: 'DELETE',
        headers: {
          'x-teacher-password': 'guruskfut',
        },
      });
      if (res.ok) {
        await fetchScores();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting score:', err);
      return false;
    }
  };

  // Clear all scores (Teacher only)
  const handleClearAllScores = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/scores/clear-all', {
        method: 'POST',
        headers: {
          'x-teacher-password': 'guruskfut',
        },
      });
      if (res.ok) {
        await fetchScores();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error clearing scores:', err);
      return false;
    }
  };

  // Reset to play again or new student
  const handlePlayAgain = () => {
    sound.playButtonClick();
    setFlowState('register');
    setStudentName('');
    setStudentClass('');
    setGameRounds({ round1: 0, round2: 0, round3: 0 });
    setQuizBatch1({ correctCount: 0, answers: [] });
    setQuizBatch2({ correctCount: 0, answers: [] });
    setLastSubmittedRecord(null);
  };

  const isGamePhase =
    flowState === 'game1' || flowState === 'game2' || flowState === 'game3';

  // Stepper steps
  const steps = [
    { key: 'game1', label: 'Ninja 1', sub: '1 Minit', icon: '🥷' },
    { key: 'quiz1', label: 'Kuiz 1', sub: '10 Soalan', icon: '📝' },
    { key: 'game2', label: 'Ninja 2', sub: '1 Minit', icon: '🥷' },
    { key: 'quiz2', label: 'Kuiz 2', sub: '10 Soalan', icon: '📝' },
    { key: 'game3', label: 'Ninja 3', sub: '1 Minit Akhir', icon: '⚔️' },
    { key: 'summary', label: 'Keputusan', sub: 'Markah Penuh', icon: '🏆' },
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['register', 'game1', 'quiz1', 'game2', 'quiz2', 'game3', 'summary'];
    const currentIdx = order.indexOf(flowState);
    const stepIdx = order.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo Brand */}
          <div
            onClick={() => {
              sound.playButtonClick();
              setActiveTab('play');
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-orange-500/20 shrink-0">
              ⚔️
            </div>
            <div>
              <div className="font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                <span>RBT NINJA</span>
                <span className="text-amber-400">TAHUN 5</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                1 Minit Game • 10 Soalan • 1 Minit Game • 10 Soalan • 1 Minit Akhir
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveTab('play');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'play'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Main Game & Kuiz</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveTab('leaderboard');
                fetchScores();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Carta Kedudukan</span>
              {scores.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-900/60 text-white">
                  {scores.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveTab('teacher');
                fetchScores();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Portal Guru</span>
            </button>

            {/* Mute Button */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
              title={isMuted ? 'Buka Bunyi' : 'Senyapkan Bunyi'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto flex flex-col justify-center ${
          activeTab === 'play' && isGamePhase ? 'p-1 sm:p-3' : 'p-3 sm:p-6'
        }`}
      >
        {/* TAB 1: PLAY GAME & QUIZ */}
        {activeTab === 'play' && (
          <div className="w-full space-y-3">
            {/* Stage Progress Stepper (Visible during game & quiz) */}
            {flowState !== 'register' && flowState !== 'summary' && (
              <div className="max-w-4xl mx-auto px-2 py-2 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-xs">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                        status === 'current'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : status === 'done'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-800/40 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="text-xs">
                        {status === 'done' ? '✓' : step.icon}
                      </span>
                      <div className="text-left leading-tight">
                        <div className="text-[11px] font-extrabold">{step.label}</div>
                        <div className="text-[9px] opacity-80">{step.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1: Student Registration Screen */}
            {flowState === 'register' && (
              <div className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
                {/* Hero Icon */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 p-1 mx-auto mb-4 shadow-xl shadow-orange-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-4xl">
                    🍉
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    RBT Ninja Fruit Tahun 5
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Sila tulis nama penuh dan kelas anda sebelum memulakan siri cabaran permainan & kuiz!
                  </p>
                </div>

                <form onSubmit={handleStartGame} className="space-y-4">
                  {/* Nama Penuh Murid */}
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                      Nama Penuh Murid:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Muhammad Adam bin Ridzuan"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      required
                    />
                  </div>

                  {/* Nama Kelas Murid */}
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                      Nama Kelas:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 5 Arif / 5 Bestari / 5 Gemilang"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      * Tulis nama kelas anda seperti di sekolah.
                    </span>
                  </div>

                  {/* Rules flow preview */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Aliran Cabaran Pembelajaran:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] font-medium">
                      <li>Main Ninja Fruit <b>Pusingan 1 (1 Minit)</b></li>
                      <li>Jawab <b>10 soalan pertama</b> (Bahagian 1)</li>
                      <li>Main Ninja Fruit <b>Pusingan 2 (1 Minit)</b></li>
                      <li>Jawab <b>10 soalan kedua</b> (Bahagian 2)</li>
                      <li>Main Ninja Fruit <b>Pusingan 3 (1 Minit Terakhir)</b></li>
                      <li>Pengiraan & Paparan Markah Keseluruhan</li>
                    </ol>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>MULA PUSINGAN 1 (1 MINIT)!</span>
                  </button>
                </form>
              </div>
            )}

            {/* Pusingan 1: Game Round 1 (1 Minit) */}
            {flowState === 'game1' && (
              <NinjaGame
                studentName={studentName}
                className={studentClass}
                roundNumber={1}
                previousGameScore={0}
                onFinishGame={handleFinishGame1}
              />
            )}

            {/* Pusingan 2: Kuiz Bahagian 1 (10 Soalan) */}
            {flowState === 'quiz1' && (
              <QuizSection
                studentName={studentName}
                className={studentClass}
                gameScore={gameRounds.round1}
                batchNumber={1}
                allQuestions={allQuestions}
                onCompleteBatch={handleFinishQuizBatch1}
              />
            )}

            {/* Pusingan 3: Game Round 2 (1 Minit) */}
            {flowState === 'game2' && (
              <NinjaGame
                studentName={studentName}
                className={studentClass}
                roundNumber={2}
                previousGameScore={gameRounds.round1}
                onFinishGame={handleFinishGame2}
              />
            )}

            {/* Pusingan 4: Kuiz Bahagian 2 (10 Soalan) */}
            {flowState === 'quiz2' && (
              <QuizSection
                studentName={studentName}
                className={studentClass}
                gameScore={gameRounds.round1 + gameRounds.round2}
                batchNumber={2}
                allQuestions={allQuestions}
                onCompleteBatch={handleFinishQuizBatch2}
              />
            )}

            {/* Pusingan 5: Game Round 3 (1 Minit Akhir) */}
            {flowState === 'game3' && (
              <NinjaGame
                studentName={studentName}
                className={studentClass}
                roundNumber={3}
                previousGameScore={gameRounds.round1 + gameRounds.round2}
                onFinishGame={handleFinishGame3}
              />
            )}

            {/* Pusingan 6: Summary Result Screen (Markah Keseluruhan) */}
            {flowState === 'summary' && lastSubmittedRecord && (
              <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-8 shadow-2xl text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 font-black text-4xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20 animate-bounce">
                  🎉
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Tahniah, {lastSubmittedRecord.name}!
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Kelas: <span className="font-bold text-amber-400">{lastSubmittedRecord.className}</span> • Anda telah melengkapkan 3 pusingan permainan ninja & 20 soalan RBT!
                </p>

                {/* Detailed Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 text-left">
                  {/* Game Score Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div className="text-xs text-amber-400 uppercase font-black tracking-wider flex items-center gap-1.5 mb-2">
                      <span>⚔️ Skor Ninja (3 Pusingan @ 1 Minit)</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Pusingan 1 (1 Minit):</span>
                        <span className="font-bold text-white">+{gameRounds.round1} mata</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Pusingan 2 (1 Minit):</span>
                        <span className="font-bold text-white">+{gameRounds.round2} mata</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Pusingan 3 (1 Minit Akhir):</span>
                        <span className="font-bold text-white">+{gameRounds.round3} mata</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-600">
                      <span className="text-xs font-bold text-slate-200">Jumlah Skor Ninja:</span>
                      <span className="text-xl font-black text-amber-400">
                        {lastSubmittedRecord.gameScore}
                      </span>
                    </div>
                  </div>

                  {/* Quiz Score Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div className="text-xs text-emerald-400 uppercase font-black tracking-wider flex items-center gap-1.5 mb-2">
                      <span>📝 Skor Kuiz RBT (20 Soalan TP4-TP6)</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Bahagian 1 (Soalan 1-10):</span>
                        <span className="font-bold text-emerald-400">
                          {quizBatch1.correctCount} / 10 betul
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Bahagian 2 (Soalan 11-20):</span>
                        <span className="font-bold text-emerald-400">
                          {quizBatch2.correctCount} / 10 betul
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/60 pb-1">
                        <span>Jumlah Soalan Betul:</span>
                        <span className="font-bold text-white">
                          {lastSubmittedRecord.correctCount} / 20 soalan
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-600">
                      <span className="text-xs font-bold text-slate-200">Jumlah Skor Kuiz:</span>
                      <span className="text-xl font-black text-emerald-400">
                        {lastSubmittedRecord.quizScore}
                      </span>
                    </div>
                  </div>

                  {/* Overall Grand Total Card */}
                  <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20 border-2 border-amber-500/60 text-center shadow-lg">
                    <div className="text-xs uppercase font-black text-amber-400 tracking-wider">
                      JUMLAH SKOR KESELURUHAN (NINJA + KUIZ)
                    </div>
                    <div className="text-5xl font-black text-white my-1 tabular-nums">
                      {lastSubmittedRecord.totalScore}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-black text-amber-300 mt-1">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Tahap Penguasaan KSSR: {lastSubmittedRecord.tpLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sound.playButtonClick();
                      setActiveTab('leaderboard');
                      fetchScores();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Lihat Kedudukan di Carta</span>
                  </button>

                  <button
                    onClick={handlePlayAgain}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Main Semula</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CARTA KEDUDUKAN */}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            scores={scores}
            isLoading={isLoadingScores}
            onRefresh={fetchScores}
            currentStudentId={lastSubmittedRecord?.id}
          />
        )}

        {/* TAB 3: PORTAL GURU */}
        {activeTab === 'teacher' && (
          <TeacherPortal
            scores={scores}
            onRefreshScores={fetchScores}
            onDeleteScore={handleDeleteScore}
            onClearAllScores={handleClearAllScores}
          />
        )}
      </main>

      {/* Footer - Hidden during game to keep 100% of the mobile screen visible without scroll */}
      {!(activeTab === 'play' && isGamePhase) && (
        <footer className="bg-slate-900/60 border-t border-slate-800/80 py-3 sm:py-4 px-4 text-center text-xs text-slate-500 shrink-0">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © RBT Ninja Fruit Tahun 5 KSSR Semakan • Pentaksiran Bilik Darjah (PBD)
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Bab Pertengahan hingga Akhir</span>
              <span>•</span>
              <span>Aras TP4 - TP6</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
