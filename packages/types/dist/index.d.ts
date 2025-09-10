export interface LineItem {
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
}
export interface Vendor {
    name: string;
    address?: string;
    taxId?: string;
}
export interface InvoiceData {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
    rawText?: string;
}
export interface Invoice {
    _id?: string;
    fileId: string;
    fileName: string;
    vendor: Vendor;
    invoice: InvoiceData;
    createdAt: string;
    updatedAt?: string;
    extractionError?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface UploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    uploadUrl?: string;
}
export interface ExtractResponse {
    invoice: Invoice;
    confidence?: number;
}
export interface SearchParams {
    q?: string;
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'vendor' | 'total';
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface FileUpload {
    file: File;
    progress?: number;
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}
export interface ExtractionOptions {
    provider: 'gemini' | 'groq';
    model?: string;
    temperature?: number;
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface FormState {
    errors: ValidationError[];
    isValid: boolean;
    isDirty: boolean;
}
