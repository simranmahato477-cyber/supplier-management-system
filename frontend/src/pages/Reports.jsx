import { useEffect, useState } from 'react';
import api from '../api/http.js';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const Reports = () => {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    api.get('/reports').then((res) => setReports(res.data));
  }, []);

  if (!reports) return <p>Loading reports...</p>;

  return (
    <div>
      <div className="page-title"><h1>Reports</h1><p>View supplier, purchase, payment, and due reports.</p></div>
      <div className="panel report-block">
        <h2>Supplier Report</h2>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Category</th><th>Status</th></tr></thead>
          <tbody>
            {reports.suppliers.map((supplier) => (
              <tr key={supplier._id}><td>{supplier.supplierName}</td><td>{supplier.phone}</td><td>{supplier.categoryId?.name}</td><td>{supplier.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel report-block">
        <h2>Purchase Order Report</h2>
        <table>
          <thead><tr><th>PO No.</th><th>Supplier</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {reports.orders.map((order) => (
              <tr key={order._id}><td>{order.poNumber}</td><td>{order.supplierId?.supplierName}</td><td>{money(order.grandTotal)}</td><td>{order.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel report-block">
        <h2>Payment Report</h2>
        <table>
          <thead><tr><th>Supplier</th><th>PO No.</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {reports.payments.map((payment) => (
              <tr key={payment._id}><td>{payment.supplierId?.supplierName}</td><td>{payment.purchaseOrderId?.poNumber}</td><td>{money(payment.paidAmount)}</td><td>{money(payment.dueAmount)}</td><td>{payment.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel report-block">
        <h2>Supplier-wise Purchase Report</h2>
        <table>
          <thead><tr><th>Supplier</th><th>Orders</th><th>Total Purchase</th></tr></thead>
          <tbody>
            {reports.supplierWisePurchase.map((row) => (
              <tr key={row._id?._id || row._id}><td>{row._id?.supplierName}</td><td>{row.orderCount}</td><td>{money(row.totalPurchase)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
