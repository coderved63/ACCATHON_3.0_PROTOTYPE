import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (email, password) => api.post('/auth/signup', { email, password }),
};

export const financeApi = {
    getHistorical: () => api.get('/financials/historical'),
    getValuation: () => api.get('/financials/valuation'),
    getAssumptions: () => api.get('/financials/assumptions'),
};

export default api;
