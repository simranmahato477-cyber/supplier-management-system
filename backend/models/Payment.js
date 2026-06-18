import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Esewa/Khalti', 'Other'], required: true },
    paymentDate: { type: Date, required: true },
    status: { type: String, enum: ['PAID', 'PARTIAL', 'UNPAID'], default: 'UNPAID' },
    remarks: { type: String, trim: true }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
