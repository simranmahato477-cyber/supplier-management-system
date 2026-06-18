import express from 'express';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { supplierId, status, search } = req.query;
    const query = {};
    if (supplierId) query.supplierId = supplierId;
    if (status) query.status = status;
    if (search) query.itemName = { $regex: search, $options: 'i' };
    const items = await Item.find(query).populate('supplierId', 'supplierName companyName').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { itemName, supplierId, unit, purchaseRate } = req.body;
    if (!itemName || !supplierId || !unit || Number(purchaseRate) <= 0) {
      return res.status(400).json({ message: 'Item name, supplier, unit and valid purchase rate are required' });
    }
    const item = await Item.create(req.body);
    const populated = await Item.findById(item._id).populate('supplierId', 'supplierName companyName');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('supplierId', 'supplierName companyName');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
