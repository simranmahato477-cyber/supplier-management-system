import { useEffect, useState } from 'react';
import api from '../api/http.js';
import StatCard from '../components/StatCard.jsx';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Quick summary of supplier, purchase, and payment records.</p>
      </div>
      <div className="stats-grid">
        <StatCard label="Total Suppliers" value={data.totalSuppliers} />
        <StatCard label="Active Suppliers" value={data.activeSuppliers} />
        <StatCard label="Inactive Suppliers" value={data.inactiveSuppliers} />
        <StatCard label="Total Orders" value={data.totalOrders} />
        <StatCard label="Pending Orders" value={data.pendingOrders} />
        <StatCard label="Total Purchase" value={money(data.totalPurchaseAmount)} />
        <StatCard label="Total Paid" value={money(data.totalPaidAmount)} />
        <StatCard label="Total Due" value={money(data.totalDueAmount)} />
      </div>

      <div className="two-column">
        <div className="panel">
          <h2>Recent Suppliers</h2>
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
            <tbody>
              {data.recentSuppliers.map((supplier) => (
                <tr key={supplier._id}><td>{supplier.supplierName}</td><td>{supplier.phone}</td><td>{supplier.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Recent Purchase Orders</h2>
          <table>
            <thead><tr><th>PO No.</th><th>Supplier</th><th>Total</th></tr></thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order._id}><td>{order.poNumber}</td><td>{order.supplierId?.supplierName}</td><td>{money(order.grandTotal)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
