# 🏗️ Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Budget Planner                        │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│   Frontend      │         Backend                       │
│   (React)       │         (Express.js)                  │
│                 │                                       │
└─────────────────┴───────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Opens App
    ↓
ThemeContext Initializes
    ├─→ Reads localStorage for saved theme
    ├─→ Falls back to system preference
    └─→ Applies theme to html.dark class
    ↓
App Component Checks Session
    ├─→ If not logged in → Show Login
    ├─→ If must_change_password → Show ChangePassword
    ├─→ If role='admin' → Show AdminDashboard
    └─→ If role='user' → Show AppContent (Budget App)
    ↓
User Logs In
    ├─→ POST /api/auth/login
    ├─→ Backend checks admin_users table
    ├─→ If not found, checks users table
    ├─→ Returns { role, userId, email, name }
    └─→ App stores session & redirects
```

### 2. Theme System

```
ThemeContext
    ├─→ useState for current theme
    ├─→ useEffect to load from localStorage
    ├─→ useEffect to apply html.dark class
    └─→ Exports useTheme hook
    ↓
Any Component
    ├─→ useTheme()
    ├─→ Accesses { isDark, toggleTheme }
    ├─→ Conditionally applies styles
    └─→ Updates UI in real-time
    ↓
localStorage
    └─→ Persists theme between sessions
```

### 3. Admin User Management

```
AdminDashboard
    ├─→ GET /api/auth/users (load all users)
    ├─→ useCallback for event handlers
    ├─→ useMemo for stats
    └─→ memo(UserRow) for performance
    ↓
User Actions
    ├─→ Create User
    │   ├─→ POST /api/auth/users
    │   ├─→ Backend generates temp password
    │   └─→ User receives temp password
    ├─→ Assign Password
    │   ├─→ POST /api/auth/users/{id}/assign-password
    │   ├─→ Admin sets custom password
    │   └─→ User must change on next login
    ├─→ Reset Password
    │   ├─→ POST /api/auth/users/{id}/reset-password
    │   ├─→ Backend generates new temp password
    │   └─→ User must change on next login
    ├─→ Activate/Deactivate
    │   └─→ PUT /api/auth/users/{id}
    └─→ Delete User
        └─→ DELETE /api/auth/users/{id}
```

## Component Hierarchy

```
App.tsx (with ThemeProvider)
├─ ThemeProvider (from ThemeContext)
│  └─ AppInner (checks session)
│     ├─ Login (if not authenticated)
│     ├─ ChangePassword (if must_change_password)
│     ├─ AdminDashboard (if role='admin')
│     │  ├─ UserRow (memoized) [multiple]
│     │  ├─ CreateUserModal
│     │  └─ PasswordModal
│     └─ AppContent (if role='user')
│        ├─ Shell
│        │  ├─ TopBar (with theme toggle)
│        │  ├─ Sidebar
│        │  ├─ Content Area
│        │  └─ BottomNav
│        ├─ Dashboard
│        ├─ Transactions
│        ├─ Accounts
│        ├─ Budget
│        ├─ Categories
│        ├─ Calendar
│        └─ Reports
└─ useTheme hook (available in all components)
```

## File Organization

### Frontend
```
client/src/
├─ context/
│  ├─ ThemeContext.tsx (NEW)
│  ├─ BudgetContext.tsx
│  ├─ actions.ts
│  └─ reducer.ts
├─ components/
│  ├─ auth/
│  │  ├─ Login.tsx (NEW - replaces AdminLogin)
│  │  ├─ AdminDashboard.tsx (UPDATED)
│  │  └─ ChangePassword.tsx (UPDATED)
│  ├─ [other components with theme support]
├─ index.css (UPDATED - dark mode)
└─ main.tsx
```

### Backend
```
server/src/
├─ db/
│  └─ migrations/
│     └─ 001_init_schema.sql (NEW)
├─ routes/
│  └─ auth.ts (UPDATED)
└─ index.ts
```

## Database Schema

### admin_users table
```
id (UUID, PK)
├─ username (UNIQUE)
├─ password_hash
├─ is_active
├─ must_change_password
├─ last_login
├─ created_at
└─ updated_at
```

### users table
```
id (UUID, PK)
├─ username (UNIQUE)
├─ email (REQUIRED)
├─ password_hash
├─ first_name (REQUIRED)
├─ last_name (REQUIRED)
├─ is_active
├─ must_change_password
├─ last_login
├─ created_by (FK → admin_users.id)
├─ created_at
└─ updated_at
```

### admin_audit_log table
```
id (UUID, PK)
├─ admin_id (FK → admin_users.id)
├─ action (CREATE_USER, UPDATE_USER, DELETE_USER, etc.)
├─ target_id (id of affected user)
├─ changes (JSON of what changed)
├─ timestamp
└─ ip_address (optional)
```

### Other tables
```
accounts, categories, transactions, budgets
(with user_id FK for multi-user support)
```

## Performance Optimizations

### React Optimizations
```
1. Memoization
   ├─ UserRow component wrapped in memo()
   ├─ Prevents re-render when props unchanged
   └─ Huge benefit for large user lists

