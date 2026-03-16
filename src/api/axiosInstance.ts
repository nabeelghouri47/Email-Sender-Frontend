import axios from 'axios';
import { tokenService } from '../utils/tokenService';
import store from '../redux/store/store';
import { refreshTokenSuccess } from '../actions/authActions';

declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  if (config.requiresAuth !== false) {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    console.log('🔴 API Error:', error.response?.status, error.config?.url);

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      console.log('🔄 401 Error - Attempting token refresh...');
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        console.log('❌ No refresh token found, redirecting to login');
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('📤 Sending refresh token request...');
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        console.log('✅ Token refresh successful');
        const { accessToken, user } = response.data;
        
        tokenService.setTokens(accessToken, response.data.refreshToken || refreshToken);
        if (user) {
          tokenService.setUser(user);
          console.log('💾 User updated in localStorage');
        }

        store.dispatch(refreshTokenSuccess(response.data));
        console.log('📤 Redux store updated');

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        console.log('🔁 Retrying original request...');
        return axiosInstance(originalRequest);
      } catch (err: any) {
        console.error('❌ Token refresh failed:', err.response?.data || err.message);
        processQueue(err, null);
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
