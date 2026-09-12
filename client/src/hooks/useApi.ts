import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isExpiredAdminSession =
            error.response?.status === 401 &&
            window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login' &&
            !String(error.config?.url || '').includes('/auth/login');

        if (isExpiredAdminSession) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('/admin/login?session=expired');
        }

        return Promise.reject(error);
    }
);

export const useMenu = () => {
    const categories = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/menu/categories').then((res) => res.data),
    });

    const menuItems = useQuery({
        queryKey: ['menu-items'],
        queryFn: () => api.get('/menu/items').then((res) => res.data),
    });

    return { categories, menuItems };
};

export const createOrder = (orderData: any) => api.post('/orders/checkout', orderData).then((res) => res.data);
export const loginUser = (data: any) => api.post('/auth/login', data).then((res) => res.data);
export const registerUser = (data: any) => api.post('/auth/register', data).then((res) => res.data);
export const verifyEmail = (data: { email: string; pin: string }) => api.post('/auth/verify', data).then((res) => res.data);
export const createLead = (data: any) => api.post('/leads', data).then((res) => res.data);
export const getLeads = () => api.get('/leads').then((res) => res.data);
export const updateLeadStatus = (id: string, status: string) => api.patch(`/leads/${id}/status`, { status }).then((res) => res.data);
export const createMessage = (data: any) => api.post('/messages', data).then((res) => res.data);
export const getMessages = () => api.get('/messages').then((res) => res.data);

// Settings API
export const getSettings = () => api.get('/settings').then((res) => res.data);
export const updateSettings = (data: any) => api.put('/settings', data).then((res) => res.data);

// Menu API
export const createCategory = (data: any) => api.post('/menu/categories', data).then((res) => res.data);
export const updateCategory = (id: string, data: any) => api.patch(`/menu/categories/${id}`, data).then((res) => res.data);
export const deleteCategory = (id: string) => api.delete(`/menu/categories/${id}`).then((res) => res.data);

export const createMenuItem = (data: FormData) => api.post('/menu/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
export const updateMenuItem = (id: string, data: FormData) => api.patch(`/menu/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
export const deleteMenuItem = (id: string) => api.delete(`/menu/items/${id}`).then((res) => res.data);

// Catering Packages API
export const getCateringPackages = () => api.get('/catering/packages').then((res) => res.data);
export const getCateringPackage = (id: string) => api.get(`/catering/packages/${id}`).then((res) => res.data);
export const createCateringPackage = (data: any) => api.post('/catering/packages', data).then((res) => res.data);
export const updateCateringPackage = (id: string, data: any) => api.patch(`/catering/packages/${id}`, data).then((res) => res.data);
export const deleteCateringPackage = (id: string) => api.delete(`/catering/packages/${id}`).then((res) => res.data);

// Catering Orders API
export const createCateringOrder = (data: any) => api.post('/catering/orders', data).then((res) => res.data);
export const getCateringOrders = () => api.get('/catering/orders').then((res) => res.data);
export const updateCateringOrderStatus = (id: string, status: string) => api.patch(`/catering/orders/${id}/status`, { status }).then((res) => res.data);

// User Dashboard APIs
export const getUserDashboard = () => api.get('/users/dashboard').then((res) => res.data);
export const requestCateringChange = (orderId: string, requestedChanges: string) => api.post(`/catering/orders/${orderId}/change-requests`, { requestedChanges }).then((res) => res.data);
export const clearNotification = (id: string) => api.patch(`/notifications/${id}/clear`).then((res) => res.data);

// Regular Orders API
export const getOrders = (params?: any) => api.get('/orders', { params }).then((res) => res.data);
export const updateOrderStatus = (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }).then((res) => res.data);

// Admin User Management
export const getAdminUsers = () => api.get('/users').then((res) => res.data);
export const updateAdminUser = (id: string, data: any) => api.patch(`/users/${id}`, data).then((res) => res.data);
export const deleteAdminUser = (id: string) => api.delete(`/users/${id}`).then((res) => res.data);
