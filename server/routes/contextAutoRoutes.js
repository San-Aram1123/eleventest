import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createAutoJobManager } from '../contextAuto/jobManager.js';

export function createContextAutoRouter(manager) {
  const router = express.Router();
  router.get('/activity', (_req, res) => {
    const filename = path.join(manager.store.root, 'activity.log');
    res.type('text/plain').send(fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8').slice(-256000) : 'No pipeline activity logged yet.');
  });
  const respond = task => async (req, res) => {
    try { res.json(await task(req)); }
    catch (error) { res.status(/not found/i.test(error.message) ? 404 : 400).json({ error: error.message }); }
  };
  router.get('/jobs', respond(() => ({ jobs: manager.list() })));
  router.post('/jobs', respond(req => manager.create(req.body)));
  router.get('/jobs/:id', respond(req => manager.get(req.params.id)));
  router.post('/jobs/:id/:action', respond(req => manager.action(req.params.id, req.params.action)));
  router.get('/jobs/:id/batches/:number/:asset', (req, res) => {
    try {
      const job = manager.get(req.params.id);
      const number = Number(req.params.number);
      if (!job.batches[number] || !Number.isSafeInteger(number)) throw new Error('Group not found.');
      const name = { master: 'master.wav', diagnostics: 'analysis.json' }[req.params.asset];
      if (!name) throw new Error('Asset not found.');
      const filename = manager.store.batchFile(job.id, number, name);
      if (!fs.existsSync(filename)) throw new Error('Asset not found.');
      res.download(filename, `context-auto-${job.id}-group-${number + 1}-${name}`);
    } catch (error) { res.status(404).json({ error: error.message }); }
  });
  return router;
}

export default createContextAutoRouter(createAutoJobManager());
