import axios from 'axios';

const api = axios.create({
    // NAS 백엔드 주소를 기본값으로 사용하고,
    // 환경변수(NEXT_PUBLIC_API_BASE_URL)가 있으면 그 값을 우선 사용합니다.
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.0.2:3001',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
