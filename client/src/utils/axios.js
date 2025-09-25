import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, always use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  
  // In production, use REACT_APP_API_URL or fallback to same origin
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    // Normalize the URL - remove trailing slashes and /api if present
    return apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  
  // Fallback to same origin (when frontend and backend are on same domain)
  return '';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 second timeout
  withCredentials: false // Use Authorization header instead of cookies
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
