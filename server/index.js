import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

import { initDatabase, getDbStatus } from './db.js';
import { ensureDatasetDir } from './datasetService.js';

import configRoutes from './routes/configRoutes.js';
import geminiKeyRoutes from './routes/geminiKeyRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import dualPilotRoutes from './routes/dualPilotRoutes.js';

dotenv.config();

// Prevent server process crashes from unhandled asynchronous rejections
process.on('unhandledRejection', (reason) => {
  console.warn('[Server Warning] Caught unhandled rejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Server Warning] Caught uncaught exception:', err?.message || err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure dataset directory exists
ensureDatasetDir();

// Mount modular API routers
app.use('/api', configRoutes);
app.use('/api/gemini', geminiKeyRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/dataset', datasetRoutes);
app.use('/api', batchRoutes);
app.use('/api/paired', audioRoutes);
app.use('/api/dual-pilot', dualPilotRoutes);

// Serve frontend in production if built
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
const indexHtml = path.join(clientDist, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(indexHtml);
  });
} else {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Frontend Not Built</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>Frontend build not found</h2>
          <p>Please run <code>npm run build</code> inside the <code>client</code> directory.</p>
        </body>
      </html>
    `);
  });
}

// Initialize database and start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Kurdish TTS Dataset Server is running!`);
    console.log(`   ➜  Local:   http://localhost:${PORT}`);

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   ➜  Network (${name}): http://${iface.address}:${PORT}`);
        }
      }
    }

    console.log(`   📁 Dataset folder: ${ensureDatasetDir()}`);
    const db = getDbStatus();
    if (db.connected) {
      console.log(`   🗄️ MySQL Database: Connected (DB: ${db.database}, Samples: ${db.sampleCount})\n`);
    } else {
      console.log(`   ⚠️ MySQL Database: Disconnected (${db.error || 'Fallback to file storage'})\n`);
    }
  });
}

startServer();
