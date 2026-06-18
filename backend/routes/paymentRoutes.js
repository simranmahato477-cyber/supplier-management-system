import express from 'express';
import Payment from '../models/Payment.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { protect } from '../middleware/authMiddleware.js';
import { getPaymentStatus } from '../utils/helpers.js';

const router = express.Router();
router.use(protect);

const buildPaymentPayload = async (body) => {
  const { purchaseOrderId, paidAmount, paymentMethod, paymentDate, remarks } = body;
  if (!purchaseOrderId || paidAmount === undefined || !paymentMethod || !paymentDate) {
    throw new Error('Purchase order, paid amount, payment method and payment date are required');
  }
  const order = await PurchaseOrder.findById(purchaseOrderId);
  if (!order) throw new Error('Purchase order not found');
  const totalAmount = Number(order.grandTotal || 0);
  const paid = Number(paidAmount || 0);
  if (paid < 0) throw new Error('Paid amount cannot be negative');
  if (paid > totalAmount) throw new Error('Paid amount cannot be greater than total amount');
  const dueAmount = totalAmount - paid;
  return {
    supplierId: order.supplierId,
    purchaseOrderId: order._id,
    totalAmount,
    paidAmount: paid,
    dueAmount,
    paymentMethod,
    paymentDate,
    status: getPaymentStatus(totalAmount, paid),
    remarks
  };
};

router.get('/', async (req, res, next) => {
  try {
    const { supplierId, status } = req.query;
    const query = {};
    if (supplierId) query.supplierId = supplierId;
    if (status) query.status = status;
    const payments = await Payment.find(query)
      .populate('supplierId', 'supplierName companyName')
      .populate('purchaseOrderId', 'poNumber grandTotal status')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = await buildPaymentPayload(req.body);
    const payment = await Payment.create(payload);
    const populated = await Payment.findById(payment._id)
      .populate('supplierId', 'supplierName companyName')
      .populate('purchaseOrderId', 'poNumber grandTotal status');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = await buildPaymentPayload(req.body);
    const payment = await Payment.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
      .populate('supplierId', 'supplierName companyName')
      .populate('purchaseOrderId', 'poNumber grandTotal status');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
