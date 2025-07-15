// Import necessary hooks from React and custom hooks
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

/**
 * LoginForm Component
 * Handles user authentication by accepting a user ID and making login API request
 * Displays a form with error handling and loading states
 */
const LoginForm = () => {
  // State for storing user ID input
  const [userId, setUserId] = useState("");
  // Get login function from auth context
  const { login } = useAuth();

  // Use custom API hook for login endpoint
  const { data, loading, error, refetch } = useApi("/login", {
    method: "POST",
    body: { userId },
    skip: true, // Don't auto-fetch, we'll call refetch manually
  });

  /**
   * Handle form submission
   * Prevents default form behavior and triggers API call if userId is valid
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    await refetch();
  };

  // If login was successful, update auth context and unmount component
  if (data && data.token) {
    login(data.token, data.user);
    return null; // Component will unmount after login
  }

  return (
    // Main container with full screen height and centered content
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Form container with max width and spacing */}
      <div className="max-w-md w-full space-y-8">
        {/* Header section */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use one of the available user IDs: u1 (user) or u2 (admin)
          </p>
        </div>

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Input field container */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="userId" className="sr-only">
                User ID
              </label>
              {/* User ID input field */}
              <input
                id="userId"
                name="userId"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="User ID (u1 or u2)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
