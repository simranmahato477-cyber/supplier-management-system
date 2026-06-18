import mongoose from 'mongoose';

const supplierCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

const SupplierCategory = mongoose.model('SupplierCategory', supplierCategorySchema);
export default SupplierCategory;
