const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getAdminItems,
  deleteAdminItem,
  toggleItemSuspicious,
  getAdminClaims,
  getAdminReports,
  resolveReport,
  getCategories,
  createCategory,
  deleteCategory,
  getLocations,
  createLocation,
  deleteLocation,
  getAnnouncements,
  createAnnouncement,
  getAuditLogs,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Public categories and locations routes (for forms and browsing)
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/announcements', getAnnouncements);

// Protected admin-only routes below
router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

router.get('/items', getAdminItems);
router.delete('/items/:id', deleteAdminItem);
router.put('/items/:id/flag', toggleItemSuspicious);

router.get('/claims', getAdminClaims);

router.get('/reports', getAdminReports);
router.put('/reports/:id', resolveReport);

router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/locations', createLocation);
router.delete('/locations/:id', deleteLocation);

router.post('/announcements', createAnnouncement);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

module.exports = router;
