try {
  const path = require('path');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config();
} catch (err) {
  // Dotenv is optional in production
}
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Announcement = require('../models/Announcement');
const SmartAlert = require('../models/SmartAlert');
const AuditLog = require('../models/AuditLog');
const { DEFAULT_CATEGORIES, CAMPUS_ZONES, ITEM_STATUSES, CLAIM_STATUSES } = require('../config/constants');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing development collections
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      Category.deleteMany({}),
      Location.deleteMany({}),
      Announcement.deleteMany({}),
      SmartAlert.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data...');

    // 1. Seed Categories
    const categoryDocs = await Category.insertMany(DEFAULT_CATEGORIES);
    console.log(`[Seed] Created ${categoryDocs.length} categories.`);

    // 2. Seed Campus Locations
    const locationDocs = await Location.insertMany([
      { name: 'Central Library - 2nd Floor Quiet Zone', zone: 'Central Library', building: 'Library Block', floor: '2nd Floor' },
      { name: 'Central Library - Circulation & Issue Desk', zone: 'Central Library', building: 'Library Block', floor: 'Ground Floor' },
      { name: 'Student Activity Center (SAC) - Gymnasium', zone: 'Student Activity Center (SAC)', building: 'SAC', floor: '1st Floor' },
      { name: 'Student Activity Center (SAC) - Cafeteria', zone: 'Student Activity Center (SAC)', building: 'SAC', floor: 'Ground Floor' },
      { name: 'Food Court & Main Canteen', zone: 'Food Court & Canteen', building: 'Dining Complex', floor: 'Ground Floor' },
      { name: 'Engineering Block - Computer Lab 3', zone: 'Engineering & Tech Labs', building: 'Block E', floor: '3rd Floor' },
      { name: 'Main Auditorium Foyer', zone: 'Main Auditorium & Amphitheatre', building: 'Auditorium', floor: 'Ground Floor' },
      { name: 'North Hostel - Block B Common Room', zone: 'North Hostels (A, B, C)', building: 'Hostel B', floor: 'Ground Floor' },
      { name: 'Campus East Parking Lot Bike Stand', zone: 'Campus Parking Lot (East/West)', building: 'Parking Lot', floor: 'Ground' },
    ]);
    console.log(`[Seed] Created ${locationDocs.length} campus locations.`);

    // 3. Seed Users (Development Accounts)
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campuslostfound.edu',
      password: 'AdminPass123!',
      phone: '+1 (555) 019-2831',
      college: 'Campus Institute of Technology',
      department: 'Campus Security & Administration',
      year: 'Staff / Admin',
      studentId: 'ADMIN-001',
      role: 'admin',
      isVerified: true,
      reputationScore: 100,
      badges: [
        { id: 'guardian', name: 'Campus Guardian', description: 'Platform Administrator', icon: 'Crown' },
        { id: 'trusted_user', name: 'Trusted User', description: 'Verified Campus Official', icon: 'ShieldCheck' },
      ],
    });

    const studentPriya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@campuslostfound.edu',
      password: 'UserPass123!',
      phone: '+1 (555) 234-5678',
      college: 'School of Engineering',
      department: 'Computer Science',
      year: '3rd Year',
      studentId: 'CS2023-089',
      role: 'user',
      isVerified: true,
      reputationScore: 65,
      badges: [
        { id: 'helpful_finder', name: 'Helpful Finder', description: 'Reported found items to aid peers', icon: 'Award' },
        { id: 'first_recovery', name: 'First Recovery', description: 'Reconnected an owner with their item', icon: 'CheckCircle' },
        { id: 'trusted_user', name: 'Trusted User', description: 'High integrity platform member', icon: 'ShieldCheck' },
      ],
      itemsReportedCount: 4,
      itemsRecoveredCount: 2,
    });

    const studentAlex = await User.create({
      name: 'Alex Johnson',
      email: 'alex@campuslostfound.edu',
      password: 'UserPass123!',
      phone: '+1 (555) 876-5432',
      college: 'School of Business',
      department: 'Information Systems',
      year: '2nd Year',
      studentId: 'IS2024-042',
      role: 'user',
      isVerified: true,
      reputationScore: 35,
      badges: [
        { id: 'first_recovery', name: 'First Recovery', description: 'Recovered lost belonging', icon: 'CheckCircle' },
      ],
      itemsReportedCount: 2,
      itemsRecoveredCount: 1,
    });

    const studentRahul = await User.create({
      name: 'Rahul Patel',
      email: 'rahul@campuslostfound.edu',
      password: 'UserPass123!',
      phone: '+1 (555) 998-1122',
      college: 'School of Sciences',
      department: 'Physics',
      year: '4th Year',
      studentId: 'PH2022-114',
      role: 'user',
      isVerified: true,
      reputationScore: 20,
      badges: [],
      itemsReportedCount: 1,
      itemsRecoveredCount: 0,
    });

    const studentSneha = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@campuslostfound.edu',
      password: 'UserPass123!',
      phone: '+1 (555) 443-2211',
      college: 'School of Architecture & Design',
      department: 'Urban Planning',
      year: '3rd Year',
      studentId: 'AR2023-019',
      role: 'user',
      isVerified: true,
      reputationScore: 45,
      badges: [
        { id: 'helpful_finder', name: 'Helpful Finder', description: 'Reported found items to aid peers', icon: 'Award' },
      ],
      itemsReportedCount: 3,
      itemsRecoveredCount: 1,
    });

    const studentDavid = await User.create({
      name: 'David Kim',
      email: 'david@campuslostfound.edu',
      password: 'UserPass123!',
      phone: '+1 (555) 776-8899',
      college: 'School of Medicine & Health',
      department: 'Biochemistry',
      year: '1st Year',
      studentId: 'MD2025-055',
      role: 'user',
      isVerified: true,
      reputationScore: 25,
      badges: [],
      itemsReportedCount: 2,
      itemsRecoveredCount: 0,
    });

    console.log('[Seed] Created admin and 5 student users.');

    // 4. Seed Items
    // Lost Item 1: MacBook Air (Alex)
    const lostMacbook = await Item.create({
      title: 'Apple MacBook Air M2 13-inch',
      description: 'Lost my space gray MacBook Air M2 inside a dark blue incase sleeve. Has a small GitHub Octocat sticker on the bottom right corner of the top lid.',
      type: 'lost',
      category: 'Electronics & Gadgets',
      subcategory: 'Laptops',
      brand: 'Apple',
      model: 'MacBook Air M2',
      color: 'Space Gray',
      size: '13-inch',
      serialNumber: 'C02XK98101',
      uniqueFeatures: 'GitHub sticker and small dent on back left hinge',
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', publicId: 'demo-macbook-1' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      approximateTime: '3:30 PM',
      location: 'Central Library - 2nd Floor Quiet Study Area Table 14',
      campusZone: 'Central Library',
      condition: 'good',
      owner: studentAlex._id,
      status: ITEM_STATUSES.POSSIBLE_MATCH,
      isUrgent: true,
      tags: ['apple', 'macbook', 'laptop', 'space gray', 'library'],
      viewCount: 42,
    });

    // Found Item 1: MacBook Air (Priya found it!) -> MATCH
    const foundMacbook = await Item.create({
      title: 'Apple MacBook Air Space Gray Laptop',
      description: 'Found an Apple MacBook in a dark blue protective sleeve on a study desk on the second floor of the Central Library. Handed over to library security desk.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Laptops',
      brand: 'Apple',
      model: 'MacBook Air',
      color: 'Space Gray',
      size: '13-inch',
      uniqueFeatures: 'Has a tech developer sticker on the lid',
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', publicId: 'demo-macbook-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      approximateTime: '4:15 PM',
      location: 'Central Library - 2nd Floor Study Desk',
      campusZone: 'Central Library',
      condition: 'good',
      currentStorageLocation: 'Central Library Circulation & Security Desk',
      hiddenVerification: [
        { question: 'What sticker is on the lid and what color is the sleeve?', answer: 'GitHub Octocat sticker, dark blue sleeve' },
        { question: 'What user profile name appears on the lock screen?', answer: 'Alex J' },
      ],
      owner: studentPriya._id,
      status: ITEM_STATUSES.POSSIBLE_MATCH,
      isUrgent: false,
      tags: ['apple', 'macbook', 'laptop', 'library'],
      viewCount: 68,
    });

    // Lost Item 2: Casio Calculator (Rahul)
    const lostCalculator = await Item.create({
      title: 'Casio ClassWiz Scientific Calculator fx-991EX',
      description: 'Black scientific calculator with white buttons. Has my initials "RP" written with black marker on the back battery cover.',
      type: 'lost',
      category: 'Electronics & Gadgets',
      subcategory: 'Calculators',
      brand: 'Casio',
      model: 'fx-991EX',
      color: 'Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=800&q=80', publicId: 'demo-calc' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Engineering Block - Computer Lab 3',
      campusZone: 'Engineering & Tech Labs',
      condition: 'good',
      owner: studentRahul._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['calculator', 'casio', 'lab', 'engineering'],
      viewCount: 15,
    });

    // Found Item 2: Leather Wallet with ID (Priya found)
    const foundWallet = await Item.create({
      title: 'Brown Leather Bi-fold Wallet with ID & Cards',
      description: 'Found a brown genuine leather wallet on one of the tables near the juice stall in the main food court. Contains cash and campus ID card.',
      type: 'found',
      category: 'ID Cards & Wallets',
      subcategory: 'Wallet / Purse',
      brand: 'Fossil',
      color: 'Brown',
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', publicId: 'demo-wallet' }
      ],
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approximateTime: '1:30 PM',
      location: 'Main Food Court - Table next to Green Juice Counter',
      campusZone: 'Food Court & Canteen',
      condition: 'good',
      currentStorageLocation: 'Campus Security Main Office - Locker #12',
      hiddenVerification: [
        { question: 'What is the full name and student ID on the campus card inside?', answer: 'Alex Johnson IS2024-042' },
        { question: 'What bank card brand is present inside?', answer: 'Chase Debit Card' },
      ],
      owner: studentPriya._id,
      status: ITEM_STATUSES.CLAIM_PENDING,
      isUrgent: true,
      tags: ['wallet', 'leather', 'canteen', 'id card'],
      viewCount: 89,
    });

    // Found Item 3: Sony Wireless Headphones (Recovered item demo)
    const recoveredHeadphones = await Item.create({
      title: 'Sony WH-1000XM4 Noise-Cancelling Headphones',
      description: 'Found black over-ear Sony headphones in their zip carrying case at the SAC gymnasium bench.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Headphones & Earbuds',
      brand: 'Sony',
      model: 'WH-1000XM4',
      color: 'Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', publicId: 'demo-headphones' }
      ],
      dateLostOrFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: 'SAC Gymnasium - Bench near Water Dispenser',
      campusZone: 'Student Activity Center (SAC)',
      condition: 'good',
      owner: studentPriya._id,
      status: ITEM_STATUSES.RECOVERED,
      recoveredBy: studentAlex._id,
      recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isUrgent: false,
      tags: ['sony', 'headphones', 'audio', 'sac'],
      viewCount: 110,
    });

    // Lost Item 4: Hydro Flask Water Bottle (Priya lost)
    const lostBottle = await Item.create({
      title: 'Cobalt Blue Hydro Flask Wide Mouth 32 oz',
      description: 'Cobalt blue metal insulated bottle with straw lid and black boot on the bottom. Has a National Parks sticker.',
      type: 'lost',
      category: 'Sports & Fitness Equipment',
      subcategory: 'Water Bottles',
      brand: 'Hydro Flask',
      color: 'Blue',
      size: '32 oz',
      images: [
        { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', publicId: 'demo-bottle' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Sports Complex Playground Bleachers',
      campusZone: 'Sports Complex & Playground',
      condition: 'good',
      owner: studentPriya._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['bottle', 'hydro flask', 'sports'],
      viewCount: 19,
    });

    // Lost Item 5: Apple AirPods Pro (David)
    const lostAirPods = await Item.create({
      title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case',
      description: 'White AirPods Pro earbuds in wireless charging case with a navy blue silicone protector and small metallic clip. Misplaced during study session in library.',
      type: 'lost',
      category: 'Electronics & Gadgets',
      subcategory: 'Headphones & Earbuds',
      brand: 'Apple',
      model: 'AirPods Pro 2',
      color: 'White',
      images: [
        { url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', publicId: 'demo-airpods-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Central Library - 1st Floor Group Study Room B',
      campusZone: 'Central Library',
      condition: 'good',
      owner: studentDavid._id,
      status: ITEM_STATUSES.POSSIBLE_MATCH,
      isUrgent: true,
      tags: ['apple', 'airpods', 'headphones', 'earbuds', 'library'],
      viewCount: 54,
    });

    // Found Item 4: Apple AirPods Pro in Charging Case (Sneha found)
    const foundAirPods = await Item.create({
      title: 'Apple AirPods Pro in White Case with Navy Blue Sleeve',
      description: 'Found a pair of Apple AirPods Pro inside their charging case wrapped in a navy blue silicone sleeve on the desk in Group Study Room B.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Headphones & Earbuds',
      brand: 'Apple',
      model: 'AirPods Pro',
      color: 'White',
      images: [
        { url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', publicId: 'demo-airpods-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approximateTime: '5:45 PM',
      location: 'Central Library - 1st Floor Study Room B',
      campusZone: 'Central Library',
      condition: 'good',
      currentStorageLocation: 'Library Front Issue Desk Lost Property Box',
      hiddenVerification: [
        { question: 'What Bluetooth device name is broadcast when opening the lid?', answer: "David's AirPods Pro" },
        { question: 'What type of silicone case is it in?', answer: 'Navy blue silicone case with metal clip' }
      ],
      owner: studentSneha._id,
      status: ITEM_STATUSES.POSSIBLE_MATCH,
      isUrgent: true,
      tags: ['apple', 'airpods', 'headphones', 'library'],
      viewCount: 76,
    });

    // Lost Item 6: TI-84 Plus CE Graphing Calculator (Rahul)
    const lostTICalc = await Item.create({
      title: 'Texas Instruments TI-84 Plus CE Graphing Calculator (Mint Green)',
      description: 'Mint green color TI-84 Plus CE edition graphing calculator. Essential for my differential equations exam this Friday!',
      type: 'lost',
      category: 'Electronics & Gadgets',
      subcategory: 'Calculators',
      brand: 'Texas Instruments',
      model: 'TI-84 Plus CE',
      color: 'Mint Green',
      images: [
        { url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80', publicId: 'demo-ti84' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Engineering Block - 2nd Floor Room E-204',
      campusZone: 'Engineering & Tech Labs',
      condition: 'good',
      owner: studentRahul._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['calculator', 'math', 'engineering', 'texas instruments'],
      viewCount: 38,
    });

    // Found Item 5: Texas Instruments Calculator (Priya found)
    const foundTICalc = await Item.create({
      title: 'Mint Green Texas Instruments TI-84 Graphing Calculator',
      description: 'Discovered on desk #12 in Room E-204 following afternoon lectures. Handed to department coordinator.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Calculators',
      brand: 'Texas Instruments',
      model: 'TI-84 Plus CE',
      color: 'Mint Green',
      images: [
        { url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80', publicId: 'demo-ti84-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Engineering Block - Room E-204',
      campusZone: 'Engineering & Tech Labs',
      condition: 'good',
      currentStorageLocation: 'Engineering Department Admin Office E-101',
      hiddenVerification: [
        { question: 'What programs or equations are stored in the memory archive?', answer: 'MATH201 physics vectors and calculus formulas' }
      ],
      owner: studentPriya._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['calculator', 'engineering', 'math'],
      viewCount: 45,
    });

    // Lost Item 7: North Face Surge Backpack (Alex)
    const lostBackpack = await Item.create({
      title: 'The North Face Surge 31L Laptop Backpack Black',
      description: 'Black heavy-duty North Face backpack with padded laptop compartment, containing notebooks, chemistry binder, and prescription eyeglasses inside.',
      type: 'lost',
      category: 'Bags & Luggage',
      subcategory: 'Backpacks',
      brand: 'The North Face',
      model: 'Surge 31L',
      color: 'Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', publicId: 'demo-backpack-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'Food Court & Canteen - Booth area near north entrance',
      campusZone: 'Food Court & Canteen',
      condition: 'good',
      owner: studentAlex._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['backpack', 'north face', 'bag', 'canteen'],
      viewCount: 62,
    });

    // Found Item 6: The North Face Backpack (Sneha found)
    const foundBackpack = await Item.create({
      title: 'Black The North Face Backpack with Notebooks Inside',
      description: 'Found unattended at booth in Main Canteen. Checked by security staff and stored in safe custody.',
      type: 'found',
      category: 'Bags & Luggage',
      subcategory: 'Backpacks',
      brand: 'The North Face',
      color: 'Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', publicId: 'demo-backpack-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'Food Court & Canteen Booth',
      campusZone: 'Food Court & Canteen',
      condition: 'good',
      currentStorageLocation: 'Campus Security Main Station - Storage Locker #8',
      hiddenVerification: [
        { question: 'What colored binder and subject name is inside the front compartment?', answer: 'Green binder with General Chemistry notes' },
        { question: 'What brand of eyeglasses case is in the top fleece pocket?', answer: 'Warby Parker brown case' }
      ],
      owner: studentSneha._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['backpack', 'north face', 'bag', 'canteen'],
      viewCount: 71,
    });

    // Lost Item 8: Campus Student ID Card & Dorm Key (Sneha)
    const lostIDCard = await Item.create({
      title: 'Campus Student ID Card & Dorm Room Key on Navy Blue Lanyard',
      description: 'Lost my official university student ID card attached to dorm room key #204 on an official campus navy blue fabric lanyard.',
      type: 'lost',
      category: 'ID Cards & Wallets',
      subcategory: 'Student ID Card',
      brand: 'Campus ID Services',
      color: 'Navy Blue',
      images: [
        { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', publicId: 'demo-lanyard-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Pathway between North Hostels and Main Academic Block',
      campusZone: 'North Hostels (A, B, C)',
      condition: 'good',
      owner: studentSneha._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['id card', 'keys', 'lanyard', 'dorm key', 'hostel'],
      viewCount: 39,
    });

    // Found Item 7: Campus ID Card & Key on Lanyard (David found)
    const foundIDCard = await Item.create({
      title: 'Student ID Card with Key on Navy Blue Campus Lanyard',
      description: 'Found lying on the grass verge along the pedestrian pathway leading from North Hostel Block B to the Main Block.',
      type: 'found',
      category: 'ID Cards & Wallets',
      subcategory: 'Student ID Card',
      brand: 'University ID',
      color: 'Navy Blue',
      images: [
        { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', publicId: 'demo-lanyard-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Pedestrian Walkway near North Hostel Block B',
      campusZone: 'North Hostels (A, B, C)',
      condition: 'good',
      currentStorageLocation: 'Hostel B Reception / Warden Office',
      hiddenVerification: [
        { question: 'What is the full student name and department printed on the front of the ID?', answer: 'Sneha Reddy, Urban Planning' },
        { question: 'What room number is stamped on the brass key?', answer: '204' }
      ],
      owner: studentDavid._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['id card', 'lanyard', 'key', 'hostel'],
      viewCount: 48,
    });

    // Lost Item 9: Honda Civic Key FOB (David)
    const lostCarKey = await Item.create({
      title: 'Honda Civic Car Key FOB with Red Keychain & Gym Tag',
      description: 'Black Honda smart remote key FOB with a red embroidered strap saying "Remove Before Flight" and a black gym membership barcode tag.',
      type: 'lost',
      category: 'ID Cards & Wallets',
      subcategory: 'Keys / Keychains',
      brand: 'Honda',
      color: 'Black / Red',
      images: [
        { url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80', publicId: 'demo-carkey-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Campus East Parking Lot near Row D Bike Racks',
      campusZone: 'Campus Parking Lot (East/West)',
      condition: 'good',
      owner: studentDavid._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['car key', 'honda', 'parking lot', 'key fob'],
      viewCount: 52,
    });

    // Found Item 8: Honda Car Key FOB (Priya found)
    const foundCarKey = await Item.create({
      title: 'Honda Car Key FOB with Red Fabric Tag',
      description: 'Found dropped on the asphalt walkway in East Parking Lot. Delivered to campus security.',
      type: 'found',
      category: 'ID Cards & Wallets',
      subcategory: 'Keys / Keychains',
      brand: 'Honda',
      color: 'Black / Red',
      images: [
        { url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80', publicId: 'demo-carkey-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Campus East Parking Lot Row D',
      campusZone: 'Campus Parking Lot (East/West)',
      condition: 'good',
      currentStorageLocation: 'Campus Security Station East Booth',
      hiddenVerification: [
        { question: 'What gym brand or barcode is attached to the metal split ring?', answer: 'Planet Fitness barcode 8831' }
      ],
      owner: studentPriya._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['car key', 'honda', 'parking lot', 'keys'],
      viewCount: 65,
    });

    // Lost Item 10: Ray-Ban Wayfarer Sunglasses (Alex)
    const lostSunglasses = await Item.create({
      title: 'Ray-Ban New Wayfarer Matte Black Polarized Sunglasses',
      description: 'Classic matte black Ray-Ban sunglasses RB2132 with dark green polarized G-15 lenses. Left on table in SAC student lounge.',
      type: 'lost',
      category: 'Clothing & Accessories',
      subcategory: 'Spectacles / Sunglasses',
      brand: 'Ray-Ban',
      model: 'RB2132 Wayfarer',
      color: 'Matte Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', publicId: 'demo-glasses-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      location: 'Student Activity Center (SAC) - 1st Floor Student Lounge',
      campusZone: 'Student Activity Center (SAC)',
      condition: 'good',
      owner: studentAlex._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['sunglasses', 'ray-ban', 'sac', 'glasses'],
      viewCount: 31,
    });

    // Found Item 9: Ray-Ban Sunglasses in Case (Rahul found)
    const foundSunglasses = await Item.create({
      title: 'Ray-Ban Sunglasses in Tan Leatherette Protective Case',
      description: 'Found on one of the sofas in the SAC 1st Floor Lounge next to the ping-pong table.',
      type: 'found',
      category: 'Clothing & Accessories',
      subcategory: 'Spectacles / Sunglasses',
      brand: 'Ray-Ban',
      color: 'Matte Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', publicId: 'demo-glasses-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      location: 'SAC 1st Floor Lounge Sofa',
      campusZone: 'Student Activity Center (SAC)',
      condition: 'good',
      currentStorageLocation: 'SAC Helpdesk Counter',
      hiddenVerification: [
        { question: 'What color is the lens cleaning cloth folded inside the case?', answer: 'Red micro-fiber cloth' }
      ],
      owner: studentRahul._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['sunglasses', 'ray-ban', 'sac'],
      viewCount: 44,
    });

    // Lost Item 11: Stanley Quencher Tumbler (Sneha)
    const lostTumbler = await Item.create({
      title: 'Stanley Quencher H2.0 FlowState 40oz Tumbler (Rose Quartz Pink)',
      description: '40 ounce pink Stanley insulated tumbler with handle and reusable straw. Has a small cat sticker reading "Coffee First" near the base.',
      type: 'lost',
      category: 'Sports & Fitness Equipment',
      subcategory: 'Water Bottles',
      brand: 'Stanley',
      model: 'Quencher H2.0 40oz',
      color: 'Pink / Rose Quartz',
      size: '40 oz',
      images: [
        { url: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=800&q=80', publicId: 'demo-stanley-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Central Library - 2nd Floor Study Carrel #40',
      campusZone: 'Central Library',
      condition: 'good',
      owner: studentSneha._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['stanley', 'tumbler', 'cup', 'water bottle', 'library'],
      viewCount: 28,
    });

    // Found Item 10: Pink Stanley Tumbler (David found)
    const foundTumbler = await Item.create({
      title: 'Stanley 40oz Tumbler with Handle and Straw in Rose Quartz',
      description: 'Found left behind at 2nd Floor Library study carrel at closing time. Turned in to 1st floor desk.',
      type: 'found',
      category: 'Sports & Fitness Equipment',
      subcategory: 'Water Bottles',
      brand: 'Stanley',
      color: 'Pink',
      size: '40 oz',
      images: [
        { url: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=800&q=80', publicId: 'demo-stanley-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Central Library - 2nd Floor Study Carrel',
      campusZone: 'Central Library',
      condition: 'good',
      currentStorageLocation: 'Central Library Issue Desk',
      hiddenVerification: [
        { question: 'What sticker is placed on the side or bottom of the cup?', answer: 'Cat sticker saying Coffee First' }
      ],
      owner: studentDavid._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['stanley', 'tumbler', 'water bottle', 'library'],
      viewCount: 35,
    });

    // Lost Item 12: Operating System Concepts Textbook (Rahul)
    const lostTextbook = await Item.create({
      title: 'Operating System Concepts 10th Edition Hardcover Textbook',
      description: 'Silberschatz Dinosaur textbook for CS312 Operating Systems course. Contains yellow sticky notes and highlighting throughout chapters 3 to 7.',
      type: 'lost',
      category: 'Books & Stationery',
      subcategory: 'Textbooks',
      brand: 'Wiley',
      color: 'Blue / Multicolor',
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', publicId: 'demo-book-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'Engineering Block - 3rd Floor Student Bench',
      campusZone: 'Engineering & Tech Labs',
      condition: 'good',
      owner: studentRahul._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['textbook', 'book', 'operating systems', 'engineering', 'cs'],
      viewCount: 22,
    });

    // Found Item 11: OS Concepts Textbook (Sneha found)
    const foundTextbook = await Item.create({
      title: 'Hardcover Operating System Concepts (10th Ed) Dinosaur Textbook',
      description: 'Found resting on bench on 3rd floor of Engineering building. Has sticky notes inside.',
      type: 'found',
      category: 'Books & Stationery',
      subcategory: 'Textbooks',
      brand: 'Wiley',
      color: 'Blue',
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', publicId: 'demo-book-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'Engineering Block 3rd Floor Bench',
      campusZone: 'Engineering & Tech Labs',
      condition: 'good',
      currentStorageLocation: 'Computer Science Department Staff Room',
      hiddenVerification: [
        { question: 'Whose name or handwritten initials are written on page 1 inside cover?', answer: 'Rahul Patel PH2022' }
      ],
      owner: studentSneha._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['textbook', 'book', 'engineering', 'cs'],
      viewCount: 30,
    });

    // Lost Item 13: Apple iPad Air 5 (David)
    const lostIPad = await Item.create({
      title: 'Apple iPad Air 5th Generation (64GB, Space Gray) with Apple Pencil 2',
      description: 'Lost my iPad Air 5 with magnetic dark navy smart folio cover and Apple Pencil 2 magnetically attached on top. High value device needed for biology lab dissection diagrams.',
      type: 'lost',
      category: 'Electronics & Gadgets',
      subcategory: 'Tablets',
      brand: 'Apple',
      model: 'iPad Air 5',
      color: 'Space Gray',
      images: [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', publicId: 'demo-ipad-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Main Auditorium - Center Hall Row G Seat 14',
      campusZone: 'Main Auditorium & Amphitheatre',
      condition: 'good',
      owner: studentDavid._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['ipad', 'apple', 'tablet', 'apple pencil', 'auditorium'],
      viewCount: 88,
    });

    // Found Item 12: Apple iPad in Navy Folio (Priya found)
    const foundIPad = await Item.create({
      title: 'Apple iPad in Dark Navy Magnetic Smart Folio Cover with Stylus',
      description: 'Discovered under seat in the Main Auditorium after the guest lecture. Kept safely in university central security locker.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Tablets',
      brand: 'Apple',
      model: 'iPad Air',
      color: 'Space Gray',
      images: [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', publicId: 'demo-ipad-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Main Auditorium - Center Row',
      campusZone: 'Main Auditorium & Amphitheatre',
      condition: 'good',
      currentStorageLocation: 'Campus Security Main Station - Safe Deposit Locker',
      hiddenVerification: [
        { question: 'What image is displayed on the iPad lock screen wallpaper?', answer: 'Golden Retriever dog on beach' },
        { question: 'What engraving or stylus model is attached?', answer: 'Apple Pencil 2nd Generation' }
      ],
      owner: studentPriya._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: true,
      tags: ['ipad', 'apple', 'tablet', 'auditorium'],
      viewCount: 94,
    });

    // Lost Item 14: Nike Air Zoom Pegasus 40 Running Shoes (Alex)
    const lostShoes = await Item.create({
      title: 'Nike Air Zoom Pegasus 40 Running Shoes (Size US 10.5)',
      description: 'Black and white Nike running shoes left in a clear plastic gym shoe bag in the SAC Men Locker Room locker bench.',
      type: 'lost',
      category: 'Clothing & Accessories',
      subcategory: 'Footwear',
      brand: 'Nike',
      model: 'Pegasus 40',
      color: 'Black / White',
      size: 'US 10.5',
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', publicId: 'demo-shoes-lost' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Student Activity Center (SAC) - Gymnasium Locker Room Bench',
      campusZone: 'Student Activity Center (SAC)',
      condition: 'good',
      owner: studentAlex._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['nike', 'shoes', 'gym', 'sac', 'running shoes'],
      viewCount: 18,
    });

    // Found Item 13: Anker 737 Portable Charger Power Bank (Sneha found)
    const foundPowerBank = await Item.create({
      title: 'Anker 737 Power Bank 24,000mAh with Smart Digital Display',
      description: 'Found a heavy-duty Anker portable battery charger on study desk in Library 1st floor. Turned in to security desk.',
      type: 'found',
      category: 'Electronics & Gadgets',
      subcategory: 'Chargers & Power Banks',
      brand: 'Anker',
      model: '737 PowerCore 24K',
      color: 'Dark Gray / Black',
      images: [
        { url: 'https://images.unsplash.com/photo-1609592426867-0c7f1a8c5bb7?auto=format&fit=crop&w=800&q=80', publicId: 'demo-powerbank-found' }
      ],
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Central Library - 1st Floor Study Desk',
      campusZone: 'Central Library',
      condition: 'good',
      currentStorageLocation: 'Central Library Lost & Found Cabinet',
      hiddenVerification: [
        { question: 'What color charging cable was plugged into the USB-C1 port?', answer: 'Braided purple USB-C cable' }
      ],
      owner: studentSneha._id,
      status: ITEM_STATUSES.ACTIVE,
      isUrgent: false,
      tags: ['anker', 'charger', 'power bank', 'library', 'battery'],
      viewCount: 41,
    });

    console.log('[Seed] Created 22 comprehensive sample lost and found items.');

    // 5. Seed Claims
    // Claim 1: Pending claim for Wallet by Alex
    await Claim.create({
      itemId: foundWallet._id,
      claimantId: studentAlex._id,
      ownerId: studentPriya._id,
      reason: 'I left my wallet on the table while ordering lunch at the juice counter on Tuesday.',
      uniqueDetails: 'Brown Fossil bi-fold wallet. Contains my student ID card Alex Johnson and driver license.',
      verificationAnswers: [
        { question: 'What is the full name and student ID on the campus card inside?', answer: 'Alex Johnson, student ID IS2024-042' },
        { question: 'What bank card brand is present inside?', answer: 'Chase Debit Blue Card' },
      ],
      status: CLAIM_STATUSES.PENDING,
    });

    // Claim 2: Completed claim for Headphones
    await Claim.create({
      itemId: recoveredHeadphones._id,
      claimantId: studentAlex._id,
      ownerId: studentPriya._id,
      reason: 'Left my Sony headphones in the gym after workout.',
      uniqueDetails: 'Black headphones in case with audio aux cord inside mesh pouch.',
      status: CLAIM_STATUSES.COMPLETED,
    });
    console.log('[Seed] Created sample claims.');

    // 6. Seed Smart Alert (Alex's alert)
    await SmartAlert.create({
      userId: studentAlex._id,
      category: 'Electronics & Gadgets',
      campusZone: 'Central Library',
      color: 'Space Gray',
      keywords: ['macbook', 'laptop', 'apple'],
      type: 'found',
      isActive: true,
      notificationCount: 1,
    });
    console.log('[Seed] Created sample smart alert.');

    // 7. Seed Campus Announcement
    await Announcement.create({
      title: 'Campus Lost & Found Collection Drive & Bi-Weekly Claim Window',
      content: 'Campus Security and the Student Union will host an item claim desk at the Main Auditorium foyer every Friday from 2 PM to 5 PM. Unclaimed items past 90 days will be donated according to university policy.',
      priority: 'pinned',
      author: adminUser._id,
      isActive: true,
    });
    console.log('[Seed] Created campus announcement.');

    // 8. Seed Audit Log
    await AuditLog.create({
      userId: adminUser._id,
      userName: adminUser.name,
      userRole: 'admin',
      action: 'PLATFORM_SEEDED',
      entityType: 'System',
      description: 'Initial development platform configuration and sample campus dataset initialized.',
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Development Credentials:');
    console.log('  Admin User:   admin@campuslostfound.edu   | Password: AdminPass123!');
    console.log('  Student User: alex@campuslostfound.edu    | Password: UserPass123!');
    console.log('  Finder User:  priya@campuslostfound.edu   | Password: UserPass123!');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
