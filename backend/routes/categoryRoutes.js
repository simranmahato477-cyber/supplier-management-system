import express from 'express';
import SupplierCategory from '../models/SupplierCategory.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const categories = await SupplierCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = await SupplierCategory.create({ name, description, status });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const category = await SupplierCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const category = await SupplierCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
