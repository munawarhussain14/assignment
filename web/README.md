# React Frontend - Mini Feed UI

A React Single Page Application (SPA) that demonstrates a mini-feed UI with authentication, infinite scroll, and optimized rendering.

## Features

- **Authentication**: Login form that calls `/login` endpoint and stores JWT in memory
- **Feed Page**: Displays posts from `/posts` endpoint with infinite scroll
- **Custom Hook**: `useApi` hook that manages fetch, JSON-parsing, loading, error, and caching
- **Infinite Scroll**: Loads 10 items at a time with smooth scrolling
- **Optimized Rendering**: Uses `React.memo` to prevent unnecessary re-renders
- **Role-based Features**: Admin users can delete posts

## Prerequisites

- Node.js (v14 or higher)
- The Express.js backend running on port 3000

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:4000`

## Usage

### Available Users

- **User ID**: `u1` (Role: user) - Can view posts
- **User ID**: `u2` (Role: admin) - Can view and delete posts

### Features Demonstrated

1. **Custom useApi Hook**:

   - Manages API calls with loading states
   - Implements caching to prevent unnecessary re-fetches
   - Handles errors gracefully
   - Supports different HTTP methods

2. **Infinite Scroll**:

   - Loads 10 posts at a time
   - Uses Intersection Observer API for performance
   - Smooth scrolling experience

3. **Optimized Rendering**:

   - `PostCard` component uses `React.memo` for performance
   - Only new items mount/unmount, not the whole list
   - Efficient re-rendering with proper key props

4. **Authentication Context**:
   - JWT token management
   - User state persistence
   - Automatic token inclusion in API calls

## Project Structure

```
src/
├── components/
│   ├── LoginForm.jsx      # Login form component
│   ├── Feed.jsx          # Main feed with infinite scroll
│   └── PostCard.jsx      # Individual post card (memoized)
├── context/
│   └── AuthContext.jsx   # Authentication context
├── hooks/
│   └── useApi.js         # Custom API hook with caching
├── App.jsx               # Main app component
└── main.jsx             # Entry point
```

## API Integration

The frontend connects to the Express.js backend through Vite's proxy configuration:

- `/login` - POST request for authentication
- `/posts` - GET request for fetching posts
- `/posts/:id` - DELETE request for deleting posts (admin only)

## Performance Optimizations

1. **Caching**: The `useApi` hook caches GET requests to prevent unnecessary API calls
2. **Memoization**: `PostCard` components are memoized to prevent re-renders
3. **Intersection Observer**: Efficient infinite scroll implementation
4. **Abort Controller**: Cancels pending requests when components unmount

## Development

- **Hot Reload**: Vite provides fast hot module replacement
- **Proxy**: API calls are proxied to the backend automatically
- **Tailwind CSS**: Utility-first CSS framework for styling
