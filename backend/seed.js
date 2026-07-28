const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:admin123@localhost:5432/franchiseAIDB?schema=public"
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL for seeding...");

    // Deleting existing sales records to start fresh
    await client.query("DELETE FROM sales");
    console.log("Cleared existing sales records.");

    // Retrieve active outlets
    const resOutlets = await client.query("SELECT id, outlet_name, city FROM outlets WHERE is_active = true");
    const outlets = resOutlets.rows;
    console.log(`Found ${outlets.length} active outlets to seed.`);

    // Generate sales data for the last 60 days
    const totalDays = 60;
    const today = new Date("2026-07-28"); // Using current local time reference from metadata
    let seededCount = 0;

    for (const outlet of outlets) {
      console.log(`Seeding data for: ${outlet.outlet_name} (${outlet.city})`);
      
      for (let i = totalDays; i >= 1; i--) {
        const saleDate = new Date(today);
        saleDate.setDate(today.getDate() - i);
        
        const dayOfWeek = saleDate.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5); // Fri, Sat, Sun

        // Base metrics variation based on city/outlet characteristics
        let baseOrders = 150;
        let baseAOV = 150;
        let weekendBoost = 1.0;
        let weekdayBoost = 1.0;

        if (outlet.city === 'Bengaluru') {
          baseOrders = 180;
          baseAOV = 160;
          weekendBoost = 1.25; // Weekend boost for central city location
        } else if (outlet.city === 'Hyderabad') {
          baseOrders = 190;
          baseAOV = 145;
          weekdayBoost = 1.30; // IT Hub, high weekday traffic
          weekendBoost = 0.70; // Low weekend traffic
        } else if (outlet.city === 'Chennai') {
          baseOrders = 140;
          baseAOV = 135;
          weekendBoost = 1.40; // Beach/marina, huge weekend crowds
        } else if (outlet.city === 'Mumbai') {
          baseOrders = 210;
          baseAOV = 170;
          weekendBoost = 1.15; // Mega city, busy always
        } else if (outlet.city === 'Pune') {
          baseOrders = 150;
          baseAOV = 140;
          weekdayBoost = 1.20; // IT park area
          weekendBoost = 0.80;
        }

        // Apply random variation (+/- 10%) and weekly patterns
        const boost = isWeekend ? weekendBoost : weekdayBoost;
        const randomMultiplier = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        
        const total_orders = Math.round(baseOrders * boost * randomMultiplier);
        const customer_count = Math.round(total_orders * (1.1 + Math.random() * 0.15)); // Customers slightly higher than orders
        const average_order_value = parseFloat((baseAOV * (0.95 + Math.random() * 0.1)).toFixed(2));
        
        const gross_revenue = parseFloat((total_orders * average_order_value).toFixed(2));
        
        // Operating cost is typically 55% to 70% of gross revenue, plus some fixed cost components
        const costPercentage = 0.58 + Math.random() * 0.10;
        const operating_cost = parseFloat((gross_revenue * costPercentage).toFixed(2));
        const net_profit = parseFloat((gross_revenue - operating_cost).toFixed(2));

        // Payment split (Cash, Card, UPI)
        // UPI is usually dominant in India (50-60%), Card (25-35%), Cash (10-15%)
        const upiShare = 0.50 + Math.random() * 0.10; // 50% to 60%
        const cardShare = 0.25 + Math.random() * 0.10; // 25% to 35%
        const cashShare = 1.0 - upiShare - cardShare;  // Remainder

        const payment_upi = parseFloat((gross_revenue * upiShare).toFixed(2));
        const payment_card = parseFloat((gross_revenue * cardShare).toFixed(2));
        const payment_cash = parseFloat((gross_revenue * cashShare).toFixed(2));

        // Format date to YYYY-MM-DD
        const formattedDate = saleDate.toISOString().slice(0, 10);

        await client.query(`
          INSERT INTO sales (
            outlet_id, sale_date, total_orders, customer_count, gross_revenue, 
            operating_cost, net_profit, average_order_value, payment_cash, 
            payment_card, payment_upi
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          outlet.id, formattedDate, total_orders, customer_count, gross_revenue,
          operating_cost, net_profit, average_order_value, payment_cash,
          payment_card, payment_upi
        ]);

        seededCount++;
      }
    }

    console.log(`Seeding complete! Successfully seeded ${seededCount} daily records.`);
    
    // Verify count
    const verifyRes = await client.query("SELECT COUNT(*) FROM sales");
    console.log("Verification - Total rows in sales:", verifyRes.rows[0].count);

  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
}

main();
