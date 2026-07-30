const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = new URL(process.env.DATABASE_URL);
const databaseName = databaseUrl.pathname.slice(1);
const adminUrl = new URL(databaseUrl);
adminUrl.pathname = '/postgres';

const quoteIdentifier = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

async function main() {
  const adminClient = new Client({ connectionString: adminUrl.toString() });
  await adminClient.connect();
  const existing = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
  if (existing.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    console.log(`Created database ${databaseName}.`);
  }
  await adminClient.end();

  const client = new Client({ connectionString: databaseUrl.toString() });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS outlets (
      id SERIAL PRIMARY KEY,
      outlet_name VARCHAR(100) UNIQUE NOT NULL,
      manager_name VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      postal_code VARCHAR(10),
      latitude DECIMAL(10, 7) NOT NULL,
      longitude DECIMAL(10, 7) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      outlet_id INTEGER NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
      sale_date DATE NOT NULL,
      total_orders INTEGER NOT NULL,
      customer_count INTEGER NOT NULL,
      gross_revenue DECIMAL(12, 2) NOT NULL,
      operating_cost DECIMAL(12, 2) NOT NULL,
      net_profit DECIMAL(12, 2) NOT NULL,
      average_order_value DECIMAL(10, 2) NOT NULL,
      payment_cash DECIMAL(10, 2) NOT NULL,
      payment_card DECIMAL(10, 2) NOT NULL,
      payment_upi DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const outlets = [
    ['FranchiseOps - Bengaluru Central', 'Rahul Sharma', 'MG Road', 'Bengaluru', 'Karnataka', '560001', 12.971599, 77.594566],
    ['FranchiseOps - Hyderabad Tech Park', 'Priya Reddy', 'HITEC City', 'Hyderabad', 'Telangana', '500081', 17.443500, 78.377200],
    ['FranchiseOps - Chennai Marina', 'Arjun Kumar', 'Anna Salai', 'Chennai', 'Tamil Nadu', '600002', 13.082700, 80.270700],
    ['FranchiseOps - Mumbai Andheri', 'Neha Patel', 'Andheri East', 'Mumbai', 'Maharashtra', '400069', 19.119700, 72.846800],
    ['FranchiseOps - Pune Hinjawadi', 'Vikram Joshi', 'Hinjawadi Phase 1', 'Pune', 'Maharashtra', '411057', 18.591200, 73.738900],
  ];
  for (const outlet of outlets) {
    await client.query(
      `INSERT INTO outlets (outlet_name, manager_name, address, city, state, postal_code, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (outlet_name) DO NOTHING`,
      outlet
    );
  }
  await client.end();
  console.log('Database tables and default outlets are ready.');
}

main().catch(error => {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
});
