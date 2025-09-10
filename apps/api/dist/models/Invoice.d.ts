import mongoose, { Document } from 'mongoose';
import type { Invoice as IInvoice } from '@pdf-dashboard/types';
export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {
}
export declare const Invoice: mongoose.Model<InvoiceDocument, {}, {}, {}, mongoose.Document<unknown, {}, InvoiceDocument> & InvoiceDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Invoice;
//# sourceMappingURL=Invoice.d.ts.map