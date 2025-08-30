1️⃣ Carrito (Cart)

| Método | Endpoint    | Descripción                                     |
| ------ | ----------- | ----------------------------------------------- |
| GET    | `/cart`     | Obtener todos los items del carrito del usuario |
| POST   | `/cart`     | Agregar un item al carrito                      |
| PUT    | `/cart/:id` | Actualizar cantidad de un item                  |
| DELETE | `/cart/:id` | Eliminar un item del carrito                    |


Ejemplo POST /cart

body:
{
  "ebook_id": 10,
  "quantity": 2
}

Respuesta esperada:

{
  "success": true,
  "item": {
    "cart_item_id": 1,
    "ebook_id": 10,
    "quantity": 2,
    "ebook_name": "Aprende Node.js",
    "ebook_price": "150.00"
  }
}

2️⃣ Órdenes (Orders)

Objetivo: convertir los items del carrito en una orden formal.

| Método | Endpoint  | Descripción                |
| ------ | --------- | -------------------------- |
| GET    | `/orders` | Listar órdenes del usuario |
| POST   | `/orders` | Crear una nueva orden      |


POST:

body:
{
  "address_id": 1,
  "items": [
    { "product_id": 10, "quantity": 2, "price": 100 },
    { "product_id": 11, "quantity": 1, "price": 150 }
  ],
  "total": 350
}

Notas:

status_id por defecto = 1 (PENDING)
Cada item se guarda en order_items.

3️⃣ Pagos (Payments)

Objetivo: registrar el pago asociado a una orden.

| Método | Endpoint               | Descripción                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/payments?order_id=3` | Listar pagos de una orden    |
| POST   | `/payments`            | Crear un pago para una orden |


POST

body:
{
  "order_id": 3,
  "method": "CREDIT_CARD",
  "amount": 476.39
}
Respuesta esperada (simulación pago completado):

{
  "success": true,
  "payment": {
    "payment_id": 1,
    "order_id": 3,
    "method": "CREDIT_CARD",
    "amount": "476.39",
    "pstatus_id": 1,
    "paid_at": "2025-08-30T15:35:43.556Z"
  }
}

Notas:
pstatus_id = 1 → pago completado.
La orden vinculada se actualiza a status_id = 2 (PAID).

4️⃣ Factura (Invoice)

Objetivo: generar un comprobante de compra.

| Método | Endpoint        | Descripción                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/invoices`     | Listar facturas del usuario       |
| GET    | `/invoices/:id` | Obtener factura por ID (PDF)      |
| POST   | `/invoices`     | Crear factura tras confirmar pago |


POST

body:
{
  "order_id": 3,
  "total": 476.39,
  "pdf_url": "/invoices/3.pdf"
}

Notas:
Solo se genera factura si el pago está confirmado (pstatus_id = 1).
issued_at = NOW().

[Carrito] 
    → Checkout → [Formulario dirección (address_id)]
        → Crear Orden (status = PENDING)
            → Crear Pago
                → Si pago exitoso → Actualizar Orden (PAID)
                    → Generar Factura (issued_at)

Resumen de pasos:
Usuario agrega items al carrito.
Usuario ingresa dirección (address_id).
Frontend envía POST /orders con items y total.
Frontend envía POST /payments con método y total.
Backend actualiza paid_at y status_id de la orden.
Se genera factura con POST /invoices y PDF disponible.




