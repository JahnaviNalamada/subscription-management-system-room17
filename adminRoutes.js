const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, verifyAdminOTP, getAdminDashboard } = require('../controllers/adminController');
const roleMiddleware = require('../middleware/roleMiddleware');

// 🔐 Admin Registration
router.post('/api/admin/register', registerAdmin);

// 🔐 Admin Login
router.post('/api/admin/login', loginAdmin);
router.post('/api/admin/verify-otp', verifyAdminOTP);

// 🛡️ Protected Admin Dashboard (only for admin/superadmin)
router.get('/dashboard', roleMiddleware(['admin', 'superadmin']), getAdminDashboard);

module.exports = router;