import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import routes
import uploadRoutes from './routes/upload';
import extractRoutes from './routes/extract';
import invoiceRoutes from './routes/invoices';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { seedDatabase } from './utils/seedDatabase';

dotenv.config();

const app = express();
const allowedOrigins = [
  'https://pdf-reviewer-web.vercel.app',
  'http://localhost:3000'
];

// Express middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route (Express)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database connection state
let isDatabaseConnected = false;
const requireDatabase = (req: Request, res: Response, next: NextFunction) => {
  if (!isDatabaseConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection unavailable',
      message: 'The database is currently unavailable. Please try again later.'
    });
  }
  next();
};

// Express API routes
app.use('/upload', uploadRoutes);
app.use('/extract', extractRoutes);
app.use('/invoices', requireDatabase, invoiceRoutes);

// Express error handling
app.use(errorHandler);
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Database connection
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) return;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    isDatabaseConnected = true;
    await seedDatabase();
  } catch (error) {
    console.warn('⚠️ Database connection failed, continuing without DB');
    isDatabaseConnected = false;
  }
}
connectDB().catch(console.error);

// --- Vercel serverless handler ---
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle simple endpoints without Express
  if (req.url?.startsWith('/health')) {
    return res.status(200).json({ status: 'API working' });
  }
  if (req.url?.startsWith('/upload')) {
    return res.status(200).json({ message: 'Upload endpoint' });
  }
  if (req.url?.startsWith('/extract')) {
    return res.status(200).json({ message: 'Extract endpoint' });
  }
  if (req.url?.startsWith('/invoices')) {
    return res.status(200).json({ message: 'Invoices endpoint' });
  }

  // Fallback: pass to Express app
  app(req as any, res as any);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API endpoints:`);
    console.log(`   POST http://localhost:${PORT}/upload`);
    console.log(`   POST http://localhost:${PORT}/extract`);
    console.log(`   GET  http://localhost:${PORT}/invoices`);
  });
}
