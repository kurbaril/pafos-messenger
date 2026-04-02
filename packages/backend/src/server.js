import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import chatRoutes from './routes/chats.js';
import groupRoutes from './routes/groups.js';
import messageRoutes from './routes/messages.js';
import searchRoutes from './routes/search.js';
import pinnedRoutes from './routes/pinned.js';
import mentionRoutes from './routes/mentions.js';
import uploadRoutes from './routes/upload.js';
import blockRoutes from './routes/blocks.js';
import adminRoutes from './routes/admin.js';

// WebSocket
import { setupWebSocket } from './websocket.js';

// Middleware
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { startKeepalive } from './keepalive.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const prisma = new PrismaClient();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://pafos-group.onrender.com'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Session middleware
const PgSession = pgSession(session);
export const sessionMiddleware = session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'Session',
    ttl: 365 * 24 * 60 * 60 // 1 year
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true, // Важно для HTTPS
    sameSite: 'none', // Важно для кросс-доменных запросов
    domain: '.onrender.com' // Разрешить cookie для всех поддоменов
  }
});

// Apply middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://pafos-group.onrender.com'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sessionMiddleware);
app.use(rateLimitMiddleware);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/pinned', pinnedRoutes);
app.use('/api/mentions', mentionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auto-create missing tables on startup
async function createTables() {
  try {
    // Create Session table for connect-pg-simple
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY (sid)
      );
    `;
    console.log('✅ Session table created');

    // Create UserPresence table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserPresence" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'offline',
        "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "UserPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ UserPresence table created');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
}

// Call the function
createTables();

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Setup WebSocket with session support
setupWebSocket(io);

// Start keep-alive service for free tier
startKeepalive();

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PaFos server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});