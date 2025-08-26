import { Router } from "express";
import { UserController } from "../Controllers/UsersController.js";
import { authenticateToken, requireRole } from "../Middleware/auth.js";

const router = Router();

// Todos los endpoints requieren rol admin
router.use(authenticateToken, requireRole(["admin"]));

// CRUD completo de usuarios

// Listar todos los usuarios
router.get("/", UserController.getAllUsers);

// Obtener usuario por ID
router.get("/:id", UserController.getUserById);

// Crear nuevo usuario
router.post("/", UserController.createUser);

// Actualizar usuario
router.put("/:id", UserController.updateUser);

// Eliminar usuario
router.delete("/:id", UserController.deleteUser);

export default router;
