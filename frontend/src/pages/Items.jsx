import { useEffect, useState } from 'react';
import api from '../api/http.js';
import FormMessage from '../components/FormMessage.jsx';

const emptyForm = { itemName: '', supplierId: '', category: '', unit: 'pcs', purchaseRate: '', description: '', status: 'ACTIVE' };
const units = ['pcs', 'box', 'packet', 'kg', 'liter', 'carton'];

const Items = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ supplierId: '', status: '', search: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    const params = new URLSearchParams();
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const [itemRes, supplierRes] = await Promise.all([
      api.get(`/items?${params.toString()}`),
      api.get('/suppliers')
    ]);
    setItems(itemRes.data);
    setSuppliers(supplierRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.itemName.trim() || !form.supplierId || !form.unit || Number(form.purchaseRate) <= 0) {
      setError('Item name, supplier, unit and valid purchase rate are required');
      return;
    }
    try {
      const payload = { ...form, purchaseRate: Number(form.purchaseRate) };
      if (editingId) {
        await api.put(`/items/${editingId}`, payload);
        setSuccess('Item updated successfully');
      } else {
        await api.post('/items', payload);
        setSuccess('Item added successfully');
      }
      reset();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({
      itemName: item.itemName || '',
      supplierId: item.supplierId?._id || item.supplierId || '',
      category: item.category || '',
      unit: item.unit || 'pcs',
      purchaseRate: item.purchaseRate || '',
      description: item.description || '',
      status: item.status || 'ACTIVE'
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/items/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="page-title"><h1>Items</h1><p>Manage items supplied by suppliers.</p></div>
      <div className="two-column wide-left">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>{editingId ? 'Edit Item' : 'Add Item'}</h2>
          <FormMessage error={error} success={success} />
          <label>Item Name</label>
          <input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          <label>Supplier</label>
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.supplierName}</option>)}
          </select>
          <label>Category</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <label>Unit</label>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
          <label>Purchase Rate</label>
          <input type="number" value={form.purchaseRate} onChange={(e) => setForm({ ...form, purchaseRate: e.target.value })} />
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="actions"><button className="btn">{editingId ? 'Update' : 'Save'}</button>{editingId && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="panel">
          <h2>Item List</h2>
          <form className="filters" onSubmit={(e) => { e.preventDefault(); loadData(); }}>
            <input placeholder="Search item" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select value={filters.supplierId} onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}>
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.supplierName}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="btn btn-small">Filter</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Supplier</th><th>Unit</th><th>Rate</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.itemName}</td>
                    <td>{item.supplierId?.supplierName}</td>
                    <td>{item.unit}</td>
                    <td>Rs. {item.purchaseRate}</td>
                    <td>{item.status}</td>
                    <td><button className="link-btn" onClick={() => edit(item)}>Edit</button><button className="link-btn danger" onClick={() => remove(item._id)}>Delete</button></td>
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

export default Items;