2. useCallback
   ├─ Event handlers memoized
   ├─ Prevents inline function recreation
   └─ Used in AdminDashboard actions

3. useMemo
   ├─ Stats calculations cached
   ├─ Only recalculates when users change
   └─ Improves dashboard rendering

4. Lazy Loading (Ready for future)
   ├─ Route-based code splitting
   ├─ Dynamic imports for modals
   └─ Reduces initial bundle size
```

### Database Optimizations
```
1. Indexes
   ├─ (username) on admin_users
   ├─ (username) on users
   ├─ (email) on users
   ├─ (user_id) on transactions, accounts, budgets
   └─ (user_id, date) for time-based queries

2. Query Optimization
   ├─ Only fetch what's needed
   ├─ Batch operations where possible
   └─ Use connection pooling

3. Caching
   ├─ User list (refreshes on action)
   ├─ Session info (persisted)
   └─ Theme preference (localStorage)
```

## Theme Implementation Details

### How Dark Mode Works

```
1. CSS Class Approach
   ├─ Default: Light mode (no class)
   ├─ Dark mode: html.dark class
   └─ Tailwind uses @media (prefers-color-scheme)

2. tailwind.config.ts
   └─ darkMode: 'class'

3. index.css
   ├─ Default light colors
   ├─ .dark selector for dark colors
   └─ Smooth transitions

4. ThemeContext
   ├─ useState: currentTheme
   ├─ Reads localStorage
   ├─ Applies html.dark
   ├─ Provides toggle function
   └─ useTheme hook for consumers
```

### Tailwind Dark Mode Classes

```
Normal:  text-black bg-white
Dark:    dark:text-white dark:bg-gray-900

Example in components:
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

## API Endpoints

### Authentication
```
POST   /api/auth/login
       Request: { username/email, password }
       Response: { role, userId, email, name, token }

POST   /api/auth/logout
       Response: { message: 'Logged out' }

POST   /api/auth/change-password
       Request: { currentPassword, newPassword }
       Response: { message: 'Changed' }

GET    /api/auth/profile
       Response: { userId, email, role, name }
```

### User Management (Admin Only)
```
GET    /api/auth/users
       Response: [{ id, username, email, firstName, lastName, isActive, mustChangePassword }]

POST   /api/auth/users
       Request: { username, email, firstName, lastName }
       Response: { userId, tempPassword }

PUT    /api/auth/users/:userId
       Request: { email, firstName, lastName, isActive }
       Response: { message: 'Updated' }

DELETE /api/auth/users/:userId
       Response: { message: 'Deleted' }

POST   /api/auth/users/:userId/assign-password
       Request: { password }
       Response: { message: 'Password assigned' }

POST   /api/auth/users/:userId/reset-password
       Response: { tempPassword }
```

## Type Definitions

### Frontend Types
```typescript
type UserSession = {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  mustChangePassword?: boolean;
};

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: Date;
};

type Theme = 'light' | 'dark' | 'system';
```

## Security Considerations

### Password Management
```
1. Temporary Passwords
   ├─ Generated on user creation
   ├─ Random, secure format
   └─ User must change on next login

2. Password Reset
   ├─ Admin generates temp password
   ├─ User must change on next login
   └─ Previous password invalidated

3. Minimum Requirements
   ├─ 8 characters minimum
   ├─ No special character requirements (for now)
   └─ Hashed using bcrypt
```

### Access Control
```
1. Authentication
   ├─ Username/Email + Password
   ├─ Session token storage
   └─ Logout clears session

2. Authorization
   ├─ adminMiddleware for protected routes
   ├─ Role-based access (admin/user)
   └─ User data isolation

3. Audit Log
   ├─ All admin actions tracked
   ├─ Stores who, what, when
   └─ Useful for compliance
```

## Testing Strategy

### Unit Tests (Recommended)
```
1. ThemeContext
   ├─ Theme toggle works
   ├─ localStorage persistence
   └─ HTML class application

2. Components
   ├─ Login validation
   ├─ ChangePassword validation
   └─ AdminDashboard interactions

3. API Routes
   ├─ Authentication
   ├─ User management
   └─ Authorization
```

### Integration Tests
```
1. Full Auth Flow
   ├─ User creation
   ├─ Login
   ├─ Password change
   └─ Logout

2. Theme Persistence
   ├─ Set theme
   ├─ Reload page
   └─ Verify theme persists

3. Admin Operations
   ├─ Create user
   ├─ Assign password
   ├─ Verify user can login
```

## Troubleshooting Guide

### Common Issues

```
1. Dark Mode Not Working
   ├─ Check tailwind.config.ts has darkMode: 'class'
   ├─ Verify ThemeContext provider wraps App
   ├─ Check browser has html.dark class
   └─ Clear cache and reload

2. Login Fails
   ├─ Verify database is running
   ├─ Check PostgreSQL connection
   ├─ Verify user exists in database
   └─ Check server logs for errors

3. Performance Issues
   ├─ Check memo() on UserRow
   ├─ Verify useCallback usage
   ├─ Monitor network requests
   └─ Profile React components
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Performance optimization at multiple levels
- ✅ Security with proper authentication
- ✅ Scalability for future features
- ✅ Maintainability with clear structure
