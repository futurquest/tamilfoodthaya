import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
