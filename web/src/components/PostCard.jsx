// Import React's memo function for component optimization
import { memo } from "react";

/**
 * PostCard Component
 * Displays a social media style post card with user info and content
 *
 * @param {Object} post - The post object containing id, title and content
 * @param {Function} onDelete - Callback function to handle post deletion
 * @param {boolean} canDelete - Flag to determine if delete button should be shown
 */
const PostCard = memo(({ post, onDelete, canDelete }) => {
  return (
    // Main card container
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-4">
        {/* Header with profile info */}
        <div className="flex items-center mb-4">
          {/* User avatar placeholder */}
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
          {/* User info */}
          <div className="ml-3">
            <p className="font-semibold text-gray-900">User {post.id}</p>
            <p className="text-xs text-gray-500">3 hours ago</p>
          </div>
          {/* Delete button - only shown if canDelete is true */}
          {canDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              {/* Three dots menu icon */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Post content */}
        <div>
          {/* Post title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {post.title}
          </h3>
          {/* Post text content with preserved whitespace */}
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </div>
  );
});

// Set display name for debugging purposes
PostCard.displayName = "PostCard";

export default PostCard;
