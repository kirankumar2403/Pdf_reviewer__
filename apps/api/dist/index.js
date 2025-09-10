"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const upload_1 = __importDefault(require("./routes/upload"));
const extract_1 = __importDefault(require("./routes/extract"));
const invoices_1 = __importDefault(require("./routes/invoices"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const seedDatabase_1 = require("./utils/seedDatabase");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API routes
app.use('/upload', upload_1.default);
app.use('/extract', extract_1.default);
app.use('/invoices', invoices_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
// Database connection
async function connectDB() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not configured, skipping database connection');
            return;
        }
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        // Seed database with sample data if empty
        await (0, seedDatabase_1.seedDatabase)();
    }
    catch (error) {
        console.error('❌ Database connection error:', error instanceof Error ? error.message : String(error));
        console.warn('⚠️  Continuing without database connection for testing');
        // Don't exit - continue without database for testing
    }
}
// Start server
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 API Server running on port ${PORT}`);
        console.log(`📚 Health check: http://localhost:${PORT}/health`);
        console.log(`📋 API endpoints:`);
        console.log(`   POST http://localhost:${PORT}/upload`);
        console.log(`   POST http://localhost:${PORT}/extract`);
        console.log(`   GET  http://localhost:${PORT}/invoices`);
    });
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map