import express from 'express';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().populate('categoryId', 'name').sort({ createdAt: -1 });
    const orders = await PurchaseOrder.find().populate('supplierId', 'supplierName companyName').sort({ createdAt: -1 });
    const payments = await Payment.find().populate('supplierId', 'supplierName companyName').populate('purchaseOrderId', 'poNumber').sort({ createdAt: -1 });
    const duePayments = payments.filter((payment) => payment.dueAmount > 0);

    const supplierWisePurchase = await PurchaseOrder.aggregate([
      { $group: { _id: '$supplierId', totalPurchase: { $sum: '$grandTotal' }, orderCount: { $sum: 1 } } },
      { $sort: { totalPurchase: -1 } }
    ]);

    const populatedSummary = await Supplier.populate(supplierWisePurchase, { path: '_id', select: 'supplierName companyName phone' });

    res.json({
      suppliers,
      orders,
      payments,
      duePayments,
      supplierWisePurchase: populatedSummary
    });
  } catch (error) {
    next(error);
  }
});

export default router;
