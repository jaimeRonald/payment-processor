# Payment Processor

API REST para procesamiento de pagos, construida con TypeScript, Node.js, Express y PostgreSQL.

## pasos para levantar el proyecto 

1. Clonar el repositorio
2. Instalar dependencias:
   npm install
3. Levantar la base de datos:
   docker compose up -d
4. Crear las tablas:
   npm run migrate
5. Iniciar el servidor:
   npm run dev

## Endpoint

POST /api/payment

Body:
{
  "payment_id": "pay-001",
  "user_id": "user_001",
  "merchant_id": "merchant_001",
  "amount": 50.00,
  "currency": "PEN"
}

usuarios  de prueba:
- user_001 → saldo S/. 500
- user_002 → saldo S/. 100

## Decisiones de Diseño

### Base de datos
Elegí PostgreSQL porque el reto requiere transacciones ACID y manejo de concurrencia.
PostgreSQL tiene soporte nativo para FOR UPDATE y transacciones robustas, lo que
lo hace ideal para sistemas de pagos donde la consistencia de datos es crítica.

### Idempotencia
El payment_id que envía el cliente se usa directamente como PRIMARY KEY en la tabla
transactions. Si llega el mismo payment_id dos veces, antes de procesar consultamos
si ya existe en la BD. Si existe, devolvemos el resultado anterior sin volver a cobrar.
Esto garantiza que un reintento por falla de red no genera un doble cobro.

### Concurrencia
Usé FOR UPDATE de PostgreSQL. Cuando dos requests llegan
al mismo tiempo para el mismo usuario, el SELECT FOR UPDATE bloquea la fila del
usuario hasta que la transacción termine. El segundo request espera y luego lee
el saldo ya actualizado, evitando así condiciones de carrera lo que al final esto se desbloqeua por un commit o un rollback

### Arquitectura productiva
Si este piloto escala a alta demanda, la infraestructura en AWS incluiría:
- API Gateway + WAF para seguridad y rate limiting
- Application Load Balancer con múltiples instancias ECS en Auto Scaling
- ElastiCache (Redis) para verificar idempotencia sin golpear la BD
- SQS para desacoplar picos de carga
- RDS PostgreSQL Multi-AZ para alta disponibilidad