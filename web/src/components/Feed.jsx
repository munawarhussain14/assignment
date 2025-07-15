import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import PostCard from "./PostCard";

// Number of posts to load per page
const ITEMS_PER_PAGE = 10;

/**
 * Feed component that displays posts with infinite scroll functionality
 * Handles post loading, deletion and user authentication
 */
const Feed = () => {
  const { token, user } = useAuth();
  const [displayedPosts, setDisplayedPosts] = useState([]); // Array of posts currently displayed
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [hasMore, setHasMore] = useState(true); // Whether there are more posts to load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading state for pagination
  const observerRef = useRef(); // Ref for intersection observer
  const { logout } = useAuth();

  // Initial load of posts using custom useApi hook
  const { data, loading, error, refetch } = useApi("/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: { page: 1, limit: ITEMS_PER_PAGE },
  });

  // Update state when initial posts are loaded
  useEffect(() => {
    if (data?.posts) {
      setDisplayedPosts(data.posts);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setHasMore((data.currentPage || 1) < (data.totalPages || 0));
    }
  }, [data]);

  /**
   * Loads the next page of posts when user scrolls to bottom
   * Updates state with new posts and pagination info
   */
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `/posts?page=${nextPage}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const newData = await response.json();
        if (newData.posts && newData.posts.length > 0) {
          setDisplayedPosts((prev) => [...prev, ...newData.posts]);
          setCurrentPage(newData.currentPage || nextPage);
          setTotalPages(newData.totalPages || totalPages);
          setHasMore(
            (newData.currentPage || nextPage) <
              (newData.totalPages || totalPages)
          );
        } else {
          setHasMore(false);
        }
      } else {
        console.error("Failed to load more posts");
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, token, totalPages]);

  /**
   * Sets up intersection observer for infinite scroll
   * Triggers loadMorePosts when last post comes into view
   */
  const lastElementRef = useCallback(
    (node) => {
      if (loading || isLoadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, isLoadingMore, loadMorePosts]
  );

  /**
   * Handles post deletion
   * Removes post from displayed posts and triggers refetch
   * @param {string} postId - ID of post to delete
   */
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Remove the deleted post from the displayed posts
        setDisplayedPosts((prev) => prev.filter((post) => post.id !== postId));
        // Clear cache to refetch fresh data
        refetch();
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Display error state if posts failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Feed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.id} ({user?.role})
            </span>
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Pagination info */}
        {totalPages > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages} • {displayedPosts.length} posts
            loaded
          </div>
        )}

        {/* Posts list with infinite scroll */}
        <div className="space-y-4">
          {displayedPosts.map((post, index) => {
            if (displayedPosts.length === index + 1) {
              return (
                <div key={post.id} ref={lastElementRef}>
                  <PostCard
                    post={post}
                    onDelete={handleDeletePost}
                    canDelete={user?.role === "admin"}
                  />
                </div>
              );
            } else {
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  canDelete={user?.role === "admin"}
                />
              );
            }
          })}
        </div>

        {/* Loading spinner */}
        {(loading || isLoadingMore) && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* End of feed messages */}
        {!hasMore && displayedPosts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No more posts to load
          </div>
        )}

        {!loading && displayedPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
