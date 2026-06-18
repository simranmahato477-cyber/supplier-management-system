import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    panVatNumber: { type: String, trim: true, unique: true, sparse: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierCategory', required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
