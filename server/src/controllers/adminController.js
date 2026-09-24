const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { logAuditEvent } = require('../utils/auditLogger');
const { ITEM_STATUSES, CLAIM_STATUSES, REPORT_STATUSES, NOTIFICATION_TYPES } = require('../config/constants');

// @desc    Admin dashboard summary metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      blockedUsers,
      lostItemsCount,
      foundItemsCount,
      recoveredItemsCount,
      pendingClaimsCount,
      pendingReportsCount,
      totalClaims,
      recentItems,
      recentReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: ITEM_STATUSES.RECOVERED }),
      Claim.countDocuments({ status: CLAIM_STATUSES.PENDING }),
      Report.countDocuments({ status: REPORT_STATUSES.PENDING }),
      Claim.countDocuments(),
      Item.find().sort({ createdAt: -1 }).limit(6).populate('owner', 'name profileImage'),
      Report.find({ status: REPORT_STATUSES.PENDING }).sort({ createdAt: -1 }).limit(5).populate('reporter', 'name email'),
    ]);

    const activeUsers = totalUsers - blockedUsers;
    const totalItems = lostItemsCount + foundItemsCount;
    const recoveryRate = totalItems > 0 ? Math.round((recoveredItemsCount / totalItems) * 100) : 0;

    return sendSuccess(res, 200, 'Admin dashboard stats retrieved', {
      metrics: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalItems,
        lostItemsCount,
        foundItemsCount,
        recoveredItemsCount,
        recoveryRate,
        pendingClaimsCount,
        pendingReportsCount,
        totalClaims,
      },
      recentItems,
      recentReports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users list with search & pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isBlocked, page = 1, limit = 15 } = req.query;
    const query = {};

    if (search) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { studentId: reg }, { department: reg }];
    }

    if (role) query.role = role;
    if (isBlocked !== undefined && isBlocked !== '') query.isBlocked = isBlocked === 'true';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-password'),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Users retrieved', {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
      return sendError(res, 403, 'Cannot block another administrator.');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `User ${user.name} (${user.email}) was ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
    });

    return sendSuccess(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get all items with filtering
// @route   GET /api/admin/items
// @access  Private (Admin)
const getAdminItems = async (req, res, next) => {
  try {
    const { search, type, status, isSuspicious, page = 1, limit = 15 } = req.query;
    const query = {};

    if (search) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ title: reg }, { description: reg }, { location: reg }, { category: reg }];
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (isSuspicious !== undefined && isSuspicious !== '') query.isSuspicious = isSuspicious === 'true';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Item.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Items retrieved for admin', {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete inappropriate item
// @route   DELETE /api/admin/items/:id
// @access  Private (Admin)
const deleteAdminItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    await item.deleteOne();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ITEM_DELETED',
      entityType: 'Item',
      entityId: req.params.id,
      description: `Item "${item.title}" was removed by admin.`,
    });

    return sendSuccess(res, 200, 'Item deleted by admin');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item suspicious flag
// @route   PUT /api/admin/items/:id/flag
// @access  Private (Admin)
const toggleItemSuspicious = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    item.isSuspicious = !item.isSuspicious;
    await item.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      action: item.isSuspicious ? 'ITEM_FLAGGED_SUSPICIOUS' : 'ITEM_UNFLAGGED',
      entityType: 'Item',
      entityId: item._id.toString(),
      description: `Item "${item.title}" was ${item.isSuspicious ? 'marked suspicious' : 'unflagged'}.`,
    });

    return sendSuccess(res, 200, `Item marked as ${item.isSuspicious ? 'suspicious' : 'normal'}`, { item });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get all claims
// @route   GET /api/admin/claims
// @access  Private (Admin)
const getAdminClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('itemId', 'title type images category campusZone status')
        .populate('claimantId', 'name email studentId phone')
        .populate('ownerId', 'name email studentId phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Admin claims retrieved', {
      claims,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get all fraud reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res, next) => {
  try {
    const { status, reason, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (reason) query.reason = reason;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email isBlocked')
        .populate('item', 'title images type status')
        .populate('resolvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Report.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Admin reports retrieved', {
      reports,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or reject report
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return sendError(res, 404, 'Report not found');
    }

    report.status = status || REPORT_STATUSES.RESOLVED;
    if (adminNotes) report.adminNotes = adminNotes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      action: 'REPORT_RESOLVED',
      entityType: 'Report',
      entityId: report._id.toString(),
      description: `Report was updated to status: ${report.status}`,
    });

    return sendSuccess(res, 200, 'Report updated successfully', { report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Categories
// @route   GET /api/admin/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved', { categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, subcategories } = req.body;
    if (!name) return sendError(res, 400, 'Category name is required.');

    const category = await Category.create({
      name: name.trim(),
      icon: icon || 'Package',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
    });

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category._id.toString(),
      description: `Category "${category.name}" created.`,
    });

    return sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return sendError(res, 404, 'Category not found');

    return sendSuccess(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get Campus Locations
// @route   GET /api/admin/locations
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ zone: 1, name: 1 });
    return sendSuccess(res, 200, 'Campus locations retrieved', { locations });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Campus Location
// @route   POST /api/admin/locations
// @access  Private (Admin)
const createLocation = async (req, res, next) => {
  try {
    const { name, zone, building, floor, coordinates } = req.body;
    if (!name || !zone) return sendError(res, 400, 'Name and zone are required');

    const location = await Location.create({
      name: name.trim(),
      zone: zone.trim(),
      building: building || '',
      floor: floor || '',
      coordinates: coordinates || { lat: 0, lng: 0 },
    });

    return sendSuccess(res, 201, 'Location created successfully', { location });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Campus Location
// @route   DELETE /api/admin/locations/:id
// @access  Private (Admin)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return sendError(res, 404, 'Location not found');
    return sendSuccess(res, 200, 'Location deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get Announcements
// @route   GET /api/admin/announcements
// @access  Public
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    return sendSuccess(res, 200, 'Announcements retrieved', { announcements });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Announcement & Broadcast Notification
// @route   POST /api/admin/announcements
// @access  Private (Admin)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return sendError(res, 400, 'Title and content are required.');
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'normal',
      author: req.user._id,
    });

    // Broadcast notification to all active users
    const users = await User.find({ isBlocked: false }).select('_id');
    const notificationDocs = users.map((u) => ({
      userId: u._id,
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: `Campus Announcement: ${announcement.title}`,
      message: announcement.content.slice(0, 140),
      link: '/',
    }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_announcement', announcement);
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      action: 'ANNOUNCEMENT_CREATED',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      description: `Admin published campus announcement: "${announcement.title}"`,
    });

    return sendSuccess(res, 201, 'Announcement published to campus!', { announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Audit logs retrieved', {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Complete Analytics (Real MongoDB aggregations)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Items by Category
    const itemsByCategory = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 2. Items by Campus Zone
    const itemsByZone = await Item.aggregate([
      { $group: { _id: '$campusZone', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 3. Lost vs Found Monthly Trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      trendMap[key] = { month: key, lost: 0, found: 0, recovered: 0 };
    }

    monthlyTrends.forEach((t) => {
      const key = `${monthNames[t._id.month - 1]} ${t._id.year.toString().slice(2)}`;
      if (trendMap[key]) {
        if (t._id.type === 'lost') trendMap[key].lost = t.count;
        if (t._id.type === 'found') trendMap[key].found = t.count;
      }
    });

    // 4. Claims Status Breakdown
    const claimsByStatus = await Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // 5. Total counts summary
    const [totalUsers, totalItems, totalRecovered, totalClaims] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ status: ITEM_STATUSES.RECOVERED }),
      Claim.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Analytics retrieved', {
      summary: {
        totalUsers,
        totalItems,
        totalRecovered,
        totalClaims,
        recoveryRate: totalItems > 0 ? Math.round((totalRecovered / totalItems) * 100) : 0,
      },
      itemsByCategory,
      itemsByZone,
      monthlyTrends: Object.values(trendMap),
      claimsByStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
