module.exports = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  ITEM_TYPES: {
    LOST: 'lost',
    FOUND: 'found',
  },

  ITEM_STATUSES: {
    ACTIVE: 'active',
    POSSIBLE_MATCH: 'possible_match',
    CLAIM_PENDING: 'claim_pending',
    CLAIMED: 'claimed',
    RECOVERED: 'recovered',
    CLOSED: 'closed',
  },

  CLAIM_STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  REPORT_STATUSES: {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed',
  },

  REPORT_REASONS: [
    'fake_listing',
    'scam',
    'inappropriate',
    'duplicate',
    'suspicious_claim',
    'incorrect_information',
    'other',
  ],

  NOTIFICATION_TYPES: {
    POSSIBLE_MATCH: 'possible_match',
    CLAIM_RECEIVED: 'claim_received',
    CLAIM_APPROVED: 'claim_approved',
    CLAIM_REJECTED: 'claim_rejected',
    MESSAGE: 'message',
    ITEM_RECOVERED: 'item_recovered',
    SMART_ALERT: 'smart_alert',
    ANNOUNCEMENT: 'announcement',
    SYSTEM: 'system',
  },

  CAMPUS_ZONES: [
    'Main Block / Academic Quad',
    'Central Library',
    'Student Activity Center (SAC)',
    'Food Court & Canteen',
    'North Hostels (A, B, C)',
    'South Hostels (D, E, F)',
    'Engineering & Tech Labs',
    'Science Complex',
    'Sports Complex & Playground',
    'Main Auditorium & Amphitheatre',
    'Administration Building',
    'Campus Parking Lot (East/West)',
    'Medical & Health Center',
    'Campus Bus Stop / Gate 1 & 2',
    'Other / Off-Campus Vicinity',
  ],

  DEFAULT_CATEGORIES: [
    {
      name: 'Electronics & Gadgets',
      icon: 'Laptop',
      subcategories: ['Laptops', 'Smartphones', 'Tablets', 'Headphones & Earbuds', 'Smartwatches', 'Chargers & Power Banks', 'Calculators', 'Cables & Adapters'],
    },
    {
      name: 'ID Cards & Wallets',
      icon: 'CreditCard',
      subcategories: ['Student ID Card', 'Driver License', 'Wallet / Purse', 'Bank / ATM Cards', 'Keys / Keychains', 'Metro / Bus Pass'],
    },
    {
      name: 'Bags & Luggage',
      icon: 'Briefcase',
      subcategories: ['Backpacks', 'Handbags', 'Laptop Bags', 'Gym / Duffle Bags', 'Pouches'],
    },
    {
      name: 'Books & Stationery',
      icon: 'BookOpen',
      subcategories: ['Textbooks', 'Notebooks / Folders', 'Pencil Cases', 'Drawing Kits / Drafter', 'Lab Manuals'],
    },
    {
      name: 'Clothing & Accessories',
      icon: 'Shirt',
      subcategories: ['Jackets & Hoodies', 'Watches & Jewelry', 'Spectacles / Sunglasses', 'Caps & Hats', 'Umbrellas', 'Footwear'],
    },
    {
      name: 'Sports & Fitness Equipment',
      icon: 'Activity',
      subcategories: ['Badminton / Tennis Rackets', 'Basketball / Football', 'Water Bottles', 'Gym Gear', 'Bicycles / Helmets'],
    },
    {
      name: 'Personal & Miscellaneous',
      icon: 'Package',
      subcategories: ['Eyeglasses Case', 'Thermos / Flask', 'Musical Instruments', 'Cosmetics', 'Others'],
    },
  ],

  BADGE_DEFINITIONS: {
    HELPFUL_FINDER: {
      id: 'helpful_finder',
      name: 'Helpful Finder',
      description: 'Found and reported items to help campus peers',
      icon: 'Award',
      minRecoveries: 1,
    },
    FIRST_RECOVERY: {
      id: 'first_recovery',
      name: 'First Recovery',
      description: 'Successfully reconnected an owner with their lost item',
      icon: 'CheckCircle',
      minRecoveries: 1,
    },
    TRUSTED_USER: {
      id: 'trusted_user',
      name: 'Trusted User',
      description: 'Maintained a high reputation score with authentic claims and reports',
      icon: 'ShieldCheck',
      minScore: 50,
    },
    COMMUNITY_HERO: {
      id: 'community_hero',
      name: 'Community Hero',
      description: 'Returned 5 or more lost items safely back to campus owners',
      icon: 'HeartHandshake',
      minRecoveries: 5,
    },
    GUARDIAN: {
      id: 'guardian',
      name: 'Campus Guardian',
      description: '10+ successful recoveries completed with excellence',
      icon: 'Crown',
      minRecoveries: 10,
    },
  },

  // Algorithm matching weights (sum = 100)
  MATCHING_WEIGHTS: {
    CATEGORY: 25,
    NAME_DESCRIPTION: 25,
    BRAND_MODEL: 15,
    LOCATION: 15,
    COLOR: 10,
    DATE: 10,
  },
};
