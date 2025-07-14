# Express.js RBAC Application

A Node.js/Express.js application implementing Role-Based Access Control (RBAC) for a social network backend.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Middleware for protecting routes based on user roles
- **Protected Endpoints**: DELETE operations restricted to admin users only
- **Comprehensive Testing**: Unit tests covering all major scenarios

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment variables**:

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env file with your configuration
   # Make sure to change the JWT_SECRET in production
   ```

3. **Start the server**:

   ```bash
   npm start
   ```

   Or for development with auto-restart:

   ```bash
   npm run dev
   ```

4. **Run tests**:

   ```bash
   npm test
   ```

5. **Access API Documentation**:
   - Open your browser and go to `http://localhost:3000/api-docs`
   - Or visit `http://localhost:3000` to be redirected to the docs

## API Endpoints

### Authentication

#### POST /login

Returns a JWT token for authentication.

**Request Body**:

```json
{
  "userId": "u1"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u1",
    "role": "user"
  }
}
```

### Posts

#### GET /posts

Returns all posts (public endpoint).

**Response**:

```json
{
  "message": "Posts retrieved successfully",
  "posts": [
    {
      "id": "1",
      "title": "First Post",
      "content": "Hello World!"
    }
  ]
}
```

#### DELETE /posts/:id

Deletes a post (admin only).

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
  "message": "Post deleted successfully",
  "deletedPost": {
    "id": "1",
    "title": "First Post",
    "content": "Hello World!"
  }
}
```

### Health Check

#### GET /health

Returns server health status.

**Response**:

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Available Users

The application includes two hard-coded users for testing:

- **Regular User**: `{id: "u1", role: "user"}`
- **Admin User**: `{id: "u2", role: "admin"}`

## RBAC Middleware

The `authorize(roles)` middleware:

1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies the token signature and expiration
3. Checks if the user's role is included in the allowed roles array
4. Returns 403 Forbidden if role is not authorized
5. Adds user information to `req.user` and calls `next()` if authorized

## Testing

The application includes comprehensive unit tests covering:

1. **Successful delete by admin** - Admin can delete posts
2. **Forbidden delete by normal user** - Regular users get 403 error
3. **Missing/invalid token** - Proper error handling for authentication issues

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The tests cover:

- Authentication flow
- RBAC middleware functionality
- Protected endpoint access
- Error handling
- Edge cases

## Error Responses

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "userId is required"
}
```

### 401 Unauthorized

```json
{
  "error": "Access token required",
  "message": "Authorization header must start with Bearer"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Post not found",
  "message": "Post with the provided ID does not exist"
}
```

## Environment Variables

The application uses the following environment variables:

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT token signing (required)
- `NODE_ENV`: Environment mode (development/production)

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the values in `.env` file
3. **Important**: Change `JWT_SECRET` in production

## Security Considerations

- JWT secret should be stored in environment variables in production
- Token expiration is set to 1 hour
- All sensitive endpoints require proper authentication
- Role-based access control prevents unauthorized operations

## Project Structure

```
expressjs/
├── app.js              # Main Express application
├── app.test.js         # Unit tests
├── package.json        # Dependencies and scripts
├── jest.config.js      # Jest configuration
└── README.md          # This file
```
