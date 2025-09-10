import mongoose, { Schema, Document } from 'mongoose'
import type { Invoice as IInvoice, Vendor, InvoiceData, LineItem } from '@pdf-dashboard/types'

// Subdocument schemas
const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false })

const VendorSchema = new Schema<Vendor>({
  name: { type: String, required: true },
  address: { type: String },
  taxId: { type: String }
}, { _id: false })

const InvoiceDataSchema = new Schema<InvoiceData>({
  number: { type: String, required: true },
  date: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  subtotal: { type: Number },
  taxPercent: { type: Number },
  total: { type: Number },
  poNumber: { type: String },
  poDate: { type: String },
  lineItems: [LineItemSchema]
}, { _id: false })

// Main Invoice schema
export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const InvoiceSchema = new Schema<InvoiceDocument>({
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
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      return ret
    }
  }
})

// Indexes for better query performance
InvoiceSchema.index({ 'vendor.name': 'text', 'invoice.number': 'text', fileName: 'text' })
InvoiceSchema.index({ 'invoice.date': -1 })
InvoiceSchema.index({ createdAt: -1 })

// Create and export the model
export const Invoice = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema)

export default Invoice
