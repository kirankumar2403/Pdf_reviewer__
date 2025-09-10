import Link from 'next/link'
import { Upload, FileText, Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to PDF Reviewer
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Professional invoice management and document processing platform designed for efficiency and accuracy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Link 
          href="/upload" 
          className="group block p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full group-hover:shadow-lg transition-all">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Upload PDF</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Upload and process invoice PDFs with intelligent data extraction
            </p>
          </div>
        </Link>

        <Link 
          href="/invoices" 
          className="group block p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full group-hover:shadow-lg transition-all">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">View Invoices</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Browse, edit, and manage your processed invoice database
            </p>
          </div>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h3 className="text-xl font-semibold">Getting Started</h3>
        <div className="space-y-2 text-muted-foreground">
          <p>1. Upload a PDF invoice using the upload page</p>
          <p>2. Use AI extraction to automatically parse invoice data</p>
          <p>3. Review and edit the extracted information</p>
          <p>4. Save and manage your invoice records</p>
        </div>
      </div>
    </div>
  )
}
