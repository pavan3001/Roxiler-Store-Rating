# Roxiler Store Rating Platform

## Overview
Roxiler Store Rating is a web application for managing and rating stores. It features an admin dashboard, user and store management, and a secure rating system. The project uses a React frontend, Node.js/Express backend, and a MySQL database.

## Features
- Admin dashboard for managing users and stores
- Store rating and review system
- User authentication and protected routes
- Responsive UI with Tailwind CSS
- Role-based access (Admin, Store Owner, User)
- Secure password management

## Project Structure
```
project/
  server/           # Backend (Node.js/Express)
    controllers/    # API controllers
    config/         # Database config
    middleware/     # Auth middleware
    routes/         # API routes
    index.js        # Server entry point
  src/              # Frontend (React)
    components/     # Reusable UI components
    context/        # React context (Auth)
    pages/          # Main pages (Dashboard, Login, etc.)
    types/          # TypeScript types
    utils/          # API utilities
    App.tsx         # App root
    index.css       # Global styles
```

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MySQL database

### Backend Setup
1. Navigate to the `project/server` directory.
2. Configure your database in `config/database.js`.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `project` directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage
- Login as an admin to access the dashboard.
- Add, edit, or delete users and stores.
- Rate stores and view ratings.
- Use the filter and search features to manage data efficiently.

## Security & Best Practices
- Passwords are securely managed.
- Footer component is protected by repository policy and should not be removed or altered.
- Use GitHub branch protection rules for production deployments.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request for review.

## License
This project is licensed. All rights reserved.

## Author
Pavan Kumar Kolipakula
