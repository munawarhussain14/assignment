import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import PostCard from "./PostCard";

const ITEMS_PER_PAGE = 10;

const Feed = () => {
  const { token, user } = useAuth();
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef();
  const { logout } = useAuth();

  // Initial load of posts
  const { data, loading, error, refetch } = useApi("/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: { page: 1, limit: ITEMS_PER_PAGE },
  });

  // Load initial posts when data changes
  useEffect(() => {
    if (data?.posts) {
      setDisplayedPosts(data.posts);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setHasMore((data.currentPage || 1) < (data.totalPages || 0));
    }
  }, [data]);

  // Function to load more posts
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

  // Intersection Observer for infinite scroll
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

  // Delete post functionality
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

        {/* Page info */}
        {totalPages > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages} • {displayedPosts.length} posts
            loaded
          </div>
        )}

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

        {(loading || isLoadingMore) && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

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
