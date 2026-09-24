# 💻 Campus Lost & Found — Frontend Client

The frontend for the **Campus Lost & Found Platform** is built using modern **React 18** and **Vite**, delivering a fast, responsive, and intuitive single-page application (SPA).

---

## 🚀 Tech Stack

- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS with custom CSS variables, dark/light themes, glassmorphism, responsive grid & flexbox layouts
- **Icons**: Lucide React
- **Real-Time**: Socket.io Client
- **HTTP Client**: Axios with automatic JWT interceptors
- **Date Formatting**: date-fns
- **UI Notifications**: Custom Toast Notification system

---

## 📁 Directory Structure

```
client/
├── public/                 # Static assets and favicon
├── src/
│   ├── assets/             # Brand logos and images
│   ├── components/
│   │   ├── common/         # Navbar, Footer, Modal, Toast, Button, Badge
│   │   ├── items/          # ItemCard, ItemFilter, SearchBar, DuplicateWarning
│   │   ├── claims/         # ClaimModal, ClaimCard, VerificationProof
│   │   ├── chat/           # ChatWindow, MessageList, TypingIndicator
│   │   ├── admin/          # AdminSidebar, StatsCard, ModerationTable
│   │   └── gamification/   # ReputationBadge, LeaderboardCard, ReviewStars
│   ├── context/
│   │   ├── AuthContext.jsx       # User auth state & session recovery
│   │   ├── ThemeContext.jsx      # Light / Dark mode toggle
│   │   ├── SocketContext.jsx     # Socket.IO connection & event listeners
│   │   └── ToastContext.jsx      # Global toast notification dispatch
│   ├── pages/
│   │   ├── HomePage.jsx          # Hero section, categories, live stats, recent items
│   │   ├── LostItemsPage.jsx     # Lost item directory with advanced filters
│   │   ├── FoundItemsPage.jsx    # Found item directory with filter controls
│   │   ├── ItemDetailPage.jsx    # Detailed view, image carousel, matching score, claim trigger
│   │   ├── ReportLostPage.jsx    # Multi-step report form with duplicate heuristic detection
│   │   ├── ReportFoundPage.jsx   # Found report form with hidden verification challenge questions
│   │   ├── MyListingsPage.jsx    # User dashboard for reports, saved items, and watch alerts
│   │   ├── ClaimsPage.jsx        # Manage incoming and outgoing ownership claims
│   │   ├── MessagesPage.jsx      # Real-time direct chat between finders & claimants
│   │   ├── NotificationsPage.jsx # Activity center for claims, matches, and broadcast notices
│   │   ├── ProfilePage.jsx       # Profile details, reputation score, badges, and reviews
│   │   ├── LeaderboardPage.jsx   # Campus top contributors & reputation ranking
│   │   ├── AdminDashboardPage.jsx# Admin management for users, items, claims, and reports
│   │   ├── LoginPage.jsx         # User login form
│   │   └── RegisterPage.jsx      # Student registration form
│   ├── services/
│   │   ├── api.js                # Axios instance with auth interceptor & environment baseURL
│   │   ├── itemService.js        # Item CRUD & search APIs
│   │   ├── claimService.js       # Claim verification APIs
│   │   ├── chatService.js        # Conversation & message APIs
│   │   ├── adminService.js       # Administrative endpoints
│   │   └── alertService.js       # Custom keyword alert triggers
│   ├── App.jsx                   # Route definitions & layout wrappers
│   ├── main.jsx                  # React DOM entrypoint with Providers
│   └── index.css                 # Global theme variables, animations & utilities
├── vercel.json             # Vercel SPA rewrite configuration
├── vite.config.js          # Vite configuration & dev proxy
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `client/` root (or configure in your deployment platform):

```env
# Optional custom backend URL (defaults to /api for Vite proxy and same-origin)
VITE_API_BASE_URL=http://localhost:5000/api

# Optional custom Socket.io URL (defaults to window.location.origin)
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🛠️ Available Scripts

In the `client/` directory:

- `npm install`: Install dependencies.
- `npm run dev`: Start local development server with HMR at `http://localhost:5173`.
- `npm run build`: Compile and minify production bundle into `client/dist/`.
- `npm run preview`: Locally preview production build.

---

## 🌐 Production Deployment (e.g., Vercel / Netlify)

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Single Page App Routing**: Handled via `vercel.json` rewrites:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
