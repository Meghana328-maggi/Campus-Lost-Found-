# Campus-Lost-Found-

# 🎓 Campus Lost & Found Platform

A full-stack, production-grade **MERN (MongoDB, Express.js, React, Node.js)** platform engineered specifically for university campuses. It streamlines the recovery of misplaced personal property through real-time communication, automated multi-factor matching algorithms, private ownership verification, fraud mitigation, and comprehensive administrative oversight.

---

## 🌟 Key Features

### 1. Robust Authentication & Role-Based Access Control
- JWT-based authentication with secure HTTP/Authorization headers and password hashing via `bcrypt`.
- Granular role management: `user` (students/staff) and `admin` (campus security/moderators).
- Student verification profile attributes (Student ID, Department, Academic Year, College).
- Account security controls including password change, self-service forgot/reset password flows, and automated session expiration handling.

### 2. Item Reporting & Management
- **Report Lost Items**: Submit items lost across campus with categories, subcategories, brand, model, color, date/time, precise campus zone/building, unique identifiers, urgent flags, and optional anonymous posting.
- **Report Found Items**: Safe reporting with custom **hidden verification challenges** (e.g. wallpaper pattern, inner pocket contents, secret serial segments) so finders can safely challenge claimants before relinquishing items.
- **Live Duplicate Detection**: Pre-submission heuristic scanning alerts reporters to similar active listings before creating duplicates.
- **Image Upload Pipeline**: Cloudinary integration with automatic local disk storage fallback (`server/uploads/`) and image compression/MIME validation.

### 3. Smart Matching Engine
- **6-Factor Weighted Scoring Algorithm**:
  - Category Match: **25%**
  - Title & Description Semantic Keywords: **25%**
  - Brand & Model: **15%**
  - Campus Zone & Building: **15%**
  - Color: **10%**
  - Date Proximity: **10%**
- Computes percentage match suggestions (e.g., *90% Match Suggestion*) with non-authoritative ownership indicators.
- Optional AI-assisted semantic similarity integration (pluggable via OpenAI API key).

### 4. Ownership Verification & Claim Lifecycle
- Complete state-machine lifecycle:
  `Reported (Active)` ➔ `Possible Match` ➔ `Claim Pending` ➔ `Verification Approved` ➔ `Returned / Recovered` ➔ `Closed`.
- Claimant answers finder's hidden verification questions and can optionally upload proof documentation or purchase receipts.
- Finders and campus admins can approve or reject claims with reason tracking and real-time alerts.

### 5. Real-Time Messaging & Notifications
- **Socket.IO Bidirectional Channels**: Authenticated real-time instant messaging between finders and verified claimants.
- Online presence indicators and live typing notifications.
- In-app notification center tracking matches, incoming claims, claim status changes, recovered items, smart alerts, and broadcast campus announcements.
- **Nodemailer Integration**: Automated email alerts for registration, password reset, claim updates, and matches (with dev-console simulation fallback).

### 6. Smart Alerts & Bookmarking
- **Custom Keyword & Location Watchers**: Students can define triggers (e.g. *Category: Electronics, Color: Midnight Blue, Location: Library*) to receive instant alerts the moment a matching found item is logged.
- **Saved Items**: Bookmark and track potential items across campus.

### 7. User Reputation, Gamification & Feedback
- Reputation points awarded for honest campus citizenship (+5 for reports, +15 for verified claims, +30 for completed recoveries).
- Automated badge awarding: *First Recovery*, *Helpful Finder*, *Community Helper*, *Trusted User*, *5 Items Returned*, *10 Successful Recoveries*.
- Post-recovery 5-star ratings with tags (*Fast & Easy*, *Trustworthy Finder*, *Smooth Handover*) and duplicate-review prevention.

### 8. Administrative Command Center & Analytics
- Complete moderation portal:
  - User management (search, view, block/unblock, delete).
  - Item moderation (flag fraudulent listings, mark suspicious, delete).
  - Claim dispute resolution and admin investigation notes.
  - User report review (fake listing, scam, inappropriate content, duplicate).
  - Dynamic campus zone & category taxonomy management.
  - Campus-wide emergency and broadcast announcements.
  - Comprehensive Audit Logs tracking sensitive moderation actions (`USER_BLOCKED`, `ITEM_DELETED`, `CLAIM_APPROVED`, etc.).
- **Live MongoDB Analytics (Recharts)**:
  - Total items, active recovery rates, pending claims, and blocked accounts.
  - Lost vs. Found distribution.
  - Item distribution by campus building/zone.
  - Category breakdown and monthly reporting trends.

### 9. Utility & Accessibility Features
- **Dark Mode**: Persistent light/dark theme toggle with CSS variable adaptation.
- **Multi-Language Support**: Built-in internationalization architecture supporting **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
- **QR Code Generator**: Generates shareable, privacy-safe QR codes for any listing without exposing personal contact details.
- **PDF Report Generation**: Download printable official Campus Incident / Recovery PDF certificates using `jspdf`.
- **PWA Ready**: Web app manifest and mobile bottom navigation for tablet and smartphone devices.

---

## 🏗️ Architecture & Folder Structure

```
Lost & Found Platform/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── public/                 # Static assets, web manifest, and icons
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, ItemCard, Modals, Badges, etc.)
│   │   ├── context/            # AuthContext, SocketContext, ThemeContext, LanguageContext, ToastContext
│   │   ├── layouts/            # MainLayout (with MobileBottomNav) and AdminLayout
│   │   ├── pages/              # Public & Authenticated pages (Home, Items, Details, Claims, etc.)
│   │   │   └── admin/          # Admin Dashboard, Moderation, Analytics, Audit Logs
│   │   ├── services/           # Axios HTTP client with interceptors
│   │   ├── utils/              # Translations, date helpers, PDF generator
│   │   ├── App.jsx             # React Router routing configuration
│   │   └── main.jsx            # Application root entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Application (Node.js + Express.js + Socket.IO + MongoDB)
│   ├── src/
│   │   ├── config/             # DB connection, Cloudinary, constants, categories/zones
│   │   ├── controllers/        # 10 Express controllers (auth, items, claims, admin, etc.)
│   │   ├── middleware/         # protect, authorize, optionalAuth, errorHandler, rateLimiter
│   │   ├── models/             # 13 Mongoose Schemas (User, Item, Claim, Message, AuditLog, etc.)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Matching algorithm, reputation, smart alerts, emails, uploads
│   │   ├── sockets/            # Socket.IO connection manager and event handlers
│   │   ├── utils/              # apiResponse, auditLogger, database seeder
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # HTTP + Socket.IO server listener
│   ├── tests/                  # Automated integration tests (Jest + Supertest)
│   ├── uploads/                # Local disk storage directory for uploaded media
│   ├── package.json
│   ├── .env                    # Active environment variables (git-ignored)
│   └── .env.example            # Environment configuration template
│
├── package.json                # Root package for workspace orchestration
└── README.md                   # Complete system documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, jsPDF, QRCode.react, Canvas-Confetti |
| **State & Context** | React Context API (`AuthContext`, `SocketContext`, `ThemeContext`, `LanguageContext`, `ToastContext`) |
| **Backend** | Node.js, Express.js, Socket.IO, Multer, Helmet, CORS, Express-Rate-Limit, Compression, Morgan |
| **Database** | MongoDB with Mongoose ODM (Indexes, text search, relations) |
| **Authentication** | JWT (JSON Web Tokens) & `bcryptjs` password hashing |
| **Media Storage** | Cloudinary API with seamless local filesystem fallback |
| **Email** | Nodemailer with dev-console simulation fallback |
| **Testing** | Jest, Supertest |

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas cluster URI

### 1. Clone & Install Dependencies

From the project root:
```bash
# Install root orchestration dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

---

## 🔐 Environment Variables

### Backend Configuration (`server/.env`)
Copy the example template to create your `.env` file:
```bash
cp server/.env.example server/.env
```

Configure the following keys in `server/.env`:
```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection (Local or Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/campus_lost_found

# Authentication Secrets
JWT_SECRET=campus_lost_found_dev_jwt_secret_key_3847294829348923
JWT_EXPIRES_IN=7d

# Client & Server Origins
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Optional: Cloudinary Storage (If omitted, images are stored in server/uploads/)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: SMTP Email Service (If omitted, emails are printed to dev console)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="Campus Lost & Found" <noreply@campuslostfound.edu>

# Optional: OpenAI API Key for Semantic Matching
OPENAI_API_KEY=
```

### Frontend Configuration (`client/.env`)
Create `client/.env` (optional, defaults to relative proxy `/api` in development):
```ini
VITE_API_BASE_URL=
```

---

## 🗄️ Database Seeding

Populate the database with pre-configured campus locations (Library, Canteen, Main Block, Sports Complex, etc.), categories, sample lost/found items, claims, alerts, and seed user accounts:

```bash
cd server
node src/utils/seed.js
```

---

## 🚀 Running the Application

### Option A: Run Concurrently from Root
```bash
# Starts both Express backend (Port 5000) and Vite frontend (Port 5173)
npm run dev
```

### Option B: Run Services Separately

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Access the web interface at **`http://localhost:5173`**.

---

## 👨‍💻 Seed Accounts & Credentials

The seed script creates the following accounts for immediate development and testing:

| Role | Name | Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Campus Moderator | `admin@campuslostfound.edu` | `AdminPass123!` | Complete administrative dashboard access |
| **Student** | Alex Johnson | `alex@campuslostfound.edu` | `UserPass123!` | Sample student who reported a lost Hydro Flask |
| **Finder** | Priya Sharma | `priya@campuslostfound.edu` | `UserPass123!` | Sample student who found items & submitted claims |
| **Student** | Michael Chen | `michael@campuslostfound.edu` | `UserPass123!` | Active student user with smart alerts enabled |

> ⚠️ **Important**: For production deployments, log in as administrator and immediately rotate the default password.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student or staff account
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET  /api/auth/me` - Fetch currently authenticated user profile
- `PUT  /api/auth/profile` - Update user details, phone, and avatar
- `PUT  /api/auth/change-password` - Change existing password
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password/:token` - Reset password using verified token

### Items (`/api/items`)
- `GET    /api/items` - Search and filter items (with pagination, campus zone, category, date filters)
- `GET    /api/items/:id` - Fetch item details (masks hidden verification for non-owners)
- `POST   /api/items/lost` - Report a lost item (supports multipart image uploads)
- `POST   /api/items/found` - Report a found item with private verification challenges
- `PUT    /api/items/:id` - Update item listing
- `DELETE /api/items/:id` - Remove item listing
- `GET    /api/items/:id/matches` - Compute possible matches via 6-factor algorithm
- `POST   /api/items/check-duplicates` - Scan for potential duplicate items before submission

### Claims (`/api/claims`)
- `POST /api/claims` - Submit an ownership claim with answers to hidden challenges
- `GET  /api/claims/my` - List all claims filed by the authenticated user
- `GET  /api/claims/item/:itemId` - List claims received for an item (accessible by owner/admin)
- `GET  /api/claims/:id` - Fetch claim details and submitted proofs
- `PUT  /api/claims/:id/approve` - Approve ownership claim (transitions item to `claimed`)
- `PUT  /api/claims/:id/reject` - Reject an invalid or fraudulent claim
- `PUT  /api/claims/:id/cancel` - Cancel a submitted claim

### Messaging & Sockets (`/api/messages`)
- `GET  /api/messages/conversations` - List active conversations
- `GET  /api/messages/:conversationId` - Retrieve paginated conversation message history
- `POST /api/messages` - Send a message (also broadcast over Socket.IO)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Retrieve paginated notifications
- `PUT /api/notifications/:id/read` - Mark single notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Bookmarks & Smart Alerts
- `GET    /api/bookmarks` - View user's saved items
- `POST   /api/bookmarks` - Bookmark an item
- `DELETE /api/bookmarks/:itemId` - Remove bookmark
- `GET    /api/alerts` - List active smart alert watchers
- `POST   /api/alerts` - Create a new smart alert criteria
- `DELETE /api/alerts/:id` - Delete an alert criteria

