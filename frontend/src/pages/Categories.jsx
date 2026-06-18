import { useEffect, useState } from 'react';
import api from '../api/http.js';
import FormMessage from '../components/FormMessage.jsx';

const emptyForm = { name: '', description: '', status: 'ACTIVE' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
  };

  useEffect(() => { loadData(); }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim()) return setError('Category name is required');
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        setSuccess('Category updated successfully');
      } else {
        await api.post('/categories', form);
        setSuccess('Category added successfully');
      }
      reset();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description || '', status: category.status });
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="page-title"><h1>Supplier Categories</h1><p>Manage supplier category records.</p></div>
      <div className="two-column">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
          <FormMessage error={error} success={success} />
          <label>Category Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <h2>Category List</h2>
          <table>
            <thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td><td>{category.status}</td>
                  <td><button className="link-btn" onClick={() => edit(category)}>Edit</button><button className="link-btn danger" onClick={() => remove(category._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
