import { spawn } from 'node:child_process';
import path from 'node:path';

console.log('========================================================');
console.log('🛡️  STARTING MILITARY ASSET MANAGEMENT SYSTEM');
console.log('📡  Backend:  http://localhost:5000');
console.log('💻  Frontend: http://localhost:5173');
console.log('========================================================\n');

// 1. Launch Backend API (Express + TypeScript + SQLite)
const backend = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: path.resolve(process.cwd(), 'backend'),
  stdio: 'inherit',
  shell: true
});

// 2. Launch Frontend (React + Vite)
const frontend = spawn('npx', ['vite', '--port', '5173', '--host'], {
  cwd: path.resolve(process.cwd(), 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Clean shutdown handler
process.on('SIGINT', () => {
  console.log('\n[ARES] Shutting down services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
