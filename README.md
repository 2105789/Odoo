# Authentication System

A complete authentication system built with Nuxt 3, Prisma, and PostgreSQL featuring user registration, login, and admin management.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- 👤 **User Registration**: Self-registration with email validation
- 🔑 **Role-Based Access**: USER and ADMIN roles with appropriate permissions
- 📊 **Admin Dashboard**: Complete user management interface
- 🛡️ **Middleware Protection**: Route-level authentication and authorization
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- 💾 **PostgreSQL Database**: Robust data storage with Prisma ORM

## Setup

### 1. Install Dependencies

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 2. Database Configuration

Update your `.env` file with your PostgreSQL database connection:

```env
DATABASE_URL="postgres://avnadmin:AVNS__rZuca0VGDj0J7M1kzf@pg-290e8a29-suvoohmag-8d67.e.aivencloud.com:16591/defaultdb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Create Admin User

```bash
# Create default admin user
node scripts/create-admin.js
```

This will create an admin user with:
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: ADMIN

**⚠️ Important**: Change the default password after first login!

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Usage

### User Registration
1. Visit `/register` to create a new user account
2. Fill in the required information (first name, last name, email, password)
3. Account will be created with USER role by default

### User Login
1. Visit `/login` to sign in
2. Use your email and password
3. Users are redirected to `/dashboard`
4. Admins are redirected to `/admin`

### Admin Management
1. Login as admin (admin@example.com / admin123)
2. Access the admin dashboard at `/admin`
3. Manage users:
   - View all users with pagination and search
   - Toggle user active/inactive status
   - Change user roles (USER ↔ ADMIN)
   - Delete users (except yourself)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin (Protected)
- `GET /api/admin/users` - Get all users (paginated)
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Route Protection**: Middleware-based access control
- **Input Validation**: Zod schema validation
- **Role-Based Access**: Admin-only routes and actions

## Middleware

### auth.ts
Protects routes that require authentication. Redirects unauthenticated users to login.

### admin.ts
Protects admin-only routes. Requires ADMIN role to access.

## Production Deployment

### Build Application
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Environment Variables
Make sure to set secure values for:
- `JWT_SECRET` - Strong secret key for JWT signing
- `NEXTAUTH_SECRET` - Secret for NextAuth (if using)
- `DATABASE_URL` - Production database connection

## Technologies Used

- **Nuxt 3** - Vue.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Tailwind CSS** - Styling
- **Zod** - Schema validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
