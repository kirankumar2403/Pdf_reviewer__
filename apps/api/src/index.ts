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
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes
app.use('/upload', uploadRoutes)
app.use('/extract', extractRoutes)
app.use('/invoices', invoiceRoutes)

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
    
    // Seed database with sample data if empty
    await seedDatabase()
  } catch (error) {
    console.error('❌ Database connection error:', error instanceof Error ? error.message : String(error))
    console.warn('⚠️  Continuing without database connection for testing')
    // Don't exit - continue without database for testing
  }
}

// Start server
async function startServer() {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`)
    console.log(`📚 Health check: http://localhost:${PORT}/health`)
    console.log(`📋 API endpoints:`)
    console.log(`   POST http://localhost:${PORT}/upload`)
    console.log(`   POST http://localhost:${PORT}/extract`)
    console.log(`   GET  http://localhost:${PORT}/invoices`)
  })
}

startServer().catch(console.error)
