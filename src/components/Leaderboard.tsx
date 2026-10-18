import React from 'react';
import { Trophy, Medal, Flame, BookCheck, Clock, RefreshCw, UserCheck } from 'lucide-react';
import { sound } from '../utils/audio';

export interface ScoreRecord {
  id: string;
  name: string;
  className: string;
  gameScore: number;
  quizScore: number;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  tpLevel: string;
  submittedAt: string;
}

interface LeaderboardProps {
  scores: ScoreRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  currentStudentId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  isLoading,
  onRefresh,
  currentStudentId,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🏆
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Carta Kedudukan Murid
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Kedudukan berasaskan Jumlah Skor Keseluruhan (Skor Ninja + Skor Kuiz RBT)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playButtonClick();
            onRefresh();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-slate-600 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Kemaskini Carta</span>
        </button>
      </div>

      {/* Top 3 Podium (If at least 2 or 3 records exist) */}
      {scores.length >= 3 && (
        <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-800/40 to-transparent border-b border-slate-800/80">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end pt-4">
            {/* Rank 2 (Silver) */}
            <div className="flex flex-col items-center text-center order-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-300 text-slate-900 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white mb-2">
                🥈
              </div>
              <div className="font-bold text-white text-xs sm:text-base line-clamp-1 w-full px-1">
                {scores[1].name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{scores[1].className}</div>
              <div className="mt-2 w-full bg-slate-800/90 border border-slate-600 rounded-t-xl py-3 px-1 text-center">
                <div className="text-sm sm:text-lg font-black text-slate-200">
                  {scores[1].totalScore}
                </div>
                <div className="text-[10px] text-slate-400">mata</div>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="flex flex-col items-center text-center order-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-amber-950 font-black text-2xl flex items-center justify-center shadow-xl border-2 border-amber-200 mb-2 animate-bounce">
                👑
              </div>
              <div className="font-extrabold text-amber-300 text-sm sm:text-lg line-clamp-1 w-full px-1">
                {scores[0].name}
              </div>
              <div className="text-xs text-amber-200/80 font-mono font-bold">
                {scores[0].className}
              </div>
              <div className="mt-2 w-full bg-gradient-to-b from-amber-500/20 to-slate-800 border-2 border-amber-500/60 rounded-t-xl py-4 px-1 text-center shadow-lg">
                <div className="text-base sm:text-2xl font-black text-amber-400">
                  {scores[0].totalScore}
                </div>
                <div className="text-[10px] font-bold text-amber-300 uppercase">JUARA NINJA</div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="flex flex-col items-center text-center order-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-700 text-amber-100 font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-600 mb-2">
                🥉
              </div>
              <div className="font-bold text-white text-xs sm:text-base line-clamp-1 w-full px-1">
                {scores[2].name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{scores[2].className}</div>
              <div className="mt-2 w-full bg-slate-800/90 border border-slate-600 rounded-t-xl py-2 px-1 text-center">
                <div className="text-sm sm:text-lg font-black text-amber-200">
                  {scores[2].totalScore}
                </div>
                <div className="text-[10px] text-slate-400">mata</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main List Container - Generous height & smooth scrolling */}
      <div className="p-4 sm:p-6">
        {scores.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-3">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Belum Ada Rekod Murid</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Nama murid akan dipaparkan di sini sebaik sahaja murid memasukkan nama penuh, nama kelas, bermain permainan Ninja Fruit dan menjawab 20 soalan RBT!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
            {scores.map((record, index) => {
              const rank = index + 1;
              const isCurrent = record.id === currentStudentId;

              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70'
                  }`}
                >
                  {/* Left: Rank & Student Full Name & Class */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-900 shadow-md'
                          : rank === 3
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-slate-700/80 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base sm:text-lg text-white break-words">
                          {record.name}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                            Anda
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-700/80 text-slate-200 font-bold text-xs border border-slate-600">
                          {record.className}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            record.tpLevel === 'TP6'
                              ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40'
                              : record.tpLevel === 'TP5'
                              ? 'bg-blue-900/80 text-blue-200 border border-blue-500/40'
                              : 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40'
                          }`}
                        >
                          {record.tpLevel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(record.submittedAt).toLocaleDateString('ms-MY', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores breakdown */}
                  <div className="flex items-center gap-3 self-end sm:self-center bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/80">
                    <div className="text-center px-2 border-r border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <span>⚔️ Ninja</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200">
                        {record.gameScore}
                      </div>
                    </div>

                    <div className="text-center px-2 border-r border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <span>📝 Kuiz</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-400">
                        {record.quizScore}{' '}
                        <span className="text-[10px] text-slate-400">
                          ({record.correctCount}/{record.totalQuestions})
                        </span>
                      </div>
                    </div>

                    <div className="text-right pl-2">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">
                        Jumlah Skor
                      </div>
                      <div className="text-base sm:text-xl font-black text-amber-300 tabular-nums">
                        {record.totalScore}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
