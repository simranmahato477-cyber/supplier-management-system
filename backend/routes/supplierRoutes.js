import express from 'express';
import Supplier from '../models/Supplier.js';
import { protect } from '../middleware/authMiddleware.js';
import { normalizeEmpty } from '../utils/helpers.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const suppliers = await Supplier.find(query).populate('categoryId', 'name').sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('categoryId', 'name');
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body, panVatNumber: normalizeEmpty(req.body.panVatNumber), email: normalizeEmpty(req.body.email) };
    if (!payload.supplierName || !payload.phone || !payload.categoryId) {
      return res.status(400).json({ message: 'Supplier name, phone and category are required' });
    }
    const supplier = await Supplier.create(payload);
    const populated = await Supplier.findById(supplier._id).populate('categoryId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = { ...req.body, panVatNumber: normalizeEmpty(req.body.panVatNumber), email: normalizeEmpty(req.body.email) };
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('categoryId', 'name');
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
