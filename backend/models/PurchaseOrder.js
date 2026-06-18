import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, trim: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    orderDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date },
    items: { type: [purchaseOrderItemSchema], required: true },
    grandTotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'], default: 'DRAFT' },
    remarks: { type: String, trim: true }
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;
