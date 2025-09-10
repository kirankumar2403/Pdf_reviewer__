'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, AlertCircle, Sparkles, Zap, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PdfViewer from '@/components/PdfViewer'
import InvoiceForm from '@/components/InvoiceForm'
import { Invoice } from '@pdf-dashboard/types'
import { extractInvoiceData, uploadFile, createInvoice } from '@/lib/api'


export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<Invoice | null>(null)
  const [extracting, setExtracting] = useState(false)
  // Using Gemini as the default and only AI provider
  const aiProvider = 'gemini'

  // Debug useEffect to track extractedData changes
  useEffect(() => {
    console.log('🔄 ExtractedData state changed:', extractedData);
    if (extractedData) {
      console.log('📊 Vendor:', extractedData.vendor);
      console.log('📄 Invoice:', extractedData.invoice);
    }
  }, [extractedData]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    )
    setFiles(prev => [...prev, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      )
      setFiles(prev => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    if (currentFile && currentFile === files[index]) {
      setCurrentFile(null)
      setExtractedData(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    // Simulate upload process
    setTimeout(() => {
      setUploading(false)
      // Select the first file for viewing
      if (files.length > 0 && !currentFile) {
        setCurrentFile(files[0])
      }
    }, 1000)
  }

  const viewFile = (file: File) => {
    setCurrentFile(file)
    setExtractedData(null)
  }

  const extractData = async () => {
    if (!currentFile) return;
  
    setExtracting(true);
    try {
      // First upload the file to get a real fileId
      const uploadResponse = await uploadFile(currentFile);
      const fileId = uploadResponse.fileId;
      
      // Then call the extraction API with the real fileId
      try {
        const response = await extractInvoiceData(fileId, aiProvider);
        console.log('Full extraction response:', response); // Debug log
        console.log('Invoice data from response:', response.invoice); // Debug log
        
        // Make sure we're setting the invoice data correctly
        if (response && response.invoice) {
          setExtractedData(response.invoice);
          console.log('✅ Successfully set extracted data');
        } else {
          console.error('❌ Invalid response structure:', response);
          alert('Invalid response from extraction API.');
        }
      } catch (error) {
        console.error('Error extracting data:', error);
        alert('Failed to extract data. Please try again.');
      } finally {
        setExtracting(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setExtracting(false);
    }
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      console.log('Saving invoice to database:', invoice);
      
      // Create the invoice in the database
      const savedInvoice = await createInvoice({
        fileId: invoice.fileId,
        fileName: invoice.fileName,
        vendor: invoice.vendor,
        invoice: invoice.invoice
      });
      
      console.log('✅ Invoice saved successfully:', savedInvoice);
      alert('Invoice saved successfully! You can view it in the invoices list.');
      
      // Optionally redirect to invoices page or reset the form
      // window.location.href = '/invoices';
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
          <span>Upload PDF</span>
        </div>
      </div>
      
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload PDF Invoice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your PDF invoices and our AI will automatically extract and structure all the important data
        </p>
        <div className="flex justify-center items-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4" />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span>Accurate</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            <Sparkles className="h-4 w-4" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {!currentFile ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Drag and drop PDF files here or click to select files (max 25MB per file)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop PDF files here</p>
                  <p className="text-muted-foreground">or</p>
                  <div>
                    <Button variant="outline" asChild>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Only PDF files up to 25MB are supported</span>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewFile(file)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {files.length > 0 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    size="lg"
                  >
                    {uploading ? 'Processing...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Upload PDF Invoice</p>
                    <p className="text-sm text-muted-foreground">
                      Select or drag & drop your PDF invoice files
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">AI Data Extraction</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI automatically extracts vendor info, amounts, and line items
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Review & Save</p>
                    <p className="text-sm text-muted-foreground">
                      Review the extracted data, make edits if needed, and save to your records
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{currentFile.name}</h2>
            <Button variant="outline" onClick={() => {
              setCurrentFile(null)
              setExtractedData(null)
            }}>
              Back to Upload
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Viewer */}
            <Card className="h-[800px] overflow-hidden">
              <CardHeader>
                <CardTitle>PDF Viewer</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <PdfViewer file={currentFile} />
              </CardContent>
            </Card>

            {/* Extraction Panel */}
            <div className="space-y-6">
              <Card className="border-l-4 border-l-blue-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">AI Data Extraction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white mx-auto w-fit">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-6 w-6" />
                          <div className="text-left">
                            <div className="font-semibold text-lg">Gemini AI</div>
                            <div className="text-blue-100 text-sm">Powered by Google</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Advanced AI technology for accurate invoice data extraction
                      </p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" 
                      size="lg" 
                      onClick={extractData}
                      disabled={extracting}
                    >
                      {extracting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Extracting Data...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Extract with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Form */}
              <div className="h-[600px]">
                <InvoiceForm 
                  key={extractedData ? extractedData.fileId : 'no-data'}
                  invoice={extractedData} 
                  onSave={handleSaveInvoice} 
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
