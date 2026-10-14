import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('========================================================');
console.log('🛡️  ARES MILITARY ASSET MANAGEMENT SYSTEM');
console.log('⚡  Stack: Java 17 Spring Boot + React Vite + MySQL');
console.log('📡  Backend URL:  http://localhost:5000');
console.log('💻  Frontend App: http://localhost:5000 (Integrated)');
console.log('========================================================\n');

// 1. Locate Maven executable
const netbeansMvn = 'C:\\Program Files\\Apache NetBeans\\java\\maven\\bin\\mvn.cmd';
const userMvn = path.join(
  process.env.USERPROFILE || 'C:\\Users\\ADMIN',
  '.m2\\wrapper\\dists\\apache-maven-3.9.16-bin\\5grr65jo27hi51sujmtcldfovl\\apache-maven-3.9.16\\bin\\mvn.cmd'
);

let mvnCmd = 'mvn';
if (fs.existsSync(netbeansMvn)) {
  mvnCmd = netbeansMvn;
} else if (fs.existsSync(userMvn)) {
  mvnCmd = userMvn;
}

// 2. Launch Spring Boot Backend
const backend = spawn(mvnCmd, ['spring-boot:run'], {
  cwd: path.resolve(process.cwd(), 'java-backend'),
  stdio: 'inherit',
  shell: true
});

// 3. Clean shutdown handler
const shutdown = () => {
  console.log('\n[ARES] Shutting down services...');
  backend.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
