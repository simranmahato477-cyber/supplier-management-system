import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './pages/Categories.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Items from './pages/Items.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="items" element={<Items />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
