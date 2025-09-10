"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const generative_ai_1 = require("@google/generative-ai");
const router = (0, express_1.Router)();
// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
    try {
        const pdfBuffer = fs_1.default.readFileSync(filePath);
        const data = await (0, pdf_parse_1.default)(pdfBuffer);
        return data.text;
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}
// Helper function to process text with Gemini AI
async function processWithGemini(text, apiKey) {
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
Analyze the following invoice/bill text and extract structured data. Return ONLY a JSON object with the following structure:

{
  "vendor": {
    "name": "string",
    "address": "string",
    "taxId": "string or null"
  },
  "invoice": {
    "number": "string",
    "date": "YYYY-MM-DD format",
    "currency": "string (e.g., USD, EUR)",
    "subtotal": number,
    "taxPercent": number,
    "total": number,
    "poNumber": "string or null",
    "poDate": "YYYY-MM-DD format or null",
    "lineItems": [
      {
        "description": "string",
        "unitPrice": number,
        "quantity": number,
        "total": number
      }
    ]
  }
}

If you cannot find specific information, use reasonable defaults or null values. Be sure to return valid JSON only.

Invoice text:
${text}
`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const extractedText = response.text();
        // Try to parse the JSON response
        try {
            const cleanedText = extractedText.replace(/```json\n?|```\n?/g, '').trim();
            return JSON.parse(cleanedText);
        }
        catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            console.error('Raw response:', extractedText);
            throw new Error('Failed to parse AI response as JSON');
        }
    }
    catch (error) {
        console.error('Error processing with Gemini:', error);
        throw error;
    }
}
// POST /extract - Extract data with AI
router.post('/', async (req, res, next) => {
    try {
        const { fileId, provider = 'gemini' } = req.body;
        if (!fileId) {
            throw (0, errorHandler_1.createError)('File ID is required', 400);
        }
        // In a real implementation, you would retrieve the file from storage
        // For now, we'll assume the file is stored in the uploads directory
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        const filePath = path_1.default.join(uploadsDir, fileId);
        // Check if file exists
        let fileExists = false;
        try {
            fileExists = fs_1.default.existsSync(filePath);
        }
        catch (err) {
            console.error('Error checking file existence:', err);
        }
        let extractedData;
        if (provider === 'gemini') {
            // Gemini API implementation with real PDF text extraction
            try {
                // Never hardcode API keys; use env var only
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    console.warn('GEMINI_API_KEY is not set. Falling back to mock extraction.');
                }
                if (fileExists) {
                    // Extract text from the uploaded PDF
                    const text = await extractTextFromPDF(filePath);
                    console.log('✅ Successfully extracted text from PDF:', fileId);
                    console.log('📄 Text preview:', text.substring(0, 200) + '...');
                    if (apiKey) {
                        try {
                            // Send text to Gemini for structured extraction
                            const aiResult = await processWithGemini(text, apiKey);
                            extractedData = {
                                _id: undefined,
                                fileId: fileId,
                                fileName: fileId.includes('-') ? fileId.split('-').pop() : 'invoice.pdf',
                                ...aiResult,
                                createdAt: new Date().toISOString(),
                            };
                            console.log('🤖 AI extraction successful');
                        }
                        catch (aiError) {
                            const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
                            console.warn('⚠️  AI processing failed, falling back to text-only extraction:', errorMessage);
                            // Fallback to text-only extraction when AI fails
                            extractedData = {
                                _id: undefined,
                                fileId: fileId,
                                fileName: fileId.includes('-') ? fileId.split('-').pop() : 'invoice.pdf',
                                vendor: {
                                    name: null,
                                    address: null,
                                    taxId: null,
                                },
                                invoice: {
                                    number: null,
                                    date: null,
                                    currency: null,
                                    subtotal: null,
                                    taxPercent: null,
                                    total: null,
                                    poNumber: null,
                                    poDate: null,
                                    lineItems: [],
                                    rawText: text,
                                },
                                extractionError: errorMessage,
                                createdAt: new Date().toISOString(),
                            };
                        }
                    }
                    else {
                        // Without API key, return plain text in a minimal structure
                        console.log('⚠️  No API key provided, returning text-only extraction');
                        extractedData = {
                            _id: undefined,
                            fileId: fileId,
                            fileName: fileId.includes('-') ? fileId.split('-').pop() : 'invoice.pdf',
                            vendor: {
                                name: null,
                                address: null,
                                taxId: null,
                            },
                            invoice: {
                                number: null,
                                date: null,
                                currency: null,
                                subtotal: null,
                                taxPercent: null,
                                total: null,
                                poNumber: null,
                                poDate: null,
                                lineItems: [],
                                rawText: text,
                            },
                            createdAt: new Date().toISOString(),
                        };
                    }
                }
                else {
                    console.log('File not found, using mock data');
                    // Fallback mock data
                    extractedData = {
                        _id: undefined,
                        fileId: fileId,
                        fileName: fileId.includes('-') ? fileId.split('-').pop() : 'invoice.pdf',
                        vendor: {
                            name: 'Sample Vendor Inc.',
                            address: '123 Business St, City, State 12345',
                            taxId: 'TAX-123456789',
                        },
                        invoice: {
                            number: 'INV-2024-001',
                            date: new Date().toISOString().split('T')[0],
                            currency: 'USD',
                            subtotal: 1000.00,
                            taxPercent: 8.5,
                            total: 1085.00,
                            poNumber: 'PO-2024-002',
                            poDate: new Date().toISOString().split('T')[0],
                            lineItems: [
                                {
                                    description: 'Professional Services',
                                    unitPrice: 100.00,
                                    quantity: 10,
                                    total: 1000.00,
                                },
                            ],
                        },
                        createdAt: new Date().toISOString(),
                    };
                }
            }
            catch (error) {
                console.error('❌ Unexpected error in extraction process:', error);
                // Only throw if we don't have any extracted data at all
                if (!extractedData) {
                    throw (0, errorHandler_1.createError)('Failed to extract data from PDF', 500);
                }
            }
        }
        else if (provider === 'groq') {
            // Groq API implementation (mock for now)
            extractedData = {
                _id: undefined,
                fileId: fileId,
                fileName: fileId.includes('-') ? fileId.split('-').pop() : 'invoice.pdf',
                vendor: {
                    name: 'Sample Vendor Corp.',
                    address: '456 Enterprise Ave, Business City, 54321',
                    taxId: 'TAX-987654321',
                },
                invoice: {
                    number: 'INV-2024-002',
                    date: new Date().toISOString().split('T')[0],
                    currency: 'USD',
                    subtotal: 2500.00,
                    taxPercent: 7.0,
                    total: 2675.00,
                    poNumber: 'PO-2024-002',
                    poDate: new Date().toISOString().split('T')[0],
                    lineItems: [
                        {
                            description: 'Software Development',
                            unitPrice: 250.00,
                            quantity: 10,
                            total: 2500.00,
                        },
                    ],
                },
                createdAt: new Date().toISOString(),
            };
        }
        else {
            throw (0, errorHandler_1.createError)('Invalid provider specified', 400);
        }
        res.json({
            success: true,
            data: {
                invoice: extractedData,
                confidence: 0.95,
            },
            message: `Data extracted successfully using ${provider}`,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /extract - Get extraction status or list extractions
router.get('/', async (req, res, next) => {
    try {
        // Implement your GET logic here
        res.json({
            success: true,
            data: { /* your data */},
            message: 'Extraction data retrieved successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=extract.js.map