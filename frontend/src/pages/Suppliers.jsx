import { useEffect, useState } from 'react';
import api from '../api/http.js';
import FormMessage from '../components/FormMessage.jsx';

const emptyForm = {
  supplierName: '',
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  panVatNumber: '',
  categoryId: '',
  status: 'ACTIVE',
  notes: ''
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    const [supplierRes, categoryRes] = await Promise.all([
      api.get(`/suppliers?${params.toString()}`),
      api.get('/categories')
    ]);
    setSuppliers(supplierRes.data);
    setCategories(categoryRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    loadData();
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.supplierName.trim() || !form.phone.trim() || !form.categoryId) {
      setError('Supplier name, phone and category are required');
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
        setSuccess('Supplier updated successfully');
      } else {
        await api.post('/suppliers', form);
        setSuccess('Supplier added successfully');
      }
      reset();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (supplier) => {
    setEditingId(supplier._id);
    setForm({
      supplierName: supplier.supplierName || '',
      companyName: supplier.companyName || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      panVatNumber: supplier.panVatNumber || '',
      categoryId: supplier.categoryId?._id || supplier.categoryId || '',
      status: supplier.status || 'ACTIVE',
      notes: supplier.notes || ''
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    await api.delete(`/suppliers/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="page-title"><h1>Suppliers</h1><p>Add, update, search and filter supplier records.</p></div>
      <div className="two-column wide-left">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <FormMessage error={error} success={success} />
          <label>Supplier Name</label>
          <input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
          <label>Company Name</label>
          <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <label>Contact Person</label>
          <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label>Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <label>PAN/VAT Number</label>
          <input value={form.panVatNumber} onChange={(e) => setForm({ ...form, panVatNumber: e.target.value })} />
          <label>Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <label>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="actions"><button className="btn">{editingId ? 'Update' : 'Save'}</button>{editingId && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="panel">
          <h2>Supplier List</h2>
          <form className="filters" onSubmit={applyFilters}>
            <input placeholder="Search supplier" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="btn btn-small">Search</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>{supplier.supplierName}<br /><small>{supplier.companyName}</small></td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.categoryId?.name}</td>
                    <td>{supplier.status}</td>
                    <td><button className="link-btn" onClick={() => edit(supplier)}>Edit</button><button className="link-btn danger" onClick={() => remove(supplier._id)}>Delete</button></td>
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

export default Suppliers;
