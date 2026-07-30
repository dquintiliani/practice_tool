import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENARIOS_DIR = path.join(__dirname, '..', 'data', 'scenarios');

let cache = null;

function load() {
  if (cache) return cache;
  const files = fs.readdirSync(SCENARIOS_DIR).filter((f) => f.endsWith('.json'));
  const scenarios = new Map();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(SCENARIOS_DIR, file), 'utf-8');
    const scenario = JSON.parse(raw);
    scenarios.set(scenario.scenario_id, scenario);
  }
  cache = scenarios;
  return cache;
}

export function listScenarios() {
  return Array.from(load().values());
}

export function getScenario(scenarioId) {
  return load().get(scenarioId) || null;
}
