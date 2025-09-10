import axios from 'axios'
import type { 
  ApiResponse, 
  UploadResponse, 
  ExtractResponse, 
  Invoice, 
  PaginatedResponse,
  SearchParams 
} from '@pdf-dashboard/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://pdf-reviewer-api.vercel.app/'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// File upload
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<ApiResponse<UploadResponse>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Upload failed')
  }
  
  return response.data.data!
}

// AI extraction
export async function extractInvoiceData(
  fileId: string, 
  provider: 'gemini' | 'groq' = 'gemini'
): Promise<ExtractResponse> {
  const response = await api.post<ApiResponse<ExtractResponse>>('/extract', {
    fileId,
    provider,
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Extraction failed')
  }
  
  return response.data.data!
}

// Invoice CRUD operations
export async function getInvoices(params?: SearchParams): Promise<PaginatedResponse<Invoice>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>('/invoices', {
    params,
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch invoices')
  }
  
  return response.data.data!
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch invoice')
  }
  
  return response.data.data!
}

export async function createInvoice(invoice: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const response = await api.post<ApiResponse<Invoice>>('/invoices', invoice)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to create invoice')
  }
  
  return response.data.data!
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  const response = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, invoice)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update invoice')
  }
  
  return response.data.data!
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(`/invoices/${id}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete invoice')
  }
}
