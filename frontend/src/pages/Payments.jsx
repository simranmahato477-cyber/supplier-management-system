import { useEffect, useMemo, useState } from 'react';
import api from '../api/http.js';
import FormMessage from '../components/FormMessage.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = { purchaseOrderId: '', paidAmount: '', paymentMethod: 'Cash', paymentDate: today(), remarks: '' };
const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const [paymentRes, orderRes] = await Promise.all([
      api.get(`/payments?${params.toString()}`),
      api.get('/purchase-orders')
    ]);
    setPayments(paymentRes.data);
    setOrders(orderRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const selectedOrder = useMemo(() => orders.find((order) => order._id === form.purchaseOrderId), [orders, form.purchaseOrderId]);
  const totalAmount = selectedOrder?.grandTotal || 0;
  const dueAmount = Math.max(Number(totalAmount) - Number(form.paidAmount || 0), 0);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.purchaseOrderId || form.paidAmount === '' || !form.paymentMethod || !form.paymentDate) {
      setError('Purchase order, paid amount, payment method and payment date are required');
      return;
    }
    if (Number(form.paidAmount) > Number(totalAmount)) {
      setError('Paid amount cannot be greater than total amount');
      return;
    }
    try {
      const payload = { ...form, paidAmount: Number(form.paidAmount) };
      if (editingId) {
        await api.put(`/payments/${editingId}`, payload);
        setSuccess('Payment updated successfully');
      } else {
        await api.post('/payments', payload);
        setSuccess('Payment added successfully');
      }
      reset();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (payment) => {
    setEditingId(payment._id);
    setForm({
      purchaseOrderId: payment.purchaseOrderId?._id || payment.purchaseOrderId || '',
      paidAmount: payment.paidAmount || '',
      paymentMethod: payment.paymentMethod || 'Cash',
      paymentDate: payment.paymentDate?.slice(0, 10) || today(),
      remarks: payment.remarks || ''
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this payment?')) return;
    await api.delete(`/payments/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="page-title"><h1>Payments</h1><p>Record supplier payments and track due amounts.</p></div>
      <div className="two-column wide-left">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>{editingId ? 'Edit Payment' : 'Add Payment'}</h2>
          <FormMessage error={error} success={success} />
          <label>Purchase Order</label>
          <select value={form.purchaseOrderId} onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })}>
            <option value="">Select Purchase Order</option>
            {orders.map((order) => <option key={order._id} value={order._id}>{order.poNumber} - {order.supplierId?.supplierName} - {money(order.grandTotal)}</option>)}
          </select>
          <label>Total Amount</label>
          <input value={money(totalAmount)} disabled />
          <label>Paid Amount</label>
          <input type="number" min="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
          <label>Due Amount</label>
          <input value={money(dueAmount)} disabled />
          <label>Payment Method</label>
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option>Cash</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Esewa/Khalti</option>
            <option>Other</option>
          </select>
          <label>Payment Date</label>
          <input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
          <label>Remarks</label>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <div className="actions"><button className="btn">{editingId ? 'Update' : 'Save'}</button>{editingId && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="panel">
          <h2>Payment List</h2>
          <form className="filters" onSubmit={(e) => { e.preventDefault(); loadData(); }}>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>
            <button className="btn btn-small">Filter</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>PO No.</th><th>Paid</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.supplierId?.supplierName}</td>
                    <td>{payment.purchaseOrderId?.poNumber}</td>
                    <td>{money(payment.paidAmount)}</td>
                    <td>{money(payment.dueAmount)}</td>
                    <td>{payment.status}</td>
                    <td><button className="link-btn" onClick={() => edit(payment)}>Edit</button><button className="link-btn danger" onClick={() => remove(payment._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
