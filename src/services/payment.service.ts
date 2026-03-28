import { findUserById, findTransactionById, processPayment } from '../repositories/payment.repository';

export const processPaymentService = async (
  paymentId: string,
  userId: string,
  merchantId: string,
  amount: number,
  currency: string
) => {

  // 1. Verificar idempotencia
  // Si el payment_id ya existe, devolvemos el resultado anterior
  const existingTransaction = await findTransactionById(paymentId);
  if (existingTransaction) {
    return {
      success: true,
      message: 'Transacción ya procesada anteriormente',
      idempotent: true,
      data: existingTransaction
    };
  }

  // 2. Verificar que el usuario existe
  const user = await findUserById(userId);
  if (!user) {
    return {
      success: false,
      message: 'Usuario no encontrado'
    };
  }

  // 3. Procesar el pago (aquí se valida saldo y se descuenta)
  const result = await processPayment(
    paymentId,
    userId,
    merchantId,
    amount,
    currency
  );

  return result;
};