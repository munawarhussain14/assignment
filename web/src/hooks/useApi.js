import { useState, useEffect, useRef } from "react";

// In-memory cache for storing API responses
const cache = new Map();

/**
 * Custom hook for making API requests with caching, abort control, and error handling
 * @param {string} resource - The API endpoint URL
 * @param {Object} options - Configuration options for the request
 * @param {string} [options.method='GET'] - HTTP method to use
 * @param {Object} [options.body=null] - Request body data
 * @param {Object} [options.headers={}] - Custom request headers
 * @param {boolean} [options.skip=false] - Whether to skip the request
 * @param {string} [options.cacheKey=resource] - Custom cache key
 * @param {boolean} [options.enableCache=true] - Whether to enable caching
 * @param {Object} [options.params={}] - URL query parameters
 * @returns {Object} Request state and control functions
 */
export const useApi = (resource, options = {}) => {
  // State for managing request lifecycle
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Destructure options with defaults
  const {
    method = "GET",
    body = null,
    headers = {},
    skip = false,
    cacheKey = resource,
    enableCache = true,
    params = {},
  } = options;

  /**
   * Makes the API request and handles response
   * @param {AbortSignal} signal - AbortController signal for request cancellation
   */
  const fetchData = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      // Return cached data if available and caching is enabled
      if (enableCache && cache.has(cacheKey) && method === "GET") {
        setData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Construct URL with query parameters
      let url = resource;
      if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value);
          }
        });
        url = `${resource}?${searchParams.toString()}`;
      }

      // Prepare request configuration
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal,
      };

      // Add body for non-GET requests
      if (body && method !== "GET") {
        config.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache GET request results if enabled
      if (enableCache && method === "GET") {
        cache.set(cacheKey, result);
      }

      setData(result);
    } catch (err) {
      // Only set error if not an abort error
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle request lifecycle
  useEffect(() => {
    if (skip) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    fetchData(abortControllerRef.current.signal);

    // Cleanup: abort request if component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    resource,
    method,
    JSON.stringify(body),
    JSON.stringify(headers),
    JSON.stringify(params),
    skip,
  ]);

  /**
   * Manually triggers a new request
   */
  const refetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  };

  /**
   * Clears entire cache
   */
  const clearCache = () => {
    cache.clear();
  };

  /**
   * Clears cache for specific key
   * @param {string} key - Cache key to clear
   */
  const clearCacheFor = (key) => {
    cache.delete(key);
  };

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    clearCacheFor,
  };
};
