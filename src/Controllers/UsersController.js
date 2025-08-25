import { User } from "../Models/User.js";

export class UsersController {
  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("❌ Error en getAll:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      // Si no es admin, solo puede ver su propio perfil
      if (req.user.role_id !== 1 && req.user.user_id !== parseInt(id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("❌ Error en getById:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  /**
   * Crear usuario (registro público)
   */
  static async create(req, res) {
    try {
      const { name, email, password, phone, role_id } = req.body;

      const result = await User.create({
        name,
        email,
        password,
        phone,
        role_id: role_id || 3 // CUSTOMER por defecto
      });

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }

      res.status(201).json({ success: true, data: result.user });
    } catch (error) {
      console.error("❌ Error en create:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  /**
   * Actualizar usuario
   */
  static async update(req, res) {
    try {
      const { id } = req.params;

      // Solo admin o el propio usuario puede actualizar
      if (req.user.role_id !== 1 && req.user.user_id !== parseInt(id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const result = await User.update(id, req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }

      res.json({ success: true, data: result.user });
    } catch (error) {
      console.error("❌ Error en update:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  /**
   * Eliminar usuario
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role_id !== 1) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const result = await User.delete(id);
      if (!result.success) {
        return res.status(404).json({ success: false, message: result.message });
      }

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("❌ Error en delete:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}
