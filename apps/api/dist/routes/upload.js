"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
// POST /upload - Upload PDF file
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        // In a real implementation, you would store the file in Vercel Blob or MongoDB GridFS
        // For now, we'll just use the local file system
        const fileId = path_1.default.basename(req.file.path);
        const response = {
            fileId: fileId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            uploadUrl: `/uploads/${fileId}`, // This would be a real URL in production
        };
        res.json({
            success: true,
            data: response,
            message: 'File uploaded successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
// Optional
//# sourceMappingURL=upload.js.map