# 🛡️ Campus Lost & Found — Backend API Server

The backend service for the **Campus Lost & Found Platform** is built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, featuring real-time **Socket.IO** integration, automated matching heuristics, and comprehensive role-based access controls.

---

## 🚀 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Real-Time Communication**: Socket.IO (Chat, typing indicator, live notifications)
- **File Uploads**: Multer with Cloudinary CDN storage (and resilient local fallback)
- **Validation**: express-validator & Joi
- **Automated Testing**: Jest & Supertest
- **Security**: Helmet, CORS, Express-Rate-Limit, Mongo-Sanitize, XSS-Clean

---

## 📁 Directory Structure

```
server/
├── src/
│   ├── config/             # DB connection, Cloudinary, nodemailer configurations
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   ├── chatController.js
│   │   ├── alertController.js
│   │   ├── adminController.js
│   │   └── reviewController.js
│   ├── middleware/         # Auth, RBAC, file upload, validation, error handler
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Claim.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Alert.js
│   │   └── Review.js
│   ├── routes/             # Express API routes
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── claimRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── adminRoutes.js
│   │   └── reviewRoutes.js
│   ├── services/           # Business logic & algorithms
│   │   ├── matchingService.js  # 6-factor smart matching engine
│   │   ├── socketService.js    # Socket.IO room management
│   │   └── emailService.js     # Mail dispatch & dev simulations
│   ├── seeder/             # Realistic campus demo data seeder
│   │   ├── seedData.js
│   │   └── seedRunner.js
│   ├── app.js              # Express application configuration
│   └── index.js            # Server entrypoint & HTTP/Socket listener
├── tests/                  # Automated integration & unit test suites
│   ├── auth.test.js
│   ├── items.test.js
│   ├── claims.test.js
│   └── matching.test.js
├── uploads/                # Local storage fallback for uploaded images
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_lost_found
JWT_SECRET=supersecret_campus_jwt_key_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Cloud Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: SMTP Email Alerts
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@campuslostfound.edu
```

---

## 🛠️ Available Scripts

In the `server/` directory:

- `npm install`: Install dependencies.
- `npm run dev`: Start backend with automatic restart (`nodemon`).
- `npm start`: Start production server (`node src/index.js`).
- `npm run seed`: Populate database with 22+ realistic items, sample users, admin, claims, and alerts.
- `npm test`: Run complete test suite (Jest & Supertest).

---

## 📡 Core API Endpoints

### 🔐 Auth & Users
- `POST /api/auth/register` — Register a student account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated profile
- `PUT /api/auth/profile` — Update user profile

### 📦 Lost & Found Items
- `GET /api/items` — Query items with keyword search, category, location, and date filters
- `GET /api/items/:id` — Get single item details & matching score
- `POST /api/items` — Create new lost or found report (with optional image uploads)
- `PUT /api/items/:id` — Update listing details
- `DELETE /api/items/:id` — Soft-delete or archive listing

### 🤝 Claims & Ownership
- `POST /api/claims` — Submit an ownership claim with challenge responses
- `GET /api/claims/my` — Get user claims (filed or received)
- `PATCH /api/claims/:id/status` — Approve or reject a claim

### 💬 Messaging & Alerts
- `GET /api/chat/conversations` — Get active conversations
- `GET /api/chat/messages/:conversationId` — Retrieve chat history
- `POST /api/alerts` — Create keyword / location watch trigger
- `GET /api/notifications` — Retrieve user notifications

### 👑 Admin Moderation
- `GET /api/admin/stats` — Platform analytics & resolution ratios
- `GET /api/admin/users` — Moderate campus accounts
- `PATCH /api/admin/items/:id` — Moderate listings / mark fraud
