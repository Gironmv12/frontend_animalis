import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // default timeout: requests taking longer than this will be aborted
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry interceptor: exponential backoff for transient errors (network / 5xx / 429)
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    // If no config, cannot retry
    if (!config) return Promise.reject(error);

    // max retry count
    const maxRetries = 3;

    // init retry counter
    // @ts-ignore
    config.__retryCount = config.__retryCount || 0;

    // Conditions to retry: network error (no response), timeout (code ECONNABORTED), or 5xx/429
    const shouldRetry =
      !error.response ||
      error.code === "ECONNABORTED" ||
      [502, 503, 504, 429].includes(error?.response?.status ?? 0);

    // @ts-ignore
    if (shouldRetry && config.__retryCount < maxRetries) {
      // @ts-ignore
      config.__retryCount += 1;
      const delay = Math.pow(2, config.__retryCount) * 500; // 500ms, 1s, 2s
      await sleep(delay);
      try {
        // Retry the request
        return api(config);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // No retry or retries exhausted
    return Promise.reject(error);
  }
);

export default api;
