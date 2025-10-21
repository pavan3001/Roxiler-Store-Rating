# Roxiler Store Rating Platform

A comprehensive full-stack web application for store rating management with role-based access control.

## 🚀 Features

### User Roles & Permissions

#### System Administrator
- Dashboard with comprehensive statistics
- User management (create, view, filter, sort)
- Store management (create, view, filter, sort)
- Role-based access control
- Password management

#### Normal User
- User registration and authentication
- Browse and search stores
- Submit and modify store ratings (1-5 stars)
- View personal ratings and store statistics
- Password management

#### Store Owner
- Dedicated dashboard
- View store's average rating
- See all users who rated their store
- Track rating history
- Password management

## 🛠 Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: cors middleware

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Requirements Compliance

### Form Validations
- ✅ Name: 20-60 characters
- ✅ Address: Max 400 characters
- ✅ Password: 8-16 characters, uppercase + special character
- ✅ Email: Standard email validation

### Database Features
- ✅ Proper schema design with relationships
- ✅ Sorting support for all key fields
- ✅ Search and filter functionality
- ✅ Data integrity with foreign keys

### Security
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing
- ✅ Input validation and sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roxiler-store-rating
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `roxiler_store_rating`
   - Update database credentials in `.env` file

4. **Environment Configuration**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=roxiler_store_rating
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

   Frontend-specific environment
   -----------------------------

   You can configure the frontend to use a specific backend API base URL by setting the Vite environment variable `VITE_API_BASE_URL` in your `.env` file at the project root. Example:

   ```env
   # For local backend
   VITE_API_BASE_URL=http://localhost:5000/api

   # Or point to your deployed Render backend
   VITE_API_BASE_URL=https://roxiler-store-rating-raiq.onrender.com/api
   ```

   After changing `.env`, restart the frontend dev server so Vite picks up the new variable.

5. **Start the application**
   ```bash
   # Start backend server
   npm run server

   # Start frontend (in another terminal)
   npm run dev
   ```

### Default Admin Account
- **Email**: admin@roxiler.com
- **Password**: Admin@123

## 📱 Application Flow

### For Normal Users
1. Register with required details
2. Login to access store listings
3. Search and filter stores
4. Submit ratings (1-5 stars)
5. Modify existing ratings
6. Update password

### For Store Owners
1. Login with provided credentials
2. View store dashboard
3. Monitor average rating
4. See customer feedback
5. Update password

### For Administrators
1. Login with admin credentials
2. Access comprehensive dashboard
3. Manage users and stores
4. View system statistics
5. Apply filters and sorting

## 🏗 Architecture

### Backend Structure
```
server/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin operations
│   └── storeController.js   # Store operations
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Auth routes
│   ├── admin.js            # Admin routes
│   └── stores.js           # Store routes
└── index.js                # Server entry point
```

### Frontend Structure
```
src/
├── components/             # Reusable components
├── context/               # React context providers
├── pages/                 # Page components
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── App.tsx               # Main application component
```

### Database Schema
```sql
users (id, name, email, password, address, role, timestamps)
stores (id, name, email, address, owner_id, timestamps)
ratings (id, user_id, store_id, rating, timestamps)
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 📊 Key Features

### Dashboard Analytics
- Total users count
- Total stores count
- Total ratings submitted
- Real-time statistics

### Advanced Filtering
- Search by name, email, address
- Filter by user roles
- Sort by multiple fields
- Ascending/descending order

### Rating System
- 1-5 star rating scale
- Real-time average calculation
- User-specific rating tracking
- Rating modification support

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern, clean interface
- Interactive star rating system
- Real-time form validation
- Toast notifications
- Loading states and error handling

## 🧪 Testing

The application includes comprehensive validation and error handling:
- Form validation with real-time feedback
- API error handling
- Authentication state management
- Role-based route protection

## 📈 Performance Optimizations

- Efficient database queries with proper indexing
- Connection pooling for database
- Optimized React components
- Lazy loading and code splitting ready
- Responsive image handling

## 🔧 Development

### Available Scripts
- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run server:prod` - Start backend in production mode
- `npm run build` - Build frontend for production

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/update-password` - Update password

#### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - List users
- `POST /api/admin/stores` - Create store
- `GET /api/admin/stores` - List stores

#### Store Routes
- `GET /api/stores` - List stores for users
- `POST /api/stores/rating` - Submit/update rating
- `GET /api/stores/owner/dashboard` - Store owner dashboard

## 🚀 Deployment

The application is ready for deployment on various platforms:
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Heroku, Railway, or any Node.js hosting
- Database: MySQL on cloud providers

## 📝 License

This project is created for the Roxiler coding challenge.

---

**Built with ❤️ for Roxiler Systems**

## How to test (PowerShell)

If you're on Windows and using PowerShell, the easiest way to test the deployed backend is with `Invoke-RestMethod` or the included script.

1. Run the provided script (uses the deployed Render URL):

```powershell
.
\scripts\test-login.ps1
```

2. Or run manually:

```powershell
$body = @{ email='admin@roxiler.com'; password='Admin@123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'https://roxiler-store-rating-raiq.onrender.com/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

Notes:
- If you use `curl.exe` from PowerShell, prefer using a here-string or write the JSON to a file and use `--data-binary @file` to avoid quoting issues.
- If the server returns 500, check Render Live Tail logs and verify `JWT_SECRET` and DB env vars are set in the Render dashboard.