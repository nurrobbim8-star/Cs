import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const SCORES_FILE = path.join(DATA_DIR, 'students_scores.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure files exist
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(
      {
        googleSheetWebhookUrl: '',
        autoSyncGoogleSheet: true,
      },
      null,
      2
    ),
    'utf-8'
  );
}

// Helpers for reading/writing safely
function getScores(): any[] {
  try {
    const raw = fs.readFileSync(SCORES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading scores file:', err);
    return [];
  }
}

function saveScores(scores: any[]) {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving scores file:', err);
  }
}

function getSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { googleSheetWebhookUrl: '', autoSyncGoogleSheet: true };
  }
}

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings file:', err);
  }
}

// Helper to push to external Google Apps Script Webhook
async function forwardToGoogleSheet(webhookUrl: string, payload: any) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to forward to Google Sheets Webhook:', err);
    return false;
  }
}

app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/scores', (_req, res) => {
  const scores = getScores();
  // Sort descending by totalScore, then quizScore, then gameScore
  scores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
    return b.gameScore - a.gameScore;
  });
  res.json({ success: true, count: scores.length, scores });
});

app.post('/api/scores', async (req, res) => {
  try {
    const {
      name,
      className,
      gameScore = 0,
      quizScore = 0,
      totalScore = 0,
      correctCount = 0,
      totalQuestions = 20,
      tpLevel = 'TP4',
      answers = [],
      submittedAt = new Date().toISOString(),
    } = req.body;

    if (!name || !className) {
      return res.status(400).json({ success: false, message: 'Nama dan Nama Kelas wajib diisi' });
    }

    const trimmedName = String(name).trim();
    const trimmedClass = String(className).trim();

    const record = {
      id: 'rbt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      name: trimmedName,
      className: trimmedClass,
      gameScore: Number(gameScore) || 0,
      quizScore: Number(quizScore) || 0,
      totalScore: Number(totalScore) || (Number(gameScore) || 0) + (Number(quizScore) || 0),
      correctCount: Number(correctCount) || 0,
      totalQuestions: Number(totalQuestions) || 20,
      tpLevel: tpLevel || 'TP4',
      answers: Array.isArray(answers) ? answers : [],
      submittedAt: submittedAt || new Date().toISOString(),
    };

    const currentScores = getScores();
    currentScores.push(record);
    saveScores(currentScores);

    // Auto-sync to Google Sheet Webhook if configured
    const settings = getSettings();
    if (settings.googleSheetWebhookUrl && settings.autoSyncGoogleSheet) {
      forwardToGoogleSheet(settings.googleSheetWebhookUrl, {
        action: 'append_row',
        record: {
          id: record.id,
          name: record.name,
          className: record.className,
          gameScore: record.gameScore,
          quizScore: record.quizScore,
          totalScore: record.totalScore,
          correctCount: `${record.correctCount}/${record.totalQuestions}`,
          tpLevel: record.tpLevel,
          submittedAt: record.submittedAt,
        },
      }).catch((err) => console.error('Background Google Sheet sync error:', err));
    }

    res.json({ success: true, record });
  } catch (err: any) {
    console.error('Error saving student score:', err);
    res.status(500).json({ success: false, message: 'Ralat menyimpan skor murid' });
  }
});

// Delete a student score (Teacher only)
app.delete('/api/scores/:id', (req, res) => {
  const teacherPassword = req.headers['x-teacher-password'] || req.body?.password;
  if (teacherPassword !== 'guruskfut') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Kata laluan tidak sah.' });
  }

  const { id } = req.params;
  const currentScores = getScores();
  const filtered = currentScores.filter((item) => item.id !== id);

  if (filtered.length === currentScores.length) {
    return res.status(404).json({ success: false, message: 'Rekod murid tidak dijumpai' });
  }

  saveScores(filtered);
  res.json({ success: true, message: 'Rekod murid berjaya dipadam' });
});

// Clear all student records (Teacher only with confirmation)
app.post('/api/scores/clear-all', (req, res) => {
  const teacherPassword = req.headers['x-teacher-password'] || req.body?.password;
  if (teacherPassword !== 'guruskfut') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Kata laluan tidak sah.' });
  }

  saveScores([]);
  res.json({ success: true, message: 'Semua rekod murid telah dikosongkan' });
});

// Get settings
app.get('/api/settings', (_req, res) => {
  const settings = getSettings();
  res.json({ success: true, settings });
});

// Update settings (Teacher only)
app.post('/api/settings', (req, res) => {
  const teacherPassword = req.headers['x-teacher-password'] || req.body?.password;
  if (teacherPassword !== 'guruskfut') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Kata laluan tidak sah.' });
  }

  const { googleSheetWebhookUrl, autoSyncGoogleSheet } = req.body;
  const settings = {
    googleSheetWebhookUrl: typeof googleSheetWebhookUrl === 'string' ? googleSheetWebhookUrl.trim() : '',
    autoSyncGoogleSheet: Boolean(autoSyncGoogleSheet),
  };

  saveSettings(settings);
  res.json({ success: true, settings });
});

// Sync all data to Google Sheet
app.post('/api/sync-all-to-sheets', async (req, res) => {
  const teacherPassword = req.headers['x-teacher-password'] || req.body?.password;
  if (teacherPassword !== 'guruskfut') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Kata laluan tidak sah.' });
  }

  const settings = getSettings();
  if (!settings.googleSheetWebhookUrl) {
    return res.status(400).json({ success: false, message: 'Sila masukkan URL Webhook Google Sheet terlebih dahulu' });
  }

  const scores = getScores();
  const ok = await forwardToGoogleSheet(settings.googleSheetWebhookUrl, {
    action: 'bulk_sync',
    records: scores.map((s) => ({
      id: s.id,
      name: s.name,
      className: s.className,
      gameScore: s.gameScore,
      quizScore: s.quizScore,
      totalScore: s.totalScore,
      correctCount: `${s.correctCount}/${s.totalQuestions}`,
      tpLevel: s.tpLevel,
      submittedAt: s.submittedAt,
    })),
  });

  if (ok) {
    res.json({ success: true, message: `Berjaya segerak ${scores.length} rekod murid ke Google Sheet!` });
  } else {
    res.status(502).json({
      success: false,
      message: 'Gagal menghubungi Google Sheet Webhook. Sila pastikan Webhook URL betul dan dibenarkan (Anyone).',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RBT Ninja Server running on port ${PORT} (dev mode: ${isDev})`);
  });
}

startServer();
