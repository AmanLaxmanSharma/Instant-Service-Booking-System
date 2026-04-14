import { Navigate } from 'react-router-dom';
import { useAuth } from '../../models/context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
    const { currentUser, userRole, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    // If authentication is required but user is not logged in
    if (requireAuth && !currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If user is logged in but doesn't have required role
    if (currentUser && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        switch (userRole) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'vendor':
                return <Navigate to="/vendor" replace />;
            case 'user':
            default:
                return <Navigate to="/services" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
