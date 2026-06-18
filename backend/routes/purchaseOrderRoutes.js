import express from 'express';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';
import { getNextPONumber } from '../utils/helpers.js';

const router = express.Router();
router.use(protect);

const buildItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

  const builtItems = [];
  for (const line of items) {
    const quantity = Number(line.quantity || 0);
    const rate = Number(line.rate || 0);
    if (!line.itemId || quantity <= 0 || rate <= 0) {
      throw new Error('Each item must have item, quantity greater than 0 and rate greater than 0');
    }
    const itemDoc = await Item.findById(line.itemId);
    if (!itemDoc) throw new Error('Selected item not found');
    builtItems.push({
      itemId: itemDoc._id,
      itemName: itemDoc.itemName,
      quantity,
      rate,
      total: quantity * rate
    });
  }
  return builtItems;
};

router.get('/', async (req, res, next) => {
  try {
    const { status, supplierId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    const orders = await PurchaseOrder.find(query)
      .populate('supplierId', 'supplierName companyName phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate('supplierId', 'supplierName companyName phone');
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { supplierId, orderDate, expectedDeliveryDate, status, remarks } = req.body;
    if (!supplierId || !orderDate) return res.status(400).json({ message: 'Supplier and order date are required' });
    const items = await buildItems(req.body.items);
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
    const order = await PurchaseOrder.create({
      poNumber: req.body.poNumber || getNextPONumber(),
      supplierId,
      orderDate,
      expectedDeliveryDate,
      items,
      grandTotal,
      status,
      remarks
    });
    const populated = await PurchaseOrder.findById(order._id).populate('supplierId', 'supplierName companyName phone');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.body.items) {
      updateData.items = await buildItems(req.body.items);
      updateData.grandTotal = updateData.items.reduce((sum, item) => sum + item.total, 0);
    }
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('supplierId', 'supplierName companyName phone');
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
