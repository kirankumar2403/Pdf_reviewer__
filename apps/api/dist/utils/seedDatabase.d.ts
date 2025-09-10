export declare function seedDatabase(): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../models/Invoice").InvoiceDocument> & import("../models/Invoice").InvoiceDocument & {
    _id: import("mongoose").Types.ObjectId;
}, Omit<{
    fileId: string;
    fileName: string;
    vendor: {
        name: string;
        address: string;
        taxId: string;
    };
    invoice: {
        number: string;
        date: string;
        currency: string;
        subtotal: number;
        taxPercent: number;
        total: number;
        poNumber: string;
        poDate: string;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
    };
} | {
    fileId: string;
    fileName: string;
    vendor: {
        name: string;
        address: string;
        taxId?: undefined;
    };
    invoice: {
        number: string;
        date: string;
        currency: string;
        subtotal: number;
        taxPercent: number;
        total: number;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        poNumber?: undefined;
        poDate?: undefined;
    };
} | {
    fileId: string;
    fileName: string;
    vendor: {
        name: string;
        address: string;
        taxId: string;
    };
    invoice: {
        number: string;
        date: string;
        currency: string;
        subtotal: number;
        taxPercent: number;
        total: number;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        poNumber?: undefined;
        poDate?: undefined;
    };
}, "_id">>[] | undefined>;
//# sourceMappingURL=seedDatabase.d.ts.map