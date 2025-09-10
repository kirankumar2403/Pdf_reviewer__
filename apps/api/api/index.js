import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Import routes
import uploadRoutes from './routes/upload'
import extractRoutes from './routes/extract'
import invoiceRoutes from './routes/invoices'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { seedDatabase } from './utils/seedDatabase'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT

// Database connection state
let isDatabaseConnected = false

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['https://pdf-reviewer-web.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Handle preflight requests for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://pdf-reviewer-web.vercel.app')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Database middleware for routes that need DB
const requireDatabase = (req: any, res: any, next: any) => {
  if (!isDatabaseConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection unavailable',
      message: 'The database is currently unavailable. Please try again later.'
    })
  }
  next()
}

// API routes
app.use('/upload', uploadRoutes)
app.use('/extract', extractRoutes)
app.use('/invoices', requireDatabase, invoiceRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  })
})

// Database connection
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not configured, skipping database connection')
      return
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')
    isDatabaseConnected = true
    
    // Seed database with sample data if empty
    await seedDatabase()
  } catch (error) {
    console.error('❌ Database connection error:', error instanceof Error ? error.message : String(error))
    console.warn('⚠️  Continuing without database connection for testing')
    isDatabaseConnected = false
    // Don't exit - continue without database for testing
  }
}

// Initialize database connection
connectDB().catch(console.error)

// Export the Express app for Vercel serverless functions
module.exports = app