import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { SkeletonPageBlocks } from './skeletons/SkeletonLayouts';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const { theme } = useTheme();
    const isDark = theme.mode === 'dark';

    if (loading) {
        return (
            <div className="trak-app-page" style={{ background: 'var(--trak-bg)' }}>
                <SkeletonPageBlocks isDark={isDark} colors={theme.colors} minHeight="100vh" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/newsfeed" replace />;
    }

    return children;
};

export default ProtectedRoute;

