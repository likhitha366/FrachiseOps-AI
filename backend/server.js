const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
