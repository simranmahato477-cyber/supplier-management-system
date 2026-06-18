import { Link } from 'react-router-dom';

const Home = () => (
  <div className="public-page">
    <header className="public-header">
      <div>
        <h1>Supplier Management System</h1>
        <p>Manage suppliers, purchase orders, payments, and reports from one simple admin panel.</p>
      </div>
      <Link className="btn" to="/login">Admin Login</Link>
    </header>

    <section className="public-section">
      <h2>About System</h2>
      <p>
        This web application helps small and medium businesses keep supplier records organized. It reduces manual work and helps track purchase orders and payment dues.
      </p>
    </section>

    <section className="public-section grid-3">
      <div className="public-card">
        <h3>Supplier Records</h3>
        <p>Store company details, contact person, phone, email, PAN/VAT number, category, and status.</p>
      </div>
      <div className="public-card">
        <h3>Purchase Orders</h3>
        <p>Create purchase orders with multiple items and automatic grand total calculation.</p>
      </div>
      <div className="public-card">
        <h3>Payments</h3>
        <p>Record full or partial payment and track paid amount, due amount, and payment status.</p>
      </div>
    </section>

    <section className="public-section">
      <h2>Contact</h2>
      <p>Email: info@example.com</p>
      <p>Phone: 9800000000</p>
    </section>
  </div>
);

export default Home;
