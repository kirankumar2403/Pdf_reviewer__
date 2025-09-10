import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

// POST /upload - Upload PDF file
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded')
    }

    // In a real implementation, you would store the file in Vercel Blob or MongoDB GridFS
    // For now, we'll just use the local file system
    const fileId = path.basename(req.file.path)
    const response = {
      fileId: fileId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadUrl: `/uploads/${fileId}`, // This would be a real URL in production
    }

    res.json({
      success: true,
      data: response,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    next(error)
  }
})

export default router
// Optional
