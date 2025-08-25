import { Router } from "express";
import { AuthController } from "../Controllers/AuthController.js";
import { authenticateToken, requireRole } from "../Middleware/auth.js";

const router = Router();

// Perfil de usuario (privado)
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put("/profile", authenticateToken, AuthController.updateProfile);
router.put("/profile/password", authenticateToken, AuthController.changePassword);

// Admin: gestión de usuarios
router.get("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      "SELECT user_id, name, email, phone, role_id, created_at FROM users ORDER BY user_id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await req.app.locals.pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id", 
      [id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
