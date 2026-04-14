# Copy Instant Backend API

A comprehensive backend API for the Copy Instant service booking system, built with Node.js, Express, and MongoDB Atlas.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, profile management
- **Provider Management**: Vendor profiles, services, availability
- **Booking System**: Service booking, status tracking, provider matching
- **Payment Integration**: Razorpay payment gateway for online payments
- **Location Services**: Geospatial queries for finding nearby providers
- **Security**: Rate limiting, input validation, CORS, helmet security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Geospatial**: Geolib for distance calculations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the values:
   ```bash
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/copy-instant?retryWrites=true&w=majority

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d

   # Razorpay Payment Gateway
   RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

### Razorpay Setup

1. **Create a Razorpay account** at [https://razorpay.com](https://razorpay.com)
2. **Get API Keys** from Dashboard → Settings → API Keys
3. **Update .env file** with your Razorpay Key ID and Key Secret
4. **For testing**, use test keys (starts with `rzp_test_`)
5. **For production**, use live keys (starts with `rzp_live_`)

### Payment Flow

1. **Create Order**: Frontend calls `/api/payments/create-order` with booking details
2. **Payment**: User completes payment on Razorpay checkout
3. **Verify**: Backend verifies payment signature via `/api/payments/verify`
4. **Confirm Booking**: Booking status updated to confirmed after successful payment
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Other configurations as needed
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Providers
- `GET /api/providers` - Get all providers (with location filtering)
- `GET /api/providers/:id` - Get single provider
- `POST /api/providers` - Create provider profile (vendor only)
- `PUT /api/providers/:id` - Update provider profile
- `GET /api/providers/dashboard/stats` - Get provider dashboard stats
- `POST /api/providers/seed` - Seed mock providers (admin only)

### Health Check
- `GET /api/health` - API health check

## User Roles

- **user**: Regular customers who can book services
- **vendor**: Service providers who can offer services
- **admin**: System administrators with full access

## Database Models

### User
- Personal information, authentication, role management

### Provider
- Business details, services offered, location, ratings

### Booking
- Service bookings, status tracking, payment info

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Role-based access control

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Project Structure

```
backend/
├── config/          # Database and configuration files
├── middleware/      # Authentication and other middleware
├── models/         # MongoDB schemas
├── routes/         # API route handlers
├── .env            # Environment variables
├── index.js        # Main application file
├── package.json    # Dependencies and scripts
└── README.md       # This file
```

## Deployment

1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to hosting platform (Heroku, DigitalOcean, etc.)
4. Set up proper CORS origins for production

## Contributing

1. Follow the existing code style
2. Add proper validation for all inputs
3. Include error handling
4. Test API endpoints thoroughly
5. Update documentation for new features
