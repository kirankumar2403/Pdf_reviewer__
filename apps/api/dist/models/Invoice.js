"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Subdocument schemas
const LineItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });
const VendorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    address: { type: String },
    taxId: { type: String }
}, { _id: false });
const InvoiceDataSchema = new mongoose_1.Schema({
    number: { type: String, required: true },
    date: { type: String, required: true },
    currency: { type: String, default: 'USD' },
    subtotal: { type: Number },
    taxPercent: { type: Number },
    total: { type: Number },
    poNumber: { type: String },
    poDate: { type: String },
    lineItems: [LineItemSchema]
}, { _id: false });
const InvoiceSchema = new mongoose_1.Schema({
    fileId: {
        type: String,
        required: true,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    vendor: {
        type: VendorSchema,
        required: true
    },
    invoice: {
        type: InvoiceDataSchema,
        required: true
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt automatically
    toJSON: {
        transform: function (doc, ret) {
            ret._id = ret._id.toString();
            return ret;
        }
    }
});
// Indexes for better query performance
InvoiceSchema.index({ 'vendor.name': 'text', 'invoice.number': 'text', fileName: 'text' });
InvoiceSchema.index({ 'invoice.date': -1 });
InvoiceSchema.index({ createdAt: -1 });
// Create and export the model
exports.Invoice = mongoose_1.default.model('Invoice', InvoiceSchema);
exports.default = exports.Invoice;
//# sourceMappingURL=Invoice.js.map