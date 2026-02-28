import axios from 'axios';

export const setupAxiosInterceptor = () => {
  // Add Authorization header to all requests
  axios.interceptors.request.use(
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

  // Handle 401 responses globally
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('❌ Unauthorized! Token might have expired.');
        console.error('Authorization Header:', axios.defaults.headers.common['Authorization']);
        // Clear storage and redirect to login if needed
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optionally redirect: window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
