import express from 'express';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api', paymentRoutes);

// ruta para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor corriendo' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});