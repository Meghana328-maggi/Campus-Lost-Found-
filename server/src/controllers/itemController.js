const Item = require('../models/Item');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { processUploadedFiles } = require('../utils/uploadService');
const { processAlertsForItem } = require('../services/alertService');
const { findMatchesForItem, checkPotentialDuplicates } = require('../services/matchingService');
const { awardPointsAndCheckBadges } = require('../services/reputationService');
const { ITEM_STATUSES, ITEM_TYPES, ROLES } = require('../config/constants');

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      category,
      subcategory,
      brand,
      model,
      color,
      size,
      serialNumber,
      uniqueFeatures,
      dateLostOrFound,
      approximateTime,
      location,
      campusZone,
      condition,
      currentStorageLocation,
      hiddenVerification,
      isUrgent,
      isAnonymous,
      tags,
      coordinates,
    } = req.body;

    if (!title || !description || !type || !category || !dateLostOrFound || !location || !campusZone) {
      return sendError(res, 400, 'Please provide all required fields (title, description, type, category, date, location, campus zone).');
    }

    // Process uploaded images
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await processUploadedFiles(req.files, req);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      uploadedImages = req.body.images;
    }

    // Parse hiddenVerification if sent as stringified JSON in multipart/form-data
    let parsedHiddenVerification = [];
    if (hiddenVerification) {
      try {
        parsedHiddenVerification =
          typeof hiddenVerification === 'string' ? JSON.parse(hiddenVerification) : hiddenVerification;
      } catch (e) {
        parsedHiddenVerification = [];
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    // Parse coordinates
    let parsedCoords = { lat: null, lng: null };
    if (coordinates) {
      try {
        parsedCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      } catch (e) {}
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      subcategory: subcategory || '',
      brand: brand || '',
      model: model || '',
      color: color || '',
      size: size || '',
      serialNumber: serialNumber || '',
      uniqueFeatures: uniqueFeatures || '',
      images: uploadedImages,
      dateLostOrFound: new Date(dateLostOrFound),
      approximateTime: approximateTime || '',
      location: location.trim(),
      campusZone,
      condition: condition || 'good',
      currentStorageLocation: currentStorageLocation || '',
      hiddenVerification: parsedHiddenVerification,
      owner: req.user._id,
      isUrgent: isUrgent === true || isUrgent === 'true',
      isAnonymous: isAnonymous === true || isAnonymous === 'true',
      tags: parsedTags,
      coordinates: parsedCoords,
      status: ITEM_STATUSES.ACTIVE,
    });

    // Update user stats and reputation
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsReportedCount: 1 } });
    await awardPointsAndCheckBadges(req.user._id, 5, 'Reported an item');

    // Trigger smart alerts in background
    const io = req.app.get('io');
    processAlertsForItem(item, io).catch((err) => console.error(err));

    return sendSuccess(res, 201, `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`, { item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items with advanced search, filters, pagination, and sorting
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      subcategory,
      campusZone,
      search,
      status,
      isUrgent,
      startDate,
      endDate,
      color,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by type (lost / found)
    if (type && Object.values(ITEM_TYPES).includes(type)) {
      query.type = type;
    }

    // Filter by status (default to active unless specified)
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.POSSIBLE_MATCH, ITEM_STATUSES.CLAIM_PENDING] };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by subcategory
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Filter by campusZone
    if (campusZone && campusZone !== 'All') {
      query.campusZone = campusZone;
    }

    // Filter by urgent
    if (isUrgent === 'true' || isUrgent === true) {
      query.isUrgent = true;
    }

    // Filter by color
    if (color) {
      query.color = new RegExp(color.trim(), 'i');
    }

    // Filter by date range
    if (startDate || endDate) {
      query.dateLostOrFound = {};
      if (startDate) query.dateLostOrFound.$gte = new Date(startDate);
      if (endDate) query.dateLostOrFound.$lte = new Date(endDate);
    }

    // Full text / keyword search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { location: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'views') {
      sortOption = { viewCount: -1 };
    } else if (sort === 'date_asc') {
      sortOption = { dateLostOrFound: 1 };
    } else if (sort === 'date_desc') {
      sortOption = { dateLostOrFound: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name profileImage college reputationScore badges')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    // Mask anonymous poster details
    const sanitizedItems = items.map((item) => {
      if (item.isAnonymous) {
        return {
          ...item,
          owner: {
            name: 'Anonymous Student',
            profileImage: '',
            college: item.owner?.college || 'Campus University',
          },
        };
      }
      return item;
    });

    const totalPages = Math.ceil(totalItems / limitNum);

    return sendSuccess(res, 200, 'Items retrieved successfully', {
      items: sanitizedItems,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item details
// @route   GET /api/items/:id
// @access  Public (Optional auth for hidden verification masking)
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email phone profileImage college department reputationScore badges')
      .populate('recoveredBy', 'name profileImage')
      .populate('recoveryFeedback');

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    // Increment view count asynchronously
    Item.findByIdAndUpdate(item._id, { $inc: { viewCount: 1 } }).exec();

    const itemObj = item.toObject();

    // Check if the requester is the item owner or an admin
    const isOwner = req.user && req.user._id.toString() === item.owner._id.toString();
    const isAdmin = req.user && req.user.role === ROLES.ADMIN;

    // Mask hidden verification questions & answers if not owner or admin!
    if (!isOwner && !isAdmin) {
      // Expose only questions (NOT answers) so claimant knows what to verify!
      if (itemObj.hiddenVerification && itemObj.hiddenVerification.length > 0) {
        itemObj.hiddenVerification = itemObj.hiddenVerification.map((v) => ({
          question: v.question,
          answer: undefined, // Hidden from public!
        }));
      }
      // Mask serial number
      if (itemObj.serialNumber) {
        itemObj.serialNumber = itemObj.serialNumber.slice(0, 2) + '****';
      }
    }

    // Mask owner info if anonymous and requester is not owner/admin
    if (itemObj.isAnonymous && !isOwner && !isAdmin) {
      itemObj.owner = {
        name: 'Anonymous Student',
        profileImage: '',
        college: itemObj.owner?.college || 'Campus University',
      };
    }

    return sendSuccess(res, 200, 'Item retrieved successfully', { item: itemObj, isOwner });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = req.user._id.toString() === item.owner.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to edit this listing.');
    }

    // Allowed updates
    const updatableFields = [
      'title',
      'description',
      'category',
      'subcategory',
      'brand',
      'model',
      'color',
      'size',
      'uniqueFeatures',
      'location',
      'campusZone',
      'condition',
      'currentStorageLocation',
      'isUrgent',
      'isAnonymous',
      'status',
      'tags',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.files && req.files.length > 0) {
      const newImages = await processUploadedFiles(req.files, req);
      item.images = [...item.images, ...newImages];
    }

    await item.save();

    return sendSuccess(res, 200, 'Item updated successfully', { item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = req.user._id.toString() === item.owner.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to delete this listing.');
    }

    await item.deleteOne();

    return sendSuccess(res, 200, 'Item deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get possible matches for an item
// @route   GET /api/items/:id/matches
// @access  Public
const getItemMatches = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const matches = await findMatchesForItem(item);

    return sendSuccess(res, 200, 'Possible matches retrieved', {
      targetItem: {
        _id: item._id,
        title: item.title,
        type: item.type,
        category: item.category,
      },
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check potential duplicates before reporting
// @route   POST /api/items/check-duplicates
// @access  Public
const checkDuplicates = async (req, res, next) => {
  try {
    const { title, description, category, type, campusZone } = req.body;
    if (!title || !type) {
      return sendSuccess(res, 200, 'Duplicates checked', { duplicates: [] });
    }

    const duplicates = await checkPotentialDuplicates({
      title,
      description: description || '',
      category: category || '',
      type,
      campusZone: campusZone || '',
    });

    return sendSuccess(res, 200, 'Duplicates checked', { duplicates });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item as recovered
// @route   PUT /api/items/:id/recover
// @access  Private (Owner or Admin)
const markItemRecovered = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = req.user._id.toString() === item.owner.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Unauthorized to update recovery status.');
    }

    item.status = ITEM_STATUSES.RECOVERED;
    item.recoveredAt = new Date();
    await item.save();

    // Reward points for recovery
    await awardPointsAndCheckBadges(item.owner, 30, 'Item recovered');
    await User.findByIdAndUpdate(item.owner, { $inc: { itemsRecoveredCount: 1 } });

    return sendSuccess(res, 200, 'Item marked as recovered! Congratulations!', { item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's items
// @route   GET /api/items/user/me
// @access  Private
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Your items retrieved', { items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches,
  checkDuplicates,
  markItemRecovered,
  getMyItems,
};
