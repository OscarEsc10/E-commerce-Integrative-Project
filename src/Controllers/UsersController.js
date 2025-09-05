import { User } from "../Models/User.js";

export const UserController = {
  // Get all users from the database
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll(); // Call model method
      res.json({ success: true, users }); // Return all users
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get a single user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id); // Look for user in DB
      if (!user) {
        // If no user found, return 404
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, user }); // Return the user data
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create a new user
  createUser: async (req, res) => {
    try {
      const result = await User.create(req.body); // Call model to insert
      if (!result.success) {
        // If model returns an error (like validation failed)
        return res.status(400).json(result);
      }
      res.status(201).json(result); // Return created user
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update an existing user
  updateUser: async (req, res) => {
    try {
      const result = await User.update(req.params.id, req.body); // Update in DB
      if (!result.success) {
        // If something went wrong (like user doesn’t exist)
        return res.status(400).json(result);
      }
      res.json(result); // Return updated data
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete a user
  deleteUser: async (req, res) => {
    try {
      const result = await User.delete(req.params.id); // Delete from DB
      if (!result.success) {
        // If user wasn’t found
        return res.status(404).json(result);
      }
      res.json(result); // Return deletion confirmation
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
