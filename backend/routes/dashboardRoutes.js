import express from 'express';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const [totalSuppliers, activeSuppliers, inactiveSuppliers, totalOrders, pendingOrders, purchaseAgg, paymentAgg, recentSuppliers, recentOrders] = await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ status: 'ACTIVE' }),
      Supplier.countDocuments({ status: 'INACTIVE' }),
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: { $in: ['DRAFT', 'ORDERED'] } }),
      PurchaseOrder.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Payment.aggregate([{ $group: { _id: null, paid: { $sum: '$paidAmount' }, due: { $sum: '$dueAmount' } } }]),
      Supplier.find().sort({ createdAt: -1 }).limit(5).populate('categoryId', 'name'),
      PurchaseOrder.find().sort({ createdAt: -1 }).limit(5).populate('supplierId', 'supplierName companyName')
    ]);

    res.json({
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalOrders,
      pendingOrders,
      totalPurchaseAmount: purchaseAgg[0]?.total || 0,
      totalPaidAmount: paymentAgg[0]?.paid || 0,
      totalDueAmount: paymentAgg[0]?.due || 0,
      recentSuppliers,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

export default router;
