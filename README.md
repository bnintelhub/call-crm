# BN Orbit Call CRM

A modern, multi-tenant Call Center & Debt Collection CRM built with a high-performance **React 19 + Vite** frontend and a **Node.js + Express + MySQL** backend service.

---

## 🔐 System Login Credentials

Authentication is backed by real **MySQL database verification** and **bcrypt password hashing** (salt rounds: 10). Arbitrary passwords are not permitted.

Use the following verified credentials to access each respective role:

### 1. 👑 Super Admin (Platform Owner)
- **Email:** `superadmin@bnorbit.com`
- **Password:** `SuperAdmin@123`
- **Role:** `SUPER_ADMIN`
- **Portal URL:** `/superadmin/dashboard`
- **Capabilities:** Create & manage client companies, activation keys, plans, quotas, system telemetry, and global modules.

---

### 2. 👔 Supervisor / Company Admin (Team Lead)
- **Email:** `admin@bnsinghassociates.com`
- **Password:** `Admin@123`
- **Organization:** B.N. Singh Associates (`comp-bn-001`)
- **Role:** `TEAM_LEAD`
- **Portal URL:** `/dashboard`
- **Capabilities:** Loan data allocation, telecaller management, campaign setup, reports, live agent activity monitoring, recovery tracking.

---

### 3. 📞 Telecaller (Calling Agent)
- **Email:** `telecaller@bnorbit.com`
- **Password:** `Telecaller@123`
- **Organization:** B.N. Singh Associates (`comp-bn-001`)
- **Role:** `TELECALLER`
- **Portal URL:** `/dashboard`
- **Capabilities:** Calling queue (My Calling Data), disposition logging, borrower history, PTP tracking, call status updates.

---

## 📁 Project Architecture

The repository is structured into two dedicated services:

```
call-crm/
├── package.json              # Root scripts (dev, frontend, backend, seed)
├── README.md                 # Project documentation & credentials
├── backend/                  # Node.js + Express + MySQL Backend Service
│   ├── .env                  # Port (5001), DB configs, JWT Secret
│   ├── package.json
│   └── src/
│       ├── index.ts          # Express server entry point (Port 5001)
│       ├── config/db.ts      # MySQL connection pool (mysql2/promise)
│       ├── database/
│       │   ├── schema.sql    # Pure SQL schema (companies, users)
│       │   ├── seed.sql      # Standalone SQL seed script
│       │   ├── initDb.ts     # Auto-database initializer on startup
│       │   └── seed.ts       # Bcrypt hash runner (npm run seed)
│       ├── middlewares/      # JWT verification & role authorization
│       ├── controllers/      # Auth controller (login, me, changePassword)
│       └── routes/           # Express API routes (/api/auth)
└── frontend/                 # React 19 + TypeScript + Vite Application
    ├── vite.config.ts        # Dev server & proxy (/api -> http://localhost:5001)
    ├── package.json
    └── src/                  # Components, pages, stores, and layout
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ (tested on v24)
- **MySQL**: 8.0+ running on `localhost:3306` (default user: `root` with no password)

### 1. Database Setup
The backend automatically creates the database `bnorbit_crm` and executes `schema.sql` on startup. 
To seed or re-seed default credentials:
```bash
npm run seed
# Or using MySQL CLI directly:
mysql -u root bnorbit_crm < backend/src/database/seed.sql
```

### 2. Running Locally

**Run both Frontend and Backend concurrently:**
```bash
npm run dev
```

**Or run individually in separate terminal tabs:**
```bash
# Terminal 1: Backend (running on http://localhost:5001)
npm run backend

# Terminal 2: Frontend (running on http://localhost:5174 or 5173)
npm run frontend
```

---

## 🔒 Security Highlights
- **Password Hashing:** Passwords are never stored in plaintext; all passwords use `bcryptjs` with 10 salt rounds.
- **JWT Authorization:** Secured sessions using JSON Web Tokens (7-day validity) passed in `Authorization: Bearer <token>`.
- **Tenant Protection:** Inactive users or suspended company organizations are automatically blocked from logging in.