import React, { useState, useEffect } from 'react';
import { ScoreRecord } from './Leaderboard';
import { sound } from '../utils/audio';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Lock,
  Unlock,
  Download,
  Trash2,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  RefreshCw,
  LogOut,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

interface TeacherPortalProps {
  scores: ScoreRecord[];
  onRefreshScores: () => void;
  onDeleteScore: (id: string) => Promise<boolean>;
  onClearAllScores: () => Promise<boolean>;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  scores,
  onRefreshScores,
  onDeleteScore,
  onClearAllScores,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);

  // Google Sheet Webhook settings
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load teacher settings from server
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setWebhookUrl(data.settings.googleSheetWebhookUrl || '');
            setAutoSync(data.settings.autoSyncGoogleSheet ?? true);
          }
        })
        .catch((err) => console.error('Error fetching settings:', err));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playButtonClick();
    if (passwordInput.trim() === 'guruskfut') {
      setIsAuthenticated(true);
      setAuthError('');
      sound.playFanfare();
    } else {
      setAuthError('Kata laluan tidak sah! Sila masukkan kata laluan guru yang betul.');
      sound.playWrong();
    }
  };

  const handleLogout = () => {
    sound.playButtonClick();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Filter scores
  const uniqueClasses = Array.from(new Set(scores.map((s) => s.className))).filter(Boolean);
  const filteredScores = scores.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || record.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculate statistics
  const totalStudents = scores.length;
  const tp6Count = scores.filter((s) => s.tpLevel === 'TP6').length;
  const tp5Count = scores.filter((s) => s.tpLevel === 'TP5').length;
  const tp4Count = scores.filter((s) => s.tpLevel === 'TP4').length;
  const avgScore =
    totalStudents > 0
      ? Math.round(scores.reduce((acc, curr) => acc + curr.totalScore, 0) / totalStudents)
      : 0;

  // Delete single student
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam rekod murid "${name}"?`)) {
      sound.playButtonClick();
      setDeletingId(id);
      const ok = await onDeleteScore(id);
      setDeletingId(null);
      if (ok) {
        sound.playCorrect();
      }
    }
  };

  // Clear all students
  const handleClearAll = async () => {
    if (window.confirm('PERINGATAN: Adakah anda pasti mahu memadam SEMUA rekod murid dalam senarai?')) {
      sound.playButtonClick();
      const ok = await onClearAllScores();
      setConfirmClearAll(false);
      if (ok) {
        sound.playCorrect();
      }
    }
  };

  // Save Google Sheet settings
  const handleSaveSettings = async () => {
    sound.playButtonClick();
    setIsSavingSettings(true);
    setSyncStatusMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-password': 'guruskfut',
        },
        body: JSON.stringify({
          googleSheetWebhookUrl: webhookUrl,
          autoSyncGoogleSheet: autoSync,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({ type: 'success', text: 'Tetapan Google Sheet berjaya disimpan!' });
        sound.playCorrect();
      } else {
        setSyncStatusMsg({ type: 'error', text: data.message || 'Gagal menyimpan tetapan' });
        sound.playWrong();
      }
    } catch {
      setSyncStatusMsg({ type: 'error', text: 'Ralat menyambung ke pelayan' });
      sound.playWrong();
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Trigger manual sync to Google Sheet
  const handleSyncAllToGoogleSheet = async () => {
    sound.playButtonClick();
    if (!webhookUrl) {
      alert('Sila masukkan URL Webhook Google Sheet terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await fetch('/api/sync-all-to-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-password': 'guruskfut',
        },
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({ type: 'success', text: data.message });
        sound.playCorrect();
      } else {
        setSyncStatusMsg({ type: 'error', text: data.message });
        sound.playWrong();
      }
    } catch {
      setSyncStatusMsg({ type: 'error', text: 'Gagal menghubungi Google Sheet' });
      sound.playWrong();
    } finally {
      setIsSyncing(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    sound.playButtonClick();
    if (scores.length === 0) {
      alert('Tiada data murid untuk dieksport.');
      return;
    }

    const headers = [
      'Bil',
      'Tarikh & Masa',
      'Nama Penuh Murid',
      'Nama Kelas',
      'Skor Permainan Ninja',
      'Skor Kuiz RBT',
      'Bilangan Betul',
      'Jumlah Soalan',
      'Jumlah Skor Keseluruhan',
      'Tahap Penguasaan (TP)',
    ];

    const rows = scores.map((s, idx) => [
      idx + 1,
      new Date(s.submittedAt).toLocaleString('ms-MY'),
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.className.replace(/"/g, '""')}"`,
      s.gameScore,
      s.quizScore,
      s.correctCount,
      s.totalQuestions,
      s.totalScore,
      s.tpLevel,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Data_Murid_RBT_Tahun_5_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate and download formal PDF Report for Malaysian Schools
  const handleDownloadPDF = () => {
    sound.playButtonClick();
    if (scores.length === 0) {
      alert('Tiada rekod data murid untuk dimuat turun ke PDF.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const goldColor: [number, number, number] = [217, 119, 6]; // Amber 600

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('KEMENTERIAN PENDIDIKAN MALAYSIA', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text('REKOD KEHADIRAN & PELAPORAN PENTAKSIRAN BILIK DARJAH (PBD)', 105, 22, {
      align: 'center',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      'MATA PELAJARAN: REKA BENTUK DAN TEKNOLOGI (RBT) TAHUN 5 KSSR SEMAKAN',
      105,
      28,
      { align: 'center' }
    );
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Topik: Bab Pertengahan hingga Akhir (Artikel Jahitan, Pertanian Bandar & Pengaturcaraan)',
      105,
      33,
      { align: 'center' }
    );

    // Decorative horizontal rule
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 36, 196, 36);

    // Summary metadata table
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const currentDate = new Date().toLocaleString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Tarikh Cetakan: ${currentDate}`, 14, 42);
    doc.text(`Jumlah Kehadiran Murid: ${totalStudents} orang`, 14, 47);
    doc.text(`Purata Skor: ${avgScore} mata`, 110, 42);
    doc.text(`Status TP: TP6 (${tp6Count}), TP5 (${tp5Count}), TP4 (${tp4Count})`, 110, 47);

    // Table rows
    const tableData = scores.map((s, idx) => [
      idx + 1,
      s.name,
      s.className,
      s.gameScore,
      `${s.quizScore} (${s.correctCount}/20)`,
      s.totalScore,
      s.tpLevel,
      new Date(s.submittedAt).toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    ]);

    autoTable(doc, {
      startY: 52,
      head: [
        [
          'Bil',
          'Nama Penuh Murid',
          'Kelas',
          'Skor Ninja',
          'Skor Kuiz',
          'Jumlah Skor',
          'Tahap (TP)',
          'Tarikh / Masa',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 26 },
        5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 28 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Signatures and verification at the end
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 14 : 220;

    // Check if new page is needed for signature block
    if (finalY > 240) {
      doc.addPage();
    }

    const sigY = finalY > 240 ? 30 : finalY;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    doc.text('Disediakan dan Disemak oleh:', 14, sigY);
    doc.text('Disahkan oleh:', 130, sigY);

    doc.line(14, sigY + 22, 70, sigY + 22);
    doc.line(130, sigY + 22, 186, sigY + 22);

    doc.text('(Guru Mata Pelajaran RBT Tahun 5)', 14, sigY + 27);
    doc.text('(Guru Besar / GPK Pentadbiran)', 130, sigY + 27);

    // Save PDF
    doc.save(`Laporan_PBD_Kehadiran_RBT_Tahun_5_${new Date().toISOString().slice(0, 10)}.pdf`);
    sound.playCorrect();
  };

  // Google Apps Script template code for teacher
  const googleAppsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Jika sheet masih baru & kosong, buatkan tajuk kolum
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Tarikh & Masa",
        "Nama Penuh Murid",
        "Nama Kelas",
        "Skor Ninja",
        "Skor Kuiz",
        "Jumlah Skor",
        "Bilangan Betul",
        "Tahap Penguasaan",
        "ID Rekod"
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === "append_row" && data.record) {
      var r = data.record;
      sheet.appendRow([
        new Date().toLocaleString("ms-MY"),
        r.name,
        r.className,
        r.gameScore,
        r.quizScore,
        r.totalScore,
        r.correctCount,
        r.tpLevel,
        r.id
      ]);
    } else if (data.action === "bulk_sync" && Array.isArray(data.records)) {
      data.records.forEach(function(r) {
        sheet.appendRow([
          new Date(r.submittedAt).toLocaleString("ms-MY"),
          r.name,
          r.className,
          r.gameScore,
          r.quizScore,
          r.totalScore,
          r.correctCount,
          r.tpLevel,
          r.id
        ]);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // If not logged in, show Password Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>

        <h2 className="text-2xl font-black text-white mb-2">Portal Guru RBT</h2>
        <p className="text-slate-400 text-sm mb-6">
          Kawasan khas untuk guru menyemak data kehadiran, memuat turun laporan PDF, menyelaraskan Google Sheets, dan mengurus senarai murid.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 text-left mb-1.5 uppercase tracking-wider">
              Kata Laluan Guru (Password):
            </label>
            <input
              type="password"
              placeholder="Masukkan kata laluan guru"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-center tracking-widest"
              required
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Log Masuk Portal Guru
          </button>
        </form>

        <div className="mt-6 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs">
          🔒 Bahagian ini dikhaskan untuk Guru Mata Pelajaran RBT sahaja.
        </div>
      </div>
    );
  }

  // Teacher Dashboard (Authenticated)
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Portal Guru RBT Tahun 5
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  Akses Disahkan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengurusan Data Kehadiran, Papan Skor PBD & Eksport Google Sheets
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSheetModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
              title="Tetapan Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Google Sheet Webhook</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Eksport Excel/CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-md shadow-red-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Muat Turun PDF Kehadiran</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Log Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Jumlah Murid Hadir</span>
            </div>
            <div className="text-2xl font-black text-white">{totalStudents}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Purata Skor</span>
            </div>
            <div className="text-2xl font-black text-amber-400">{avgScore}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Tahap TP6 (Cemerlang)</span>
            </div>
            <div className="text-2xl font-black text-purple-400">{tp6Count} orang</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tahap TP5 / TP4</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {tp5Count} / {tp4Count}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama murid atau nama kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {uniqueClasses.length > 0 && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Semua Kelas ({scores.length})</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                sound.playButtonClick();
                onRefreshScores();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>Senarai Rekod Murid</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {filteredScores.length} murid dijumpai
            </span>
          </h3>

          {scores.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua Data</span>
            </button>
          )}
        </div>

        {filteredScores.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">Tiada rekod murid yang sepadan dengan carian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bil</th>
                  <th className="py-3 px-4">Nama Penuh Murid</th>
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4 text-center">Skor Ninja</th>
                  <th className="py-3 px-4 text-center">Skor Kuiz (Betul/20)</th>
                  <th className="py-3 px-4 text-center">Jumlah Skor</th>
                  <th className="py-3 px-4 text-center">Tahap (TP)</th>
                  <th className="py-3 px-4 text-center">Tarikh & Masa</th>
                  <th className="py-3 px-4 text-center">Tindakan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredScores.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] break-words">
                      {record.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                        {record.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      {record.gameScore}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-emerald-400">{record.quizScore}</span>
                      <span className="text-xs text-slate-400 block">
                        ({record.correctCount}/{record.totalQuestions})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black">
                        {record.totalScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                          record.tpLevel === 'TP6'
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                            : record.tpLevel === 'TP5'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {record.tpLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 whitespace-nowrap">
                      {new Date(record.submittedAt).toLocaleString('ms-MY', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(record.id, record.name)}
                        disabled={deletingId === record.id}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 border border-rose-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Padam murid yang tidak berkaitan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Google Sheets Modal & Configuration */}
      {showSheetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  Integrasi Google Sheets (Simpanan Selamanya)
                </h3>
              </div>
              <button
                onClick={() => setShowSheetModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Semua data murid disimpan secara <b>kekal</b> pada pelayan. Untuk menyegerakkan rekod secara automatik ke fail Google Sheet peribadi anda, masukkan URL Google Apps Script Web App di bawah:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Google Apps Script Webhook URL:
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSync"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
              />
              <label htmlFor="autoSync" className="text-xs text-slate-300 font-medium">
                Segerak secara automatik setiap kali murid menghantar skor mereka
              </label>
            </div>

            {syncStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  syncStatusMsg.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                }`}
              >
                {syncStatusMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{syncStatusMsg.text}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tetapan</span>
              </button>

              <button
                onClick={handleSyncAllToGoogleSheet}
                disabled={isSyncing || !webhookUrl}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Segerak Semua Data ({scores.length} rekod) Sekarang</span>
              </button>
            </div>

            {/* Instruction Box with ready-to-copy code */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                <span>Cara Pasang Skrip di Google Sheet Anda (1 Minit Sahaja):</span>
                <span className="text-[10px] text-slate-400">Salin kod di bawah</span>
              </div>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Buka Google Sheet kosong baru di akaun Google anda.</li>
                <li>Klik menu <b>Extensions</b> &gt; <b>Apps Script</b>.</li>
                <li>Padam semua kod asal, dan tampal (Paste) kod di bawah:</li>
              </ol>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-emerald-300 overflow-x-auto font-mono max-h-36">
                {googleAppsScriptCode}
              </pre>
              <ol start={4} className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Klik butang <b>Deploy</b> (kanan atas) &gt; <b>New deployment</b>.</li>
                <li>Pilih jenis <b>Web app</b>. Pada <b>Who has access</b>, pilih <b>Anyone</b>.</li>
                <li>Klik Deploy, salin <b>Web app URL</b> tersebut dan tampal dalam kotak URL di atas!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