### Recovery Feedback & Ratings (`/api/feedback`)
- `POST /api/feedback` - Submit recovery experience rating (1-5 stars) and review
- `GET  /api/feedback/item/:itemId` - Retrieve feedback associated with recovered item

### Moderation & Reports (`/api/reports`)
- `POST /api/reports` - Report suspicious listing, user, or fraudulent claim
- `GET  /api/reports/my` - View status of user's filed reports

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` - High-level metrics (users, items, claims, reports, recovered count)
- `GET /api/admin/analytics` - Live MongoDB aggregation data for Recharts graphs
- `GET /api/admin/users` - Paginated user management list
- `PUT /api/admin/users/:id/block` - Block or unblock a user account
- `GET /api/admin/items` - Global item moderation list
- `GET /api/admin/claims` - Global claim oversight and dispute resolution
- `GET /api/admin/reports` - Moderation queue for user complaints
- `PUT /api/admin/reports/:id/resolve` - Resolve or dismiss a filed report
- `GET /api/admin/categories` & `POST /api/admin/categories` - Manage categories
- `GET /api/admin/locations` & `POST /api/admin/locations` - Manage campus zones and buildings
- `POST /api/admin/announcements` - Broadcast a notification to all registered students
- `GET /api/admin/audit-logs` - Chronological audit trail of all administrative actions

---

## 🧪 Automated Testing

The backend includes a comprehensive Jest and Supertest suite verifying authentication, access control, duplicate detection, and item workflows.

```bash
# Run backend test suite
cd server
npm test
```

### Test Coverage Highlights:
- ✅ Health check endpoints
- ✅ User & Admin login validation and credential rejection
- ✅ Protected route JWT verification
- ✅ Item pagination and category/status filtering
- ✅ Duplicate report pre-check heuristic
- ✅ Role-based authorization guarding admin dashboard routes

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Set the root directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable: Set `VITE_API_BASE_URL` to your production backend URL.

### Backend (Render / Railway / VPS)

**Option 1: Using Render Blueprint (Zero-Config)**
- A [render.yaml](file:///d:/Lost%20&%20Found%20Platform/render.yaml) is included at the root of the project. When creating a new service on Render, select **Blueprint** or connect the repository. Render will automatically apply the configuration (`rootDir: server`, `buildCommand: npm install`, `startCommand: npm start`).

**Option 2: Manual Web Service Setup on Render**
1. **Root Directory**: `server` *(Recommended)*, or leave blank (the root `package.json` now includes `postinstall` and `build` fallback scripts to build the server automatically).
2. **Build Command**: `npm install`
3. **Start Command**: `npm start` (or `node src/server.js` if root directory is `server`, or `npm start` from root).
4. Configure all environment variables in your hosting dashboard:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `CLIENT_URL` (Your frontend Vercel domain)
   - `CLOUDINARY_*` keys (Recommended for production file uploads)
   - `EMAIL_*` credentials for transactional email delivery

---

## 🔒 Security Best Practices Implemented

- **No Passwords in Responses**: MongoDB queries explicitly project out passwords (`select('-password')`).
- **Private Verification Concealment**: Hidden verification answers are stripped at the database projection layer and never delivered to public endpoints.
- **Content Security & Headers**: `Helmet` sets strict HTTP headers to prevent XSS and clickjacking.
- **Rate Limiting**: `express-rate-limit` guards against brute-force attacks on `/api/auth` and protects standard endpoints.
- **Anti-Tampering**: Claim ownership state transitions strictly enforce that claimants cannot claim their own items and only posters/admins can approve handovers.
- **Input Sanitization**: Trimmed strings and schema validations prevent malformed payloads.

---

## 🔮 Future Roadmap

- Native mobile companion application built using React Native.
- Facial and visual object recognition using TensorFlow.js for automated image similarity.
- Integration with Campus ID Card NFC/RFID readers for physical station handovers.
- Automated SMS alerts via Twilio for critical urgency items (passports, prescription medications).
