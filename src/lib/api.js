import axios from 'axios';
import { getSecureItem } from './storage.js';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL: API_URL });

let currentToken = null;
let currentRefreshToken = null;
let isRefreshing = false;
let refreshSubscribers = [];
let sessionUpdater = null;

let loadingListeners = new Set();
let requestCount = 0;
function notifyLoading() {
  loadingListeners.forEach((fn) => fn(requestCount > 0));
}
export function onLoadingChange(fn) {
  loadingListeners.add(fn);
  return () => loadingListeners.delete(fn);
}

if (typeof window !== 'undefined') {
  try {
    const stored = getSecureItem('session') || JSON.parse(localStorage.getItem('minimi-agri-session') || 'null');
    if (stored) {
      currentToken = stored?.accessToken ?? null;
      currentRefreshToken = stored?.refreshToken ?? null;
    }
  } catch {
    // ignore invalid stored session
  }
}

export function setSessionToken(token, refreshToken) {
  currentToken = token;
  currentRefreshToken = refreshToken;
}

export function setSessionUpdater(updater) {
  sessionUpdater = updater;
}

function onRefreshed(token, refreshToken) {
  refreshSubscribers.forEach((callback) => callback({ token, refreshToken }));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

function refreshAuthToken() {
  return axios.post(`${API_URL}/auth/refresh-token`, { refreshToken: currentRefreshToken });
}

api.interceptors.request.use((config) => {
  const url = typeof config.url === 'string' ? config.url : '';
  if (!url.includes('/auth/refresh-token')) {
    requestCount += 1;
    notifyLoading();
  }

  if (!config.headers) {
    config.headers = {};
  }

  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    requestCount = Math.max(0, requestCount - 1);
    notifyLoading();
    return response;
  },
  async (error) => {
    requestCount = Math.max(0, requestCount - 1);
    notifyLoading();

    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry && currentRefreshToken) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(({ token, refreshToken }) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await refreshAuthToken();
        const { accessToken, refreshToken } = response.data;
        setSessionToken(accessToken, refreshToken);
        sessionUpdater?.({ accessToken, refreshToken });
        onRefreshed(accessToken, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setSessionToken(null, null);
        sessionUpdater?.(null);
        onRefreshed(null, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export async function tryApi(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    if (err?.response?.status === 401) {
      throw err;
    }
    console.warn('[api] request failed, using fallback data:', err?.message);
    return fallback;
  }
}
