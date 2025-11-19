# Social App - Next.js Social Media Platform

A complete social media application built with Next.js (App Router), TypeScript, MongoDB, and JWT authentication.

## Features

- **Community (Jamiyat)**: Posts feed with "Following" and "For You" tabs, like, comment, and star donations
- **Process (Jarayon)**: User-created plans with start dates and progress tracking
- **Rewards (Sovrinlar)**: Shop for items (books/merch) purchasable with in-app currency (stars)
- **Profile**: User profiles with posts, followers, following, categories, and settings
- **Authentication**: JWT-based auth with httpOnly cookies

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd my-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
# Get your connection string from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Secret - Use a strong random string in production
# Generate one with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Base URL (optional, for external API calls)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Important**: Never commit `.env.local` to version control!

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string from "Connect" → "Connect your application"
4. Replace `<password>` and `<dbname>` in the connection string
5. Add your connection string to `.env.local` as `MONGODB_URL`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (if configured)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ name, username, email, password }`
  - Returns: Sets httpOnly cookie with JWT

- `POST /api/auth/login` - Login user
  - Body: `{ emailOrUsername, password }`
  - Returns: Sets httpOnly cookie with JWT

- `GET /api/auth/me` - Get current user
  - Returns: `{ user }` or `{ user: null }`

- `POST /api/auth/logout` - Logout user
  - Clears auth cookie

### Posts

- `POST /api/posts/create` - Create post (authenticated)
  - Body: `{ text?, imageUrl? }`
  - Returns: `{ ok: true, post }`

- `GET /api/posts/list` - Get all posts (public)
  - Returns: `{ posts: [...] }`

- `GET /api/posts/following` - Get posts from followed users (authenticated)
  - Returns: `{ posts: [...] }`

- `POST /api/posts/like` - Toggle like on post (authenticated)
  - Body: `{ postId }`
  - Returns: `{ ok: true, liked: boolean, likesCount: number }`

- `POST /api/posts/comment` - Add comment with optional donation (authenticated)
  - Body: `{ postId, text, donatedStars? }`
  - Returns: `{ ok: true, post }`

### User

- `GET /api/user/[username]` - Get user profile
  - Returns: `{ user }`

- `POST /api/user/follow` - Follow/unfollow user (authenticated)
  - Body: `{ targetId }`
  - Returns: `{ ok: true, following: boolean }`

### Process

- `POST /api/process/create` - Create process/plan (authenticated)
  - Body: `{ title, startDate }`
  - Returns: `{ ok: true, process }`

- `GET /api/process/create` - Get user's processes (authenticated)
  - Returns: `{ processes: [...] }`

### Rewards

- `GET /api/items/list` - Get all reward items
  - Returns: `{ items: [...] }`

- `POST /api/items/purchase` - Purchase item with stars (authenticated)
  - Body: `{ itemId }`
  - Returns: `{ ok: true, transaction, remainingStars }`

### Transactions

- `GET /api/transactions/list` - Get user's transactions (authenticated)
  - Returns: `{ transactions: [...] }`

### Notifications

- `GET /api/notifications/list` - Get user's notifications (authenticated)
  - Returns: `{ notifications: [...] }`

- `PUT /api/notifications/list` - Mark notification as read (authenticated)
  - Body: `{ notificationId, read? }`
  - Returns: `{ ok: true, notification }`

## Testing API Endpoints

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3000/api/auth/me -b cookies.txt

# Create post
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world!"}' \
  -b cookies.txt

# Like post
curl -X POST http://localhost:3000/api/posts/like \
  -H "Content-Type: application/json" \
  -d '{"postId":"POST_ID_HERE"}' \
  -b cookies.txt

# Comment with donation
curl -X POST http://localhost:3000/api/posts/comment \
  -H "Content-Type: application/json" \
  -d '{"postId":"POST_ID_HERE","text":"Great post!","donatedStars":10}' \
  -b cookies.txt

# Follow user
curl -X POST http://localhost:3000/api/user/follow \
  -H "Content-Type: application/json" \
  -d '{"targetId":"USER_ID_HERE"}' \
  -b cookies.txt
```

### Using Postman/Thunder Client

1. Import the collection (create manually based on endpoints above)
2. For authenticated requests, ensure cookies are enabled
3. After login/register, the `token` cookie will be set automatically
4. Use "Include cookies" option in your HTTP client

## Database Models

- **User**: name, username, email, passwordHash, bio, avatarUrl, followers[], following[], stars, categories[], isPremium
- **Post**: author, text, imageUrl, likes[], comments[]
- **Process**: owner, title, startDate, status, metadata
- **Notification**: user, title, imageUrl, description, read
- **Item**: title, description, priceStars, imageUrl, stock, category
- **Transaction**: fromUser, toUser, post, amountStars, type

## Security Features

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens stored in httpOnly cookies
- Secure cookies in production (`secure: true`)
- SameSite: 'lax' for CSRF protection
- Token expiry: 7 days
- Password hashes never returned in API responses
- Input validation on all endpoints

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

### Other Platforms

- Ensure Node.js 18+ is available
- Set environment variables
- Run `npm run build` and `npm start`
- Configure MongoDB Atlas IP whitelist to allow your server IP

## Testing

Basic test structure (to be expanded):

```bash
# Run tests (when implemented)
npm test
```

## Project Structure

```
my-app/
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth/        # Authentication endpoints
│   │   ├── posts/       # Post endpoints
│   │   ├── user/        # User endpoints
│   │   ├── process/     # Process endpoints
│   │   ├── items/       # Reward items endpoints
│   │   ├── transactions/# Transaction endpoints
│   │   └── notifications/# Notification endpoints
│   ├── components/      # React components
│   ├── community/       # Community page
│   ├── process/         # Process page
│   ├── rewards/         # Rewards page
│   ├── profile/         # Profile pages
│   ├── login/           # Login page
│   └── register/        # Register page
├── lib/                 # Utilities
│   └── mongodb.ts       # MongoDB connection
├── models/              # Mongoose models
├── services/            # Business logic
├── utils/               # Helper functions
└── .env.local           # Environment variables (not in git)
```

## Troubleshooting

### MongoDB Connection Issues

- Verify your connection string is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Ensure database user has proper permissions

### Authentication Issues

- Check that cookies are enabled in your browser
- Verify `JWT_SECRET` is set in `.env.local`
- Clear cookies and try logging in again

### Build Errors

- Ensure all TypeScript types are correct
- Run `npm run lint` to check for issues
- Clear `.next` folder and rebuild

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
