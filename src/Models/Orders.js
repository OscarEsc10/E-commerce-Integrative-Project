// Models/OrderModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Order {
  // Crear una orden con sus items
  static async create({ user_id, address_id, total, items }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 🔹 Insertar en tabla orders con status_id = 1 (PENDING)
        const orderQuery = `
            INSERT INTO orders (user_id, address_id, total, status_id, created_at)
            VALUES ($1, $2, $3, 1, NOW())
            RETURNING *
        `;
        const { rows } = await client.query(orderQuery, [user_id, address_id, total]);
        const order = rows[0];

        // 🔹 Insertar items en order_items
        const insertItemQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const createdItems = [];
        for (const item of items) {
            const { rows: itemRows } = await client.query(insertItemQuery, [
                order.order_id,
                item.product_id,
                item.quantity,
                item.price
            ]);
            createdItems.push(itemRows[0]);
        }

        await client.query('COMMIT');
        return { order, items: createdItems };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creando orden:', error);
        throw error;
    } finally {
        client.release();
    }
}


  // Obtener todas las órdenes de un usuario
  static async findByUserId(user_id) {
    const query = `
      SELECT o.*, s.name AS status_name
      FROM orders o
      JOIN orders_status s ON o.status_id = s.orderstatus_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  // Obtener una orden con sus items
  static async findById(order_id) {
    const orderQuery = `SELECT * FROM orders WHERE order_id = $1`;
    const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1`;

    const { rows: orderRows } = await pool.query(orderQuery, [order_id]);
    if (!orderRows.length) return null;

    const { rows: itemsRows } = await pool.query(itemsQuery, [order_id]);

    return { ...orderRows[0], items: itemsRows };
  }

  // Actualizar estado de la orden
  static async updateStatus(order_id, status) {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE order_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, order_id]);
    return rows[0];
  }

  //listar todos los pedidos para visualizar informacion en el modulo orders-management de admins

  // Obtener todas las órdenes (para admin)
   static async findAll() {
    const query = `
      SELECT * FROM orders
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // sellers
  static async updateStatus(order_id, status_id) {
    const query = `
      UPDATE orders
      SET status_id = $1
      WHERE order_id = $2
      RETURNING *
    `;
      const { rows } = await pool.query(query, [status_id, order_id]);
      return rows[0];
    }

   static async findByCreatorId(sellerId) {
  const { rows } = await pool.query(`
      SELECT o.order_id, o.user_id, o.total, o.status_id, o.created_at, s.name AS status_name
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN ebooks e ON oi.product_id = e.ebook_id
      JOIN orders_status s ON o.status_id = s.orderstatus_id
      WHERE e.creator_id = $1
      GROUP BY o.order_id, s.name
      ORDER BY o.created_at DESC
    `, [sellerId]);
    return rows;
  }

}
