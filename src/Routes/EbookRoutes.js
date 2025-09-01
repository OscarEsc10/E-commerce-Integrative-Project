// src/Routes/ebookRoutes.js
import { Router } from 'express';
import { authenticateToken, requireRole } from '../Middleware/auth.js';
import { pool } from '../../Config/ConnectionToBd.js';
import { EbookController } from '../Controllers/EbookController.js';

const router = Router();

/**
 * GET /api/ebooks
 * Todos los usuarios autenticados pueden ver ebooks
 * - Admin ve todos
 * - Seller ve solo sus ebooks
 * - Customer ve todos
 */
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    let query = 'SELECT * FROM ebooks';
    let params = [];

    if (user.role_id === 2) { // seller
      query += ' WHERE creator_id = $1';
      params.push(user.user_id);
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ebooks
 * Solo admin y seller pueden crear ebooks
 */
router.post('/', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  const user = req.user;
  const { name, description, price, category_id } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const query = `
      INSERT INTO ebooks (name, description, price, category_id, creator_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`;
    const values = [name, description, price, category_id || null, user.user_id];
    const result = await pool.query(query, values);

    res.json({ success: true, ebook: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/ebooks/:id
 * Solo admin o el seller dueño del ebook puede actualizar
 */
router.put('/:id', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { name, description, price, category_id } = req.body;

  try {
    // Verificar que el seller sea el creador si no es admin
    if (user.role_id === 2) {
      const check = await pool.query('SELECT creator_id FROM ebooks WHERE ebook_id = $1', [id]);
      if (!check.rowCount) return res.status(404).json({ success: false, message: 'Ebook no encontrado' });
      if (check.rows[0].creator_id !== user.user_id) return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const query = `
      UPDATE ebooks 
      SET name = $1, description = $2, price = $3, category_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE ebook_id = $5
      RETURNING *`;
    const values = [name, description, price, category_id || null, id];
    const result = await pool.query(query, values);

    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Ebook no encontrado' });
    res.json({ success: true, ebook: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/ebooks/:id
 * Solo admin o seller dueño del ebook puede eliminar
 */
router.delete('/:id', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    if (user.role_id === 2) {
      const check = await pool.query('SELECT creator_id FROM ebooks WHERE ebook_id = $1', [id]);
      if (!check.rowCount) return res.status(404).json({ success: false, message: 'Ebook no encontrado' });
      if (check.rows[0].creator_id !== user.user_id) return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const result = await pool.query('DELETE FROM ebooks WHERE ebook_id = $1', [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Ebook no encontrado' });

    res.json({ success: true, message: 'Ebook eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// backend - ebooks.routes.js
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ebook = await pool.query(
      "SELECT * FROM ebooks WHERE ebook_id = $1",
      [id]
    );
    if (ebook.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Ebook no encontrado" });
    }
    res.json({ success: true, ebook: ebook.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al obtener ebook" });
  }
});

// Public pagination routes (no authentication required for catalog viewing)
router.get('/paginated', EbookController.getPaginated);
router.get('/search', EbookController.search);
 

//manage to ebooks_status(new,used,donate)
router.get('/new', authenticateToken, EbookController.getNew)
router.get('/used', authenticateToken, EbookController.getUsed);
router.get('/donate', authenticateToken, EbookController.getDonate);

//defaut ebook_status
router.get('/condition/:condition_id', authenticateToken, EbookController.getByCondition)
export default router;
