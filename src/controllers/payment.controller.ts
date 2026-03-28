import { Request, Response } from 'express';
import { processPaymentService } from '../services/payment.service';

export const processPaymentController = async (req: Request, res: Response) => {
  try {
    const { payment_id, user_id, merchant_id, amount, currency } = req.body;

    // Validaciones básicas
    if (!payment_id || !user_id || !merchant_id || !amount || !currency) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: payment_id, user_id, merchant_id, amount, currency'
      });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'El monto debe ser un número mayor a 0'
      });
      return;
    }

    const result = await processPaymentService(
      payment_id,
      user_id,
      merchant_id,
      amount,
      currency
    );

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error: any) {
    console.error('Error en processPaymentController:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};