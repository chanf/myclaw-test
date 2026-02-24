import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import { DatabaseService } from './db';
import { createNoteRoutes } from './routes/notes';
import { createFolderRoutes } from './routes/folders';
import { createAIRoutes } from './routes/ai';
import { createSearchRoutes } from './routes/search';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors({
  origin: '*',
  credentials: true
}));
app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Initialize database and routes
app.use('*', async (c, next) => {
  const db = c.env.DB;
  const dbService = new DatabaseService(db);
  
  // Store dbService in context for use in routes
  c.set('dbService', dbService);
  
  await next();
});

// Routes
app.use('/api/notes', async (c, next) => {
  const dbService = c.get('dbService') as DatabaseService;
  const notesRoutes = createNoteRoutes(dbService);
  return notesRoutes.fetch(c.req.raw, c.env, c.executionCtx);
});

app.use('/api/folders', async (c, next) => {
  const dbService = c.get('dbService') as DatabaseService;
  const foldersRoutes = createFolderRoutes(dbService);
  return foldersRoutes.fetch(c.req.raw, c.env, c.executionCtx);
});

app.use('/api/ai', createAIRoutes());

app.use('/api/search', async (c, next) => {
  const dbService = c.get('dbService') as DatabaseService;
  const searchRoutes = createSearchRoutes(dbService);
  return searchRoutes.fetch(c.req.raw, c.env, c.executionCtx);
});

export default app;
