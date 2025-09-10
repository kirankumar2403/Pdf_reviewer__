import { Router } from 'express'
import { createError } from '../middleware/errorHandler'
import Invoice from '../models/Invoice'

const router = Router()

// GET /invoices - List invoices with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    let query: any = {}
    
    if (q && typeof q === 'string') {
      // Use MongoDB text search if available, otherwise regex search
      query.$or = [
        { 'vendor.name': { $regex: q, $options: 'i' } },
        { 'invoice.number': { $regex: q, $options: 'i' } },
        { fileName: { $regex: q, $options: 'i' } }
      ]
    }

    // Sort configuration
    const sortConfig: any = {}
    const sortField = String(sortBy === 'date' ? 'invoice.date' : sortBy)
    sortConfig[sortField] = String(sortOrder) === 'asc' ? 1 : -1

    // Execute query with pagination
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const [invoices, totalCount] = await Promise.all([
      Invoice.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Invoice.countDocuments(query)
    ])

    res.json({
      success: true,
      data: {
        data: invoices,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      message: 'Invoices retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
})

// GET /invoices/:id - Get single invoice
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid invoice ID format', 400)
    }
    
    const invoice = await Invoice.findById(id)

    if (!invoice) {
      throw createError('Invoice not found', 404)
    }

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
})

// POST /invoices - Create new invoice
router.post('/', async (req, res, next) => {
  try {
    const { fileId, fileName, vendor, invoice } = req.body

    // Validate required fields
    if (!fileId || !fileName || !vendor || !invoice) {
      throw createError('Missing required fields: fileId, fileName, vendor, invoice', 400)
    }

    // Create new invoice
    const newInvoice = new Invoice({
      fileId,
      fileName,
      vendor,
      invoice
    })

    const savedInvoice = await newInvoice.save()

    res.status(201).json({
      success: true,
      data: savedInvoice,
      message: 'Invoice created successfully',
    })
  } catch (error) {
    next(error)
  }
})

// PUT /invoices/:id - Update invoice
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid invoice ID format', 400)
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedInvoice) {
      throw createError('Invoice not found', 404)
    }

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully',
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid invoice ID format', 400)
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(id)

    if (!deletedInvoice) {
      throw createError('Invoice not found', 404)
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    })
  } catch (error) {
    next(error)
  }
})

export default router
