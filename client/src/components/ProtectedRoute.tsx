import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { token, isAdmin } = useAuth();

    if (!token || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};
