// Controllers/AddressController.js
import { Address } from '../Models/Addresses.js';

export const AddressController = {
  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const addresses = await Address.findByUserId(user_id);
      res.json({ success: true, addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener direcciones', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const { street, city, state, postal_code, country, is_default } = req.body;
      if (!street || !city || !state || !postal_code || !country)
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });

      const address = await Address.create({ user_id, street, city, state, postal_code, country, is_default });
      res.status(201).json({ success: true, address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creando dirección', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;
      const data = req.body;

      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const address = await Address.update(id, user_id, data);
      if (!address) return res.status(404).json({ success: false, message: 'Dirección no encontrada' });

      res.json({ success: true, address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error actualizando dirección', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const deleted = await Address.delete(id, user_id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Dirección no encontrada' });

      res.json({ success: true, message: 'Dirección eliminada' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error eliminando dirección', error: error.message });
    }
  },
};
