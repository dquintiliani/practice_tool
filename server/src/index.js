import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getUser } from './users.js';
import usersRouter, { publicUsersRouter } from './routes/users.js';
import scenariosRouter from './routes/scenarios.js';
import attemptsRouter from './routes/attempts.js';
import managerRouter from './routes/manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', publicUsersRouter);

// --- Mock auth (V1 non-goal: real auth). The client sends the id of whichever
// mock user is currently selected in the account switcher via this header. ---
app.use('/api', (req, res, next) => {
  const userId = req.header('x-user-id');
  const user = userId ? getUser(userId) : null;
  if (!user) {
    return res.status(401).json({ error: 'missing or unknown x-user-id header' });
  }
  req.currentUser = user;
  next();
});

app.use('/api', usersRouter);
app.use('/api', scenariosRouter);
app.use('/api', attemptsRouter);
app.use('/api', managerRouter);

// Serve the built client in production, from the same origin.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`PM Scenario Simulator API listening on http://localhost:${PORT}`);
});
