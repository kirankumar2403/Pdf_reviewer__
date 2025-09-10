'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Eye, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Invoice } from '@pdf-dashboard/types'
import { getInvoices, deleteInvoice, updateInvoice } from '@/lib/api'
import InvoiceForm from '@/components/InvoiceForm'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // Load invoices on component mount
  useEffect(() => {
    loadInvoices()
  }, [])

  // Filter invoices based on search term
  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInvoices(filtered)
  }, [searchTerm, invoices])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getInvoices()
      setInvoices(response.data)
      console.log('✅ Loaded invoices:', response.data)
    } catch (err) {
      console.error('❌ Error loading invoices:', err)
      setError('Failed to load invoices. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleView = (id: string) => {
    // For now, we'll show an alert. In the future, this could open a PDF viewer
    const invoice = invoices.find(inv => inv._id === id)
    if (invoice) {
      alert(`Viewing invoice ${invoice.invoice.number} from ${invoice.vendor.name}\n\nThis would typically open a PDF viewer or detailed view.`)
    }
  }

  const handleEdit = (id: string) => {
    const invoice = invoices.find(inv => inv._id === id)
    if (invoice) {
      setEditingInvoice(invoice)
    }
  }

  const handleDelete = async (id: string) => {
    const invoice = invoices.find(inv => inv._id === id)
    if (!invoice) return
    
    const confirmed = confirm(`Are you sure you want to delete invoice "${invoice.invoice.number}" from ${invoice.vendor.name}?\n\nThis action cannot be undone.`)
    
    if (confirmed) {
      try {
        await deleteInvoice(id)
        // Remove from local state
        setInvoices(prev => prev.filter(invoice => invoice._id !== id))
        console.log('✅ Invoice deleted successfully')
        alert('Invoice deleted successfully!')
      } catch (error) {
        console.error('❌ Error deleting invoice:', error)
        alert('Failed to delete invoice. Please try again.')
      }
    }
  }

  const handleSaveEditedInvoice = async (updatedInvoice: Invoice) => {
    try {
      if (!updatedInvoice._id) {
        throw new Error('Invoice ID is required for update')
      }
      
      // Update the invoice via API
      const savedInvoice = await updateInvoice(updatedInvoice._id, {
        vendor: updatedInvoice.vendor,
        invoice: updatedInvoice.invoice
      })
      
      // Update local state with the saved invoice
      setInvoices(prev => prev.map(inv => 
        inv._id === savedInvoice._id ? savedInvoice : inv
      ))
      
      setEditingInvoice(null)
      alert('Invoice updated successfully!')
      console.log('✅ Invoice updated:', savedInvoice)
    } catch (error) {
      console.error('❌ Error updating invoice:', error)
      alert('Failed to update invoice. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingInvoice(null)
  }

  // Show edit modal if editing
  if (editingInvoice) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button for Edit Page */}
        <div className="flex items-center gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={handleCancelEdit}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
            <span className="mx-2">/</span>
            <a href="/invoices" className="hover:text-blue-600 transition-colors">Invoices</a>
            <span className="mx-2">/</span>
            <span>Edit Invoice</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
            <p className="text-muted-foreground mt-2">
              Editing invoice {editingInvoice.invoice.number} from {editingInvoice.vendor.name}
            </p>
          </div>
        </div>
        
        <InvoiceForm 
          invoice={editingInvoice}
          onSave={handleSaveEditedInvoice}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <span className="mx-2">/</span>
          <span>Invoices</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Manage and review your uploaded invoices
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadInvoices} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Refresh
          </Button>
          <Button asChild>
            <a href="/upload">Upload New Invoice</a>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices by vendor name, invoice number, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredInvoices.length} of {invoices.length} invoices
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️</div>
              <h3 className="text-lg font-medium mb-2 text-red-800">Error Loading Invoices</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadInvoices} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin mx-auto" />
              <h3 className="text-lg font-medium mb-2">Loading Invoices...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your invoices.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm 
                    ? `No invoices match your search "${searchTerm}"`
                    : "You haven't uploaded any invoices yet"
                  }
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <a href="/upload">Upload Your First Invoice</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice._id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-lg">{invoice.vendor.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Processed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Invoice #:</span> {invoice.invoice.number}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(invoice.invoice.date)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {formatCurrency(invoice.invoice.total?? 0)}
                        </div>
                        <div>
                          <span className="font-medium">File:</span> {invoice.fileName}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Address:</span> {invoice.vendor.address}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Uploaded {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => invoice._id && handleView(invoice._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(invoice._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invoice._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && filteredInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Overview of your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredInvoices.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    filteredInvoices.reduce((sum, inv) => sum + (inv.invoice.total || 0), 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(filteredInvoices.map(inv => inv.vendor.name)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Vendors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
