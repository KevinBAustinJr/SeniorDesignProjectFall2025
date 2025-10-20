import pool from './js/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('Seeding database...');

    // USERS
    await pool.query(`
      INSERT INTO user (user_id, username, email, password_hash, role_id, created_at)
      VALUES
        (1, 'admin', 'admin@example.com', 'dummyhash', 1, NOW()),
        (2, 'dummyuser', 'user@example.com', 'dummyhash', 2, NOW())
      ON DUPLICATE KEY UPDATE username=username;
    `);

    // BOTS
    await pool.query(`
      INSERT INTO Bot (bot_id, status, battery_level, last_checkin)
      VALUES
        (1, 'idle', 100, NOW()),
        (2, 'en_route', 75, NOW()),
        (3, 'charging', 50, NOW())
      ON DUPLICATE KEY UPDATE status=status;
    `);

    // LOCATIONS
    await pool.query(`
      INSERT INTO Location (location_id, name, latitude, longitude, is_active)
      VALUES
        (1, 'Warehouse', 40.7128, -74.0060, 1),
        (2, 'Customer A', 40.73061, -73.935242, 1),
        (3, 'Customer B', 40.758896, -73.985130, 1)
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // PATH EDGES
    await pool.query(`
      INSERT INTO path_edge (edge_id, from_id, to_id, distance, is_blocked)
      VALUES
        (1, 1, 2, 5.2, 0),
        (2, 2, 3, 3.8, 0)
      ON DUPLICATE KEY UPDATE distance=distance;
    `);

    // DELIVERIES
    await pool.query(`
      INSERT INTO delivery (delivery_id, bot_id, start_location, end_location, status, user_id, created_at)
      VALUES
        (1, 1, 1, 2, 'pending', 2, NOW()),
        (2, 2, 2, 3, 'in_progress', 2, NOW())
      ON DUPLICATE KEY UPDATE status=status;
    `);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

