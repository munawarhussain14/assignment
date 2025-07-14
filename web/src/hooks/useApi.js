import { useState, useEffect, useRef } from "react";

const cache = new Map();

export const useApi = (resource, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    method = "GET",
    body = null,
    headers = {},
    skip = false,
    cacheKey = resource,
    enableCache = true,
    params = {},
  } = options;

  const fetchData = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if enabled
      if (enableCache && cache.has(cacheKey) && method === "GET") {
        setData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Build URL with query parameters
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

      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal,
      };

      if (body && method !== "GET") {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result if enabled and it's a GET request
      if (enableCache && method === "GET") {
        cache.set(cacheKey, result);
      }

      setData(result);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skip) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    fetchData(abortControllerRef.current.signal);

    // Cleanup function
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

  const refetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  };

  const clearCache = () => {
    cache.clear();
  };

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
