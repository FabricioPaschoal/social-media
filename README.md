# SocialAI - AI-Powered Social Media SaaS Platform

A full-stack SaaS platform that automatically generates and publishes social media posts using AI. Built with Next.js, NestJS, MongoDB, and OpenAI.

## Architecture

```
social-media-saas/
├── backend/          # NestJS API server
│   └── src/
│       ├── auth/             # Authentication (JWT, Passport)
│       ├── users/            # User management
│       ├── social-accounts/  # Facebook/Instagram OAuth & API
│       ├── posts/            # Post CRUD & publishing
│       ├── ai/               # OpenAI content generation
│       └── scheduler/        # Cron-based auto-publishing
├── frontend/         # Next.js App Router
│   └── src/
│       ├── app/              # Pages (App Router)
│       ├── components/       # UI components
│       ├── context/          # Auth context
│       ├── hooks/            # Custom hooks
│       ├── services/         # API service layer
│       ├── lib/              # Axios instance
│       └── types/            # TypeScript types
```

## Features

- **User Authentication**: JWT-based auth with HttpOnly cookies
- **Social Account Management**: Facebook & Instagram OAuth integration
- **AI Content Generation**: OpenAI-powered post generation with variations
- **Post Management**: Create, edit, schedule, and publish posts
- **Auto-Publishing Scheduler**: Cron-based scheduler for scheduled posts
- **Dashboard**: Overview of post statistics and recent activity
- **Multi-tenant**: Each user manages their own accounts and posts

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router), TailwindCSS |
| Backend   | NestJS 10, Passport JWT           |
| Database  | MongoDB (Mongoose)                |
| AI        | OpenAI GPT-4o                     |
| Social    | Facebook Graph API, Instagram Graph API |
| Scheduler | @nestjs/schedule (Cron)           |

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- OpenAI API key
- Facebook App (for social media integration)

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/social-media-saas
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRATION=7d
OPENAI_API_KEY=sk-your-openai-api-key
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:4000/api/social-accounts/facebook/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Getting Started

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 4. Start the applications

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/api/docs

## End-to-End Flow

1. **Sign Up** - Create an account at `/auth/signup`
2. **Log In** - Sign in at `/auth/login`
3. **Connect Social Accounts** - Link Facebook/Instagram at `/social-accounts`
4. **Create Post** - Go to `/posts/create`
5. **Generate with AI** - Fill in the AI form and click "Generate with AI"
6. **Edit & Confirm** - Review and edit the AI-generated content
7. **Publish or Schedule** - Choose "Post Now", "Schedule", or "Save Draft"
8. **View Results** - Check the dashboard and post history

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile

### Social Accounts
- `GET /api/social-accounts` - List connected accounts
- `GET /api/social-accounts/facebook/auth-url` - Get Facebook OAuth URL
- `GET /api/social-accounts/facebook/callback` - OAuth callback
- `DELETE /api/social-accounts/:id` - Disconnect account

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - List posts (with pagination & filters)
- `GET /api/posts/dashboard` - Get dashboard stats
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish post

### AI
- `POST /api/ai/generate` - Generate post content with AI

### Logs
- `GET /api/logs` - Get publishing logs

## AI Prompt Template

The AI module uses the following prompt structure:

```
Generate a complete social-media post based on the following data:
Description: {postDescription}
Goal: {goal}
Audience: {audience}
Tone: {tone}
Media type: {mediaType}
Mandatory keywords: {mandatoryKeywords}
Brand: {brandName}

Returns JSON with: caption, hashtags[], imagePrompt, title, category, emojis[], variations[]
```

## Database Schemas

- **users** - User accounts with hashed passwords
- **social_accounts** - Connected Facebook/Instagram accounts with tokens
- **posts** - Social media posts with status tracking
- **logs** - Publishing activity logs

## License

MIT
