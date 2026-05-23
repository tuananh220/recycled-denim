import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('indigo.accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (r) => r,
    async (err) => {
      const original = err.config;
      if (err.response?.status === 401 && !original?._retry) {
        original._retry = true;
        const refreshToken = localStorage.getItem('indigo.refreshToken');
        if (refreshToken) {
          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/refresh`,
              { refreshToken },
            );
            localStorage.setItem('indigo.accessToken', data.accessToken);
            localStorage.setItem('indigo.refreshToken', data.refreshToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
          } catch {
            localStorage.removeItem('indigo.accessToken');
            localStorage.removeItem('indigo.refreshToken');
          }
        }
      }
      return Promise.reject(err);
    },
  );
}
