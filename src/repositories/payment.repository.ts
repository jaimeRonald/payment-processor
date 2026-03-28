import pool from '../config/database';

export const findUserById = async (userId: string) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

export const findTransactionById = async (paymentId: string) => {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE id = $1',
    [paymentId]
  );
  return result.rows[0];
};

export const processPayment = async (
  paymentId: string,
  userId: string,
  merchantId: string,
  amount: number,
  currency: string
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Descontamos saldo al usuario con FOR UPDATE
    // Esto bloquea la fila mientras dure la transacción
    const userResult = await client.query(
      'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    const balance = parseFloat(userResult.rows[0].balance);

    if (balance < amount) {
      await client.query('ROLLBACK');
      return { success: false, message: 'Saldo insuficiente' };
    }

    // Descontamos saldo  // aqui resolvemos la concurrecnia es decir que no debe ejeutarse otra transaccion para el mismo usuarios hast qeu tmeirne este proceso  de pago 
    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [amount, userId]
    );

    // Registramos la transacción
    await client.query(
      `INSERT INTO transactions (id, user_id, merchant_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, 'SUCCESS')`,
      [paymentId, userId, merchantId, amount, currency]
    );

    await client.query('COMMIT');  // aqui se livera el bloqueo de la fila del usuario 
    return { success: true, message: 'Pago procesado correctamente' };

  } catch (error: any) {
    await client.query('ROLLBACK');  // tambein aqui se libera en caso de error el bloqueo de la fila del usuario 
    throw error;
  } finally {
    client.release();
  }
};