# PDF Review Dashboard

A comprehensive monorepo application for uploading, reviewing, and managing invoices/bills with AI-powered data extraction.

## 🏗 Project Structure

```
pdf-review-dashboard/
├── apps/
│   ├── web/                    # Next.js frontend application
│   └── api/                    # Node.js REST API
├── packages/
│   └── types/                  # Shared TypeScript types
├── turbo.json                  # Turborepo configuration
├── package.json               # Root package.json
└── README.md
```

## 🚀 Tech Stack

### Frontend (apps/web)
- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **pdf.js** for PDF rendering
- **React Hook Form** with Zod validation

### Backend (apps/api)
- **Node.js** with Express
- **TypeScript**
- **MongoDB Atlas** database
- **Mongoose** ODM
- **AI Integration**: Gemini and Groq APIs
- **File Storage**: Vercel Blob or MongoDB GridFS

### Shared
- **Turborepo** monorepo management
- **Shared TypeScript types**

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gemini API key or Groq API key

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Create `.env` files in both apps:

**apps/api/.env**
```env
# Database
MONGODB_URI=mongodb+srv://23211a05l8:<password>@cluster0.bfdje2e.mongodb.net/pdf-dashboard

# AI APIs
GEMINI_API_KEY=AIzaSyAblDpCR4YAt9z9Dg96txeSTjEXBV5iX3k
GROQ_API_KEY=your_groq_api_key

# File Storage (choose one)
VERCEL_BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
# OR use MongoDB GridFS (no additional config needed)

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

### Development

1. **Build shared types**
```bash
cd packages/types
npm run build
```

2. **Start development servers**
```bash
# Start both apps concurrently
npm run dev

# Or start individually
cd apps/api && npm run dev    # API server on :3001
cd apps/web && npm run dev    # Web app on :3000
```

## 📋 Features

### ✅ Completed
- [x] Monorepo setup with Turborepo
- [x] Shared TypeScript types package
- [x] Next.js web application with shadcn/ui
- [x] Node.js API with TypeScript and Express
- [x] Basic project structure and configuration

### 🚧 In Progress
- [ ] File upload and storage system
- [ ] AI extraction with Gemini/Groq APIs
- [ ] MongoDB Atlas integration and schemas
- [ ] CRUD API endpoints for invoices
- [ ] PDF viewer component with pdf.js
- [ ] Invoice form and editing interface
- [ ] Upload and invoice list pages
- [ ] Vercel deployment configuration

## 🎯 Core Functionality

1. **PDF Upload**: Drag & drop PDF files (up to 25MB)
2. **AI Extraction**: Extract structured data using Gemini or Groq
3. **Data Review**: Edit and validate extracted invoice information
4. **Storage**: Save invoice records to MongoDB
5. **Management**: Search, filter, and manage saved invoices

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload PDF file |
| POST | `/extract` | Extract data with AI |
| GET | `/invoices` | List invoices with search |
| GET | `/invoices/:id` | Get single invoice |
| POST | `/invoices` | Create invoice record |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |
| GET | `/health` | Health check |

## 🌐 Deployment

The application is designed to be deployed on Vercel:
- **Web App**: https://your-project-web.vercel.app
- **API**: https://your-project-api.vercel.app

## 📁 Data Structure

```typescript
interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
  createdAt: string;
  updatedAt?: string;
}
```

## 🤝 Contributing

1. Make changes in the appropriate app or package
2. Follow the existing code style and patterns
3. Test your changes thoroughly
4. Update documentation as needed

## 📝 License

MIT License - see LICENSE file for details
