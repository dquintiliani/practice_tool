import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

let cache = null;

function load() {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  }
  return cache;
}

export function listUsers() {
  return load();
}

export function getUser(userId) {
  return load().find((u) => u.user_id === userId) || null;
}
