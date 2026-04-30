# 💰 BudgetPlanner

A modern, full-stack budget management application built with React, TypeScript, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL database (Azure PostgreSQL or local)

### Installation

```bash
# Install all dependencies (root + workspaces)
npm run install:all

# OR manually:
npm install
npm install -w server
npm install -w client
```

### Configuration

1. **Server**: Copy `server/.env.example` to `server/.env` and configure:
   ```bash
   cp server/.env.example server/.env
   ```
   Update database credentials and JWT secret.

2. **Client**: Copy `client/.env.example` to `client/.env` (optional):
   ```bash
   cp client/.env.example client/.env
   ```

### Run Development

```bash
# Start both server and client
npm run dev

# Server: http://localhost:8081
# Client: http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Deploy

```bash
npm start
```

## 📚 Project Structure

```
budget-planner/
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities (auth, helpers)
│   │   ├── db/            # Database & migrations
│   │   └── index.ts       # Server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   └── App.tsx        # App entry
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── package.json           # Monorepo config
```

## 🔐 Admin Authentication

### Initial Login
- **Username**: `admin`
- **Password**: `Admin123` → **MUST change on first login**

### Setup
1. Run migrations: Happens automatically on server start
2. Seed admin user: Happens automatically (or via `npm run seed -w server`)

See [SETUP_ADMIN_AUTH.md](SETUP_ADMIN_AUTH.md) for complete authentication details.

## 🗄️ Database Migrations

Migrations run automatically on server startup. To manually run:

```bash
# Via server startup (automatic)
npm run dev

# Migrations are in: server/src/db/migrations/
```

Migration files:
- `001_init_schema.sql` - Core schema
- `002_add_category_fields.sql` - Category enhancements
- `003_add_admin_auth.sql` - Admin & auth tables
- `004_seed_admin_user.sql` - Admin user seeding

## 📦 Scripts

### Root (Monorepo)
```bash
npm run dev               # Start server + client
npm run build            # Build both
npm start                # Start production server
npm run seed             # Seed database
npm run install:all      # Install all dependencies
```

### Server
```bash
npm run dev -w server    # Dev server with hot-reload
npm run build -w server  # Build TypeScript
npm run start -w server  # Production start
npm run seed -w server   # Seed admin user
```

### Client
```bash
npm run dev -w client    # Vite dev server
npm run build -w client  # Build optimized bundle
npm run preview -w client # Preview production build
```

## 🛠️ Technology Stack

**Backend**
- Express.js - Web framework
- TypeScript - Type safety
- PostgreSQL - Database
- bcrypt - Password hashing
- JWT - Authentication
- pg - Database client

**Frontend**
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Lucide React - Icons
- Recharts - Charts

## 📝 Environment Variables

See `.env.example` files in each directory for configuration options.

**Important**: Never commit `.env` files with secrets!

## 🔗 API Documentation

Base URL: `http://localhost:8081/api`

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get admin profile
- `GET /api/auth/users` - List users (admin only)
- `POST /api/auth/users` - Create user (admin only)
- `PUT /api/auth/users/:userId` - Update user (admin only)
- `DELETE /api/auth/users/:userId` - Delete user (admin only)
- `POST /api/auth/users/:userId/reset-password` - Reset password (admin only)

See [SETUP_ADMIN_AUTH.md](SETUP_ADMIN_AUTH.md) for complete API reference.

## 🐛 Troubleshooting

### Database Connection Refused
- Check `DB_HOST`, `DB_PORT` in `.env`
- Ensure PostgreSQL is running
- Verify firewall rules for Azure PostgreSQL

### Dependencies Installation Fails
```bash
npm install --legacy-peer-deps
```

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=8082
```

## 📄 License

MIT

## 👤 Author

Mattia Rafanelli
