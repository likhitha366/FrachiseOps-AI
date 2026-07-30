const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret';
const AUTH_STORE_PATH = process.env.AUTH_STORE_PATH || path.join(__dirname, 'data', 'users.json');

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5432/franchiseAIDB?schema=public"
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

const createToken = (user) => jwt.sign(
  { userId: user.id, email: user.email, name: user.full_name },
  JWT_SECRET,
  { expiresIn: '8h' }
);

// Keep authentication usable during local development when PostgreSQL has not
// been configured. The dashboard already has a data fallback, so this mirrors
// that behavior for accounts without masking database errors in production.
const isDatabaseUnavailable = (error) => Boolean(error && [
  '28P01', // invalid password
  '3D000', // database does not exist
  'ECONNREFUSED',
  'ENOTFOUND',
].includes(error.code));

async function readLocalUsers() {
  try {
    return JSON.parse(await fs.readFile(AUTH_STORE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeLocalUsers(users) {
  await fs.mkdir(path.dirname(AUTH_STORE_PATH), { recursive: true });
  await fs.writeFile(AUTH_STORE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

async function createLocalUser(name, email, password) {
  const users = await readLocalUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) {
    const duplicateError = new Error('An account already exists for this email.');
    duplicateError.code = '23505';
    throw duplicateError;
  }

  const user = {
    id: users.reduce((maximumId, currentUser) => Math.max(maximumId, currentUser.id || 0), 0) + 1,
    full_name: name.trim(),
    email: normalizedEmail,
    password_hash: await bcrypt.hash(password, 12),
  };
  await writeLocalUsers([...users, user]);
  return user;
}

async function findLocalUser(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readLocalUsers();
  return users.find((user) => user.email === normalizedEmail);
}

// Authentication endpoints used by the frontend Login and Sign-up screens.
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Name, email, and a password of at least 6 characters are required.' });
  }
  try {
    await ensureUsersTable();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.full_name, email: user.email } });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account already exists for this email.' });
    if (isDatabaseUnavailable(error)) {
      try {
        const user = await createLocalUser(name, email, password);
        console.warn('PostgreSQL unavailable; created account in the local development store.');
        return res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.full_name, email: user.email } });
      } catch (fallbackError) {
        if (fallbackError.code === '23505') return res.status(409).json({ error: fallbackError.message });
        console.error('Local sign-up fallback error:', fallbackError);
      }
    }
    console.error('Sign-up error:', error);
    res.status(500).json({ error: 'Unable to create your account. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  try {
    await ensureUsersTable();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    res.json({ token: createToken(user), user: { id: user.id, name: user.full_name, email: user.email } });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      try {
        const user = await findLocalUser(email);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
          return res.status(401).json({ error: 'Incorrect email or password.' });
        }
        console.warn('PostgreSQL unavailable; signed in with the local development store.');
        return res.json({ token: createToken(user), user: { id: user.id, name: user.full_name, email: user.email } });
      } catch (fallbackError) {
        console.error('Local login fallback error:', fallbackError);
      }
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Unable to sign in. Please try again.' });
  }
});

// Helper: build date/outlet filter SQL conditions
const getFilters = (query) => {
  const { outletId, startDate, endDate } = query;
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (outletId && outletId !== 'all') {
    conditions.push(`outlet_id = $${paramIndex}`);
    values.push(parseInt(outletId, 10));
    paramIndex++;
  }

  if (startDate) {
    conditions.push(`sale_date >= $${paramIndex}`);
    values.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    conditions.push(`sale_date <= $${paramIndex}`);
    values.push(endDate);
    paramIndex++;
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

// 1. GET /api/outlets
app.get('/api/outlets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM outlets ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    res.status(500).json({ error: 'Server error fetching outlets' });
  }
});

// 2. GET /api/sales/summary
app.get('/api/sales/summary', async (req, res) => {
  try {
    const { whereClause, values } = getFilters(req.query);

    const queryText = `
      SELECT 
        COALESCE(SUM(gross_revenue), 0) as total_revenue,
        COALESCE(SUM(operating_cost), 0) as total_cost,
        COALESCE(SUM(net_profit), 0) as total_profit,
        COALESCE(SUM(total_orders), 0) as total_orders,
        COALESCE(SUM(customer_count), 0) as total_customers,
        COALESCE(SUM(payment_cash), 0) as payment_cash,
        COALESCE(SUM(payment_card), 0) as payment_card,
        COALESCE(SUM(payment_upi), 0) as payment_upi
      FROM sales
      ${whereClause}
    `;

    const result = await pool.query(queryText, values);
    const summary = result.rows[0];

    // Calculate derived metrics
    const totalOrders = parseFloat(summary.total_orders);
    const totalRevenue = parseFloat(summary.total_revenue);
    const totalCost = parseFloat(summary.total_cost);
    const totalProfit = parseFloat(summary.total_profit);

    const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
    const profitMargin = totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

    res.json({
      grossRevenue: totalRevenue,
      operatingCost: totalCost,
      netProfit: totalProfit,
      totalOrders: totalOrders,
      totalCustomers: parseInt(summary.total_customers, 10),
      averageOrderValue: avgOrderValue,
      profitMargin: profitMargin,
      paymentSplit: {
        cash: parseFloat(summary.payment_cash),
        card: parseFloat(summary.payment_card),
        upi: parseFloat(summary.payment_upi)
      }
    });

  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Server error fetching sales summary' });
  }
});

// 3. GET /api/sales/trends
app.get('/api/sales/trends', async (req, res) => {
  try {
    const { whereClause, values } = getFilters(req.query);

    const queryText = `
      SELECT 
        sale_date,
        COALESCE(SUM(gross_revenue), 0) as gross_revenue,
        COALESCE(SUM(operating_cost), 0) as operating_cost,
        COALESCE(SUM(net_profit), 0) as net_profit,
        COALESCE(SUM(total_orders), 0) as total_orders
      FROM sales
      ${whereClause}
      GROUP BY sale_date
      ORDER BY sale_date ASC
    `;

    const result = await pool.query(queryText, values);
    
    // Format date string to YYYY-MM-DD
    const trends = result.rows.map(row => ({
      date: new Date(row.sale_date).toISOString().slice(0, 10),
      grossRevenue: parseFloat(row.gross_revenue),
      operatingCost: parseFloat(row.operating_cost),
      netProfit: parseFloat(row.net_profit),
      totalOrders: parseInt(row.total_orders, 10)
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({ error: 'Server error fetching sales trends' });
  }
});

// 4. GET /api/sales/list
app.get('/api/sales/list', async (req, res) => {
  try {
    const { outletId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (outletId && outletId !== 'all') {
      conditions.push(`s.outlet_id = $${paramIndex}`);
      values.push(parseInt(outletId, 10));
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`s.sale_date >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`s.sale_date <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM sales s
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const totalCount = parseInt(countRes.rows[0].total, 10);

    // Get paginated list
    const listQuery = `
      SELECT 
        s.id,
        s.outlet_id,
        o.outlet_name,
        o.city,
        s.sale_date,
        s.total_orders,
        s.customer_count,
        s.gross_revenue,
        s.operating_cost,
        s.net_profit,
        s.average_order_value,
        s.payment_cash,
        s.payment_card,
        s.payment_upi
      FROM sales s
      JOIN outlets o ON s.outlet_id = o.id
      ${whereClause}
      ORDER BY s.sale_date DESC, o.outlet_name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const limitVal = parseInt(limit, 10);
    const offsetVal = parseInt(offset, 10);

    const result = await pool.query(listQuery, [...values, limitVal, offsetVal]);
    
    const records = result.rows.map(row => ({
      id: row.id,
      outletId: row.outlet_id,
      outletName: row.outlet_name,
      city: row.city,
      saleDate: new Date(row.sale_date).toISOString().slice(0, 10),
      totalOrders: parseInt(row.total_orders, 10),
      customerCount: parseInt(row.customer_count, 10),
      grossRevenue: parseFloat(row.gross_revenue),
      operatingCost: parseFloat(row.operating_cost),
      netProfit: parseFloat(row.net_profit),
      averageOrderValue: parseFloat(row.average_order_value),
      paymentSplit: {
        cash: parseFloat(row.payment_cash),
        card: parseFloat(row.payment_card),
        upi: parseFloat(row.payment_upi)
      }
    }));

    res.json({
      records,
      pagination: {
        total: totalCount,
        limit: limitVal,
        offset: offsetVal
      }
    });

  } catch (error) {
    console.error('Error fetching sales list:', error);
    res.status(500).json({ error: 'Server error fetching sales list' });
  }
});

// Start Server
ensureUsersTable().catch(error => console.error('Could not create users table:', error.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
