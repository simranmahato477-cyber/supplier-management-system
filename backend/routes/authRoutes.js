import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@supplier.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { email, role: 'ADMIN', name: 'Admin User' },
      process.env.JWT_SECRET || 'supplier_secret_key',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: { name: 'Admin User', email, role: 'ADMIN' }
    });
  }

  return res.status(401).json({ message: 'Invalid email or password' });
});

export default router;
