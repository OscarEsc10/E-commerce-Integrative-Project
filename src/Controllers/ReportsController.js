// Controllers/ReportController.js
import { Report } from '../Models/Reports.js';

export const ReportController = {
  /**
   * @desc Generate sales summary reports
   * @route GET /api/reports/summary
   * @access Private (Admin/Seller depending on auth)
   */
  getSalesSummary: async (req, res) => {
    try {
      // Fetch invoices data
      const invoices = await Report.getSalesSummary();

      // Fetch aggregated payment status (paid, pending, etc.)
      const paymentStatus = await Report.getPaymentStatus();

      // Fetch breakdown of payment methods (credit, cash, etc.)
      const paymentMethods = await Report.getPaymentMethods();

      // Fetch monthly sales totals
      const monthlySales = await Report.getMonthlySales();

      // Respond with all reporting data
      res.json({
        success: true,
        invoices,
        paymentStatus,
        paymentMethods,
        monthlySales
      });
    } catch (err) {
      console.error("Error generating reports:", err);
      res.status(500).json({
        success: false,
        message: 'Error generating reports',
        error: err.message
      });
    }
  },

  /**
   * @desc Get sales by specific seller/user
   * @route GET /api/reports/sales/:id
   * @param {String} id - Seller/User ID (from URL params)
   * @access Private (Seller/Admin depending on auth)
   */
  getSalesByUser: async (req, res) => {
    try {
      const userId = req.params.id; // Extract seller ID from route parameter

      // Query sales data filtered by this seller's userId
      const sellerSales = await Report.getSalesByUser(userId);

      // Respond with the seller's sales
      res.json({
        success: true,
        sales: sellerSales
      });
    } catch (err) {
      console.error("Error fetching seller's sales:", err);
      res.status(500).json({
        success: false,
        message: 'Error fetching seller sales',
        error: err.message
      });
    }
  }
};
