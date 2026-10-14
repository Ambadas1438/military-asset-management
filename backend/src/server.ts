import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { initDatabase } from './db/database.ts';
import { authenticateUser } from './middleware/auth.ts';
import { apiTransactionLogger } from './middleware/logger.ts';
import { authRouter } from './routes/auth.ts';
import { dashboardRouter } from './routes/dashboard.ts';
import { purchasesRouter } from './routes/purchases.ts';
import { transfersRouter } from './routes/transfers.ts';
import { assignmentsRouter } from './routes/assignments.ts';
import { basesRouter } from './routes/bases.ts';
import { auditRouter } from './routes/audit.ts';

// 1. Initialize Relational Database & Seed Data
initDatabase();

// 2. Setup Express Server
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// 3. Register Middleware
app.use(authenticateUser);
app.use(apiTransactionLogger);

// 4. Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/bases', basesRouter);
app.use('/api/audit', auditRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ARES Military Asset Management Framework',
    timestamp: new Date().toISOString(),
    user: req.user ? { name: req.user.name, role: req.user.role } : null
  });
});

// Direct Download Endpoints for Submission
app.get('/api/download/zip', (req, res) => {
  const candidatePaths = [
    'C:/Users/ADMIN/.gemini/antigravity/scratch/military-asset-management.zip',
    'C:/Users/ADMIN/Downloads/military-asset-management.zip',
    'C:/Users/ADMIN/OneDrive/Desktop/military-asset-management.zip'
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return res.download(p, 'military-asset-management.zip');
    }
  }
  res.status(404).json({ error: 'Zip file not found' });
});

app.get('/api/download/sql', (req, res) => {
  const dumpPath = 'C:/Users/ADMIN/.gemini/antigravity/scratch/military-asset-management/database_dump.sql';
  if (fs.existsSync(dumpPath)) {
    return res.download(dumpPath, 'database_dump.sql');
  }
  res.status(404).json({ error: 'SQL dump not found' });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[UNHANDLED SERVER ERROR]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected operational failure occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  ARES MILITARY ASSET MANAGEMENT SYSTEM (BACKEND)`);
  console.log(`📡  Server active on: http://localhost:${PORT}`);
  console.log(`🔒  RBAC Active | Relational Ledger Initialized`);
  console.log(`=======================================================`);
});
