import dotenv from 'dotenv';
import connectDB from './config/db.js';
import SupplierCategory from './models/SupplierCategory.js';
import Supplier from './models/Supplier.js';
import Item from './models/Item.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import Payment from './models/Payment.js';
import { getPaymentStatus } from './utils/helpers.js';

dotenv.config();
await connectDB();

const seed = async () => {
  await Payment.deleteMany();
  await PurchaseOrder.deleteMany();
  await Item.deleteMany();
  await Supplier.deleteMany();
  await SupplierCategory.deleteMany();

  const categories = await SupplierCategory.insertMany([
    { name: 'Medicine Supplier', description: 'Supplier for pharmacy and medical items' },
    { name: 'Stationery Supplier', description: 'Supplier for office stationery' },
    { name: 'IT Equipment Supplier', description: 'Supplier for computers and accessories' }
  ]);

  const suppliers = await Supplier.insertMany([
    {
      supplierName: 'Everest Medical Suppliers',
      companyName: 'Everest Medical Pvt. Ltd.',
      contactPerson: 'Ram Sharma',
      phone: '9800000001',
      email: 'everest@example.com',
      address: 'Kathmandu',
      panVatNumber: '600001111',
      categoryId: categories[0]._id,
      status: 'ACTIVE',
      notes: 'Regular medicine supplier'
    },
    {
      supplierName: 'City Stationery House',
      companyName: 'City Stationery',
      contactPerson: 'Sita Thapa',
      phone: '9800000002',
      email: 'stationery@example.com',
      address: 'Lalitpur',
      panVatNumber: '600002222',
      categoryId: categories[1]._id,
      status: 'ACTIVE',
      notes: 'Office stationery supplier'
    }
  ]);

  const items = await Item.insertMany([
    { itemName: 'Paracetamol 500mg', supplierId: suppliers[0]._id, category: 'Medicine', unit: 'box', purchaseRate: 450, status: 'ACTIVE' },
    { itemName: 'Surgical Gloves', supplierId: suppliers[0]._id, category: 'Medical', unit: 'packet', purchaseRate: 650, status: 'ACTIVE' },
    { itemName: 'A4 Paper', supplierId: suppliers[1]._id, category: 'Stationery', unit: 'packet', purchaseRate: 550, status: 'ACTIVE' }
  ]);

  const orderItems = [
    { itemId: items[0]._id, itemName: items[0].itemName, quantity: 5, rate: 450, total: 2250 },
    { itemId: items[1]._id, itemName: items[1].itemName, quantity: 2, rate: 650, total: 1300 }
  ];

  const order = await PurchaseOrder.create({
    poNumber: 'PO-1001',
    supplierId: suppliers[0]._id,
    orderDate: new Date(),
    expectedDeliveryDate: new Date(),
    items: orderItems,
    grandTotal: 3550,
    status: 'ORDERED',
    remarks: 'Demo purchase order'
  });

  await Payment.create({
    supplierId: suppliers[0]._id,
    purchaseOrderId: order._id,
    totalAmount: 3550,
    paidAmount: 2000,
    dueAmount: 1550,
    paymentMethod: 'Cash',
    paymentDate: new Date(),
    status: getPaymentStatus(3550, 2000),
    remarks: 'Partial demo payment'
  });

  console.log('Demo data seeded successfully');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
