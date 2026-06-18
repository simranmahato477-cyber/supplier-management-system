import { useEffect, useMemo, useState } from 'react';
import api from '../api/http.js';
import FormMessage from '../components/FormMessage.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const emptyLine = { itemId: '', quantity: 1, rate: '' };
const emptyForm = { supplierId: '', orderDate: today(), expectedDeliveryDate: today(), status: 'DRAFT', remarks: '', items: [emptyLine] };

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ supplierId: '', status: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    const params = new URLSearchParams();
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.status) params.append('status', filters.status);
    const [orderRes, supplierRes, itemRes] = await Promise.all([
      api.get(`/purchase-orders?${params.toString()}`),
      api.get('/suppliers'),
      api.get('/items')
    ]);
    setOrders(orderRes.data);
    setSuppliers(supplierRes.data);
    setItems(itemRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const grandTotal = useMemo(() => {
    return form.items.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.rate || 0), 0);
  }, [form.items]);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const updateLine = (index, key, value) => {
    const lines = [...form.items];
    lines[index] = { ...lines[index], [key]: value };
    if (key === 'itemId') {
      const selected = items.find((item) => item._id === value);
      if (selected) lines[index].rate = selected.purchaseRate;
    }
    setForm({ ...form, items: lines });
  };

  const addLine = () => setForm({ ...form, items: [...form.items, emptyLine] });
  const removeLine = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.supplierId || !form.orderDate || form.items.length === 0) {
      setError('Supplier, order date and at least one item are required');
      return;
    }
    for (const line of form.items) {
      if (!line.itemId || Number(line.quantity) <= 0 || Number(line.rate) <= 0) {
        setError('Each line must have item, quantity greater than 0 and rate greater than 0');
        return;
      }
    }
    try {
      const payload = {
        ...form,
        items: form.items.map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity), rate: Number(line.rate) }))
      };
      if (editingId) {
        await api.put(`/purchase-orders/${editingId}`, payload);
        setSuccess('Purchase order updated successfully');
      } else {
        await api.post('/purchase-orders', payload);
        setSuccess('Purchase order created successfully');
      }
      reset();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (order) => {
    setEditingId(order._id);
    setForm({
      supplierId: order.supplierId?._id || order.supplierId || '',
      orderDate: order.orderDate?.slice(0, 10) || today(),
      expectedDeliveryDate: order.expectedDeliveryDate?.slice(0, 10) || today(),
      status: order.status || 'DRAFT',
      remarks: order.remarks || '',
      items: order.items.map((line) => ({ itemId: line.itemId, quantity: line.quantity, rate: line.rate }))
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this purchase order?')) return;
    await api.delete(`/purchase-orders/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="page-title"><h1>Purchase Orders</h1><p>Create purchase orders with automatic total calculation.</p></div>
      <div className="two-column wide-left">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>{editingId ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
          <FormMessage error={error} success={success} />
          <label>Supplier</label>
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.supplierName}</option>)}
          </select>
          <label>Order Date</label>
          <input type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
          <label>Expected Delivery Date</label>
          <input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">Draft</option>
            <option value="ORDERED">Ordered</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="line-section">
            <div className="line-header"><strong>Items</strong><button type="button" className="btn btn-small" onClick={addLine}>Add Item</button></div>
            {form.items.map((line, index) => (
              <div className="line-row" key={index}>
                <select value={line.itemId} onChange={(e) => updateLine(index, 'itemId', e.target.value)}>
                  <option value="">Select Item</option>
                  {items.map((item) => <option key={item._id} value={item._id}>{item.itemName}</option>)}
                </select>
                <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} placeholder="Qty" />
                <input type="number" min="1" value={line.rate} onChange={(e) => updateLine(index, 'rate', e.target.value)} placeholder="Rate" />
                <span>{money(Number(line.quantity || 0) * Number(line.rate || 0))}</span>
                {form.items.length > 1 && <button type="button" className="link-btn danger" onClick={() => removeLine(index)}>Remove</button>}
              </div>
            ))}
          </div>
          <div className="total-box">Grand Total: {money(grandTotal)}</div>
          <label>Remarks</label>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <div className="actions"><button className="btn">{editingId ? 'Update' : 'Save'}</button>{editingId && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="panel">
          <h2>Purchase Order List</h2>
          <form className="filters" onSubmit={(e) => { e.preventDefault(); loadData(); }}>
            <select value={filters.supplierId} onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}>
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.supplierName}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ORDERED">Ordered</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="btn btn-small">Filter</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>PO No.</th><th>Supplier</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.poNumber}</td>
                    <td>{order.supplierId?.supplierName}</td>
                    <td>{money(order.grandTotal)}</td>
                    <td>{order.status}</td>
                    <td><button className="link-btn" onClick={() => edit(order)}>Edit</button><button className="link-btn danger" onClick={() => remove(order._id)}>Delete</button></td>
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

export default PurchaseOrders;
