import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Invoice, Vendor, InvoiceData, LineItem } from '@pdf-dashboard/types';
import { Building2, Receipt, Package, AlertCircle, CheckCircle2, Edit3, Save } from 'lucide-react';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSave: (invoice: Invoice) => void;
}

export default function InvoiceForm({ invoice, onSave }: InvoiceFormProps) {
  const [formData, setFormData] = useState<Invoice | null>(invoice);
  const [isEditing, setIsEditing] = useState(false);

  // Update formData when invoice prop changes
  useEffect(() => {
    console.log('📋 InvoiceForm received new props:', invoice);
    setFormData(invoice);
    setIsEditing(false); // Reset editing state when new data arrives
  }, [invoice]);

  if (!formData) {
    return (
      <Card className="h-full border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Invoice Data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">No Invoice Data</h3>
              <p className="text-muted-foreground max-w-md">
                No invoice data available. Use "Extract with AI" to process the PDF and populate this form automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleVendorChange = (field: keyof Vendor, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        vendor: {
          ...prev.vendor,
          [field]: value
        }
      };
    });
  };

  const handleInvoiceChange = (field: keyof InvoiceData, value: string | number) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          [field]: value
        }
      };
    });
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newLineItems = [...prev.invoice.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: field === 'description' ? value : Number(value)
      };
      
      // Recalculate total if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? Number(value) : newLineItems[index].quantity;
        const unitPrice = field === 'unitPrice' ? Number(value) : newLineItems[index].unitPrice;
        newLineItems[index].total = quantity * unitPrice;
      }
      
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          lineItems: newLineItems
        }
      };
    });
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  return (
    <Card className="h-full overflow-auto shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Invoice Data</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? (
                <span className="flex items-center gap-1 text-orange-600">
                  <Edit3 className="h-3 w-3" />
                  Editing mode - Make your changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Ready to save or edit
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={isEditing ? "outline" : "secondary"} 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Vendor Information */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Vendor Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </label>
              <Input 
                value={formData.vendor.name || ''} 
                onChange={(e) => handleVendorChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder={!formData.vendor.name ? "Not extracted" : ""}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Tax ID
              </label>
              <Input 
                value={formData.vendor.taxId || ''} 
                onChange={(e) => handleVendorChange('taxId', e.target.value)}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business Address
              </label>
              <Input 
                value={formData.vendor.address || ''} 
                onChange={(e) => handleVendorChange('address', e.target.value)}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Receipt className="h-5 w-5 text-indigo-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Invoice Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">#️⃣ Invoice Number</label>
              <Input 
                value={formData.invoice.number || ''} 
                onChange={(e) => handleInvoiceChange('number', e.target.value)}
                disabled={!isEditing}
                placeholder={!formData.invoice.number ? "Not extracted" : ""}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">📅 Invoice Date</label>
              <Input 
                type="date"
                value={formData.invoice.date || ''} 
                onChange={(e) => handleInvoiceChange('date', e.target.value)}
                disabled={!isEditing}
                placeholder={!formData.invoice.date ? "Not extracted" : ""}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">💰 Currency</label>
              <Input 
                value={formData.invoice.currency || ''} 
                onChange={(e) => handleInvoiceChange('currency', e.target.value)}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">💵 Subtotal</label>
              <Input 
                type="number"
                value={formData.invoice.subtotal || ''} 
                onChange={(e) => handleInvoiceChange('subtotal', Number(e.target.value))}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">📈 Tax %</label>
              <Input 
                type="number"
                value={formData.invoice.taxPercent || ''} 
                onChange={(e) => handleInvoiceChange('taxPercent', Number(e.target.value))}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                💰 <span className="font-semibold">Total Amount</span>
              </label>
              <Input 
                type="number"
                value={formData.invoice.total || ''} 
                onChange={(e) => handleInvoiceChange('total', Number(e.target.value))}
                disabled={!isEditing}
                className={`transition-all font-semibold ${isEditing ? 'border-green-300 focus:border-green-500' : 'bg-green-50 text-green-700'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">📝 PO Number</label>
              <Input 
                value={formData.invoice.poNumber || ''} 
                onChange={(e) => handleInvoiceChange('poNumber', e.target.value)}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">📅 PO Date</label>
              <Input 
                type="date"
                value={formData.invoice.poDate || ''} 
                onChange={(e) => handleInvoiceChange('poDate', e.target.value)}
                disabled={!isEditing}
                className={`transition-all ${isEditing ? 'border-blue-300 focus:border-blue-500' : 'bg-gray-50'}`}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Package className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Line Items</h3>
          </div>
          <div className="space-y-4">
            {formData.invoice.lineItems.length > 0 ? (
              formData.invoice.lineItems.map((item, index) => (
                <div key={index} className="bg-white border border-emerald-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                      Item {index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        📝 Description
                      </label>
                      <Input 
                        value={item.description} 
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        disabled={!isEditing}
                        className={`transition-all ${isEditing ? 'border-emerald-300 focus:border-emerald-500' : 'bg-gray-50'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        💵 Unit Price
                      </label>
                      <Input 
                        type="number"
                        value={item.unitPrice} 
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', Number(e.target.value))}
                        disabled={!isEditing}
                        className={`transition-all ${isEditing ? 'border-emerald-300 focus:border-emerald-500' : 'bg-gray-50'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        🔢 Quantity
                      </label>
                      <Input 
                        type="number"
                        value={item.quantity} 
                        onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                        disabled={!isEditing}
                        className={`transition-all ${isEditing ? 'border-emerald-300 focus:border-emerald-500' : 'bg-gray-50'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        💰 Total
                      </label>
                      <Input 
                        type="number"
                        value={item.total} 
                        onChange={(e) => handleLineItemChange(index, 'total', Number(e.target.value))}
                        disabled={!isEditing}
                        className={`transition-all font-semibold ${isEditing ? 'border-emerald-300 focus:border-emerald-500' : 'bg-emerald-50 text-emerald-700'}`}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-emerald-200 rounded-lg p-8 text-center">
                <Package className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-600 font-medium mb-1">No Line Items</p>
                <p className="text-emerald-500 text-sm">No line items were extracted from the invoice</p>
              </div>
            )}
          </div>
        </div>

        {/* Raw Text Display - when AI processing fails */}
        {formData.invoice.rawText && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Receipt className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  📄 Extracted Text
                </h3>
                {formData.extractionError && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      AI processing failed - showing raw text
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
              <div className="max-h-80 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-slate-700 leading-relaxed">
                  {formData.invoice.rawText}
                </pre>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <AlertCircle className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Manual Entry:</strong> This is the raw text extracted from your PDF. You can manually copy information from here to fill in the fields above.
                  </p>
                </div>
                {formData.extractionError && (
                  <div className="flex items-start gap-2 mt-2">
                    <div className="p-1 bg-amber-100 rounded">
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                    </div>
                    <p className="text-xs text-amber-700">
                      <strong>Error:</strong> {formData.extractionError}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Extraction Status */}
        {formData.extractionError && !formData.invoice.rawText && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 border-l-4 border-l-red-500 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-red-800">Extraction Issue</h4>
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    Needs Attention
                  </span>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">{formData.extractionError}</p>
                <div className="mt-3 p-3 bg-white border border-red-200 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <strong>What to do:</strong> Please manually fill in the invoice fields above, or try re-uploading the PDF if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}