import pool from './database';

const run = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      balance NUMERIC(12,2) NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      merchant_id VARCHAR(50) NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      currency VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Usuarios de prueba con saldo inicial
  await pool.query(`
    INSERT INTO users (id, name, balance) VALUES
      ('user_001', 'JUAN GOMEZ', 500.00),
      ('user_002', 'ROSIO TORRES', 100.00)
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('Tablas creadas y datos iniciales insertados');
  await pool.end();
};

run().catch(console.error);
