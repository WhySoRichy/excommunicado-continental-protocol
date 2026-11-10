import './ui/styles.css';
import { installQa } from './debug/qa';
import { Game } from './game/Game';
import type { LevelId } from './levels/types';
import type { QualityPreset } from './render/Renderer';
import { showFatal } from './ui/boot';

const params = new URLSearchParams(window.location.search);
const qa = params.has('qa') || import.meta.env.DEV;
const presetParam = params.get('preset');
const preset: QualityPreset = presetParam === 'low' || presetParam === 'high' ? presetParam : 'medium';
const levelParam = params.get('level');
const startLevel: LevelId = levelParam === 'arena' || levelParam === 'practice' ? levelParam : 'hub';
const pointerLock = !qa || params.get('lock') === '1';

function start(): void {
  const gameRoot = document.getElementById('game-root');
  const uiRoot = document.getElementById('ui-root');
  if (!gameRoot || !uiRoot) throw new Error('Faltan #game-root o #ui-root en index.html');
  const game = new Game(gameRoot, uiRoot, { qa, preset, startLevel, pointerLock });
  if (qa) installQa(game);
  game.boot().catch(showFatal);
}

try {
  start();
} catch (err) {
  showFatal(err);
}
