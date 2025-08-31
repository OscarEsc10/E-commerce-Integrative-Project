// Controllers/ReportController.js
import { Report } from '../Models/Reports.js';

export const ReportController = {
  getSalesSummary: async (req, res) => {
    try {
      const invoices = await Report.getSalesSummary();
      const paymentStatus = await Report.getPaymentStatus();
      const paymentMethods = await Report.getPaymentMethods();
      const monthlySales = await Report.getMonthlySales();

      res.json({
        success: true,
        invoices,
        paymentStatus,
        paymentMethods,
        monthlySales
      });
    } catch (err) {
      console.error("Error generando reportes:", err);
      res.status(500).json({
        success: false,
        message: 'Error generando reportes',
        error: err.message
      });
    }
  },

    getSalesByUser: async (req, res) => {
      try {
      const userId = req.params.id; // id del seller
      const sellerSales = await Report.getSalesByUser(userId); // método que filtrará por userId

      res.json({
        success: true,
        sales: sellerSales
      });
    } catch (err) {
      console.error("Error trayendo ventas del seller:", err);
      res.status(500).json({
        success: false,
        message: 'Error trayendo ventas del seller',
        error: err.message
      });
    }
  }

};
