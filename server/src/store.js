import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ATTEMPTS_FILE = path.join(__dirname, '..', 'data', 'attempts.json');

function readAll() {
  if (!fs.existsSync(ATTEMPTS_FILE)) return [];
  const raw = fs.readFileSync(ATTEMPTS_FILE, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeAll(attempts) {
  fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
}

// Serialize writes so concurrent requests can't clobber each other's changes.
let queue = Promise.resolve();
function withLock(fn) {
  const result = queue.then(fn);
  queue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export function listAttempts() {
  return readAll();
}

export function getAttempt(attemptId) {
  return readAll().find((a) => a.attempt_id === attemptId) || null;
}

export function createAttempt(attempt) {
  return withLock(() => {
    const attempts = readAll();
    attempts.push(attempt);
    writeAll(attempts);
    return attempt;
  });
}

export function updateAttempt(attemptId, patch) {
  return withLock(() => {
    const attempts = readAll();
    const idx = attempts.findIndex((a) => a.attempt_id === attemptId);
    if (idx === -1) throw new Error(`attempt ${attemptId} not found`);
    attempts[idx] = { ...attempts[idx], ...patch };
    writeAll(attempts);
    return attempts[idx];
  });
}
