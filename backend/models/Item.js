import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    category: { type: String, trim: true },
    unit: { type: String, required: true, trim: true },
    purchaseRate: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
