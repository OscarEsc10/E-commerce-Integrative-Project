import { User } from "../Models/User.js";

export const UserController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const result = await User.create(req.body);
      if (!result.success) return res.status(400).json(result);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const result = await User.update(req.params.id, req.body);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const result = await User.delete(req.params.id);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
