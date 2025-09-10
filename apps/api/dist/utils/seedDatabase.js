"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const Invoice_1 = __importDefault(require("../models/Invoice"));
async function seedDatabase() {
    try {
        // Check if data already exists
        const existingCount = await Invoice_1.default.countDocuments();
        if (existingCount > 0) {
            console.log(`📊 Database already has ${existingCount} invoices, skipping seed`);
            return;
        }
        console.log('🌱 Seeding database with sample invoices...');
        const sampleInvoices = [
            {
                fileId: 'file_sample_001',
                fileName: 'invoice-abc-corp-001.pdf',
                vendor: {
                    name: 'ABC Corporation',
                    address: '456 Corporate Blvd, Business City, BC 54321',
                    taxId: 'TAX-987654321',
                },
                invoice: {
                    number: 'INV-2024-001',
                    date: '2024-09-01',
                    currency: 'USD',
                    subtotal: 2000.00,
                    taxPercent: 10.0,
                    total: 2200.00,
                    poNumber: 'PO-2024-001',
                    poDate: '2024-08-25',
                    lineItems: [
                        {
                            description: 'Software License - Annual Subscription',
                            unitPrice: 500.00,
                            quantity: 4,
                            total: 2000.00,
                        },
                    ],
                },
            },
            {
                fileId: 'file_sample_002',
                fileName: 'consulting-xyz-services.pdf',
                vendor: {
                    name: 'XYZ Services Ltd',
                    address: '789 Service Ave, Service Town, ST 98765',
                },
                invoice: {
                    number: 'INV-2024-002',
                    date: '2024-09-05',
                    currency: 'USD',
                    subtotal: 750.00,
                    taxPercent: 8.5,
                    total: 813.75,
                    lineItems: [
                        {
                            description: 'Consulting Services - Web Development',
                            unitPrice: 150.00,
                            quantity: 5,
                            total: 750.00,
                        },
                    ],
                },
            },
            {
                fileId: 'file_sample_003',
                fileName: 'tech-consulting-group.pdf',
                vendor: {
                    name: 'Tech Consulting Group',
                    address: '123 Tech Street, Innovation District, ID 12345',
                    taxId: 'TAX-456789123',
                },
                invoice: {
                    number: 'TCG-2024-003',
                    date: '2024-09-08',
                    currency: 'USD',
                    subtotal: 4500.00,
                    taxPercent: 10.0,
                    total: 4950.00,
                    poNumber: 'PO-2024-003',
                    poDate: '2024-09-01',
                    lineItems: [
                        {
                            description: 'System Architecture Design',
                            unitPrice: 200.00,
                            quantity: 15,
                            total: 3000.00,
                        },
                        {
                            description: 'Database Migration Services',
                            unitPrice: 150.00,
                            quantity: 10,
                            total: 1500.00,
                        },
                    ],
                },
            },
            {
                fileId: 'file_sample_004',
                fileName: 'cloud-solutions-inc.pdf',
                vendor: {
                    name: 'Cloud Solutions Inc',
                    address: '999 Cloud Avenue, Sky City, SC 99999',
                    taxId: 'TAX-999888777',
                },
                invoice: {
                    number: 'CS-2024-004',
                    date: '2024-09-10',
                    currency: 'USD',
                    subtotal: 1200.00,
                    taxPercent: 7.5,
                    total: 1290.00,
                    lineItems: [
                        {
                            description: 'Cloud Hosting - Premium Plan',
                            unitPrice: 100.00,
                            quantity: 12,
                            total: 1200.00,
                        },
                    ],
                },
            }
        ];
        const insertedInvoices = await Invoice_1.default.insertMany(sampleInvoices);
        console.log(`✅ Successfully seeded ${insertedInvoices.length} sample invoices`);
        return insertedInvoices;
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}
//# sourceMappingURL=seedDatabase.js.map