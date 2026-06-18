import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>Supplier MS</h2>
          <p>Admin Panel</p>
        </div>
        <nav>
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/categories">Supplier Categories</NavLink>
          <NavLink to="/admin/suppliers">Suppliers</NavLink>
          <NavLink to="/admin/items">Items</NavLink>
          <NavLink to="/admin/purchase-orders">Purchase Orders</NavLink>
          <NavLink to="/admin/payments">Payments</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
        </nav>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div>
            <strong>{user?.name || 'Admin User'}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="btn btn-light" onClick={handleLogout}>Logout</button>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
