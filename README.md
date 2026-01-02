# REST API with Express, Jest, and Swagger

This project provides a REST API built with **TypeScript** and Express. It includes automated tests using Jest and Supertest and interactive API documentation via Swagger UI.

## Tech Stack
- **TypeScript** - Type-safe development
- **Express** - Web framework
- **MongoDB/Mongoose** - Database
- **JWT Authentication** - Secure access tokens
- **Jest + Supertest** - Testing
- **Swagger** - API documentation

## Prerequisites
- Node.js 18 or later
- MongoDB running locally or connection string to MongoDB instance

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables. Create `.env.dev` (preferred for local) or `.env` with values like:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/second_assignment
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Run the server in development mode with hot-reloading:
   ```bash
   npm run dev
   ```

5. Run tests:
   ```bash
   npm test
   ```

6. Start in production mode (after building):
   ```bash
   npm start
   ```

## API Overview
- **Health check**: `GET /api/health`
- **Items CRUD**: `GET /api/items`, `POST /api/items`, `GET /api/items/:id`, `PUT /api/items/:id`, `DELETE /api/items/:id`
- **User Authentication**: `POST /api/user/register`, `POST /api/user/login`, `POST /api/user/logout`, `POST /api/user/refresh`
- **User Profile**: `GET /api/user/profile`, `PUT /api/user/profile`, `DELETE /api/user/profile`, `GET /api/user/:sender_id`
- **Posts**: `POST /api/post`, `GET /api/post`, `GET /api/post/:post_id`, `GET /api/post?sender=sender_id`, `PUT /api/post/:post_id`
- **Comments**: `POST /api/comment`, `GET /api/comment/:comment_id`, `PUT /api/comment/:comment_id`, `DELETE /api/comment/:comment_id`, `GET /api/comment?post=post_id`
- **Swagger UI**: `GET /api/docs`

## Project Structure
```
src/
├── config/        # Database configuration
├── controllers/   # Request handlers
├── middleware/    # Auth middleware
├── models/        # Mongoose schemas
├── routes/        # API routes
├── types/         # TypeScript type definitions
├── app.ts         # Express app setup
└── server.ts      # Server entry point
tests/             # Jest test suites
dist/              # Compiled JavaScript output
```

## Authentication
The API uses JWT-based authentication with access and refresh tokens. Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Development
- TypeScript source files are in `src/`
- Compiled JavaScript output goes to `dist/`
- Use `npm run dev` for development with auto-reload
- Use `npm run build` to compile TypeScript
- Run `npm test` to execute all tests (37 tests total)
