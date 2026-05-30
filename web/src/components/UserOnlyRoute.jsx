import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { SkeletonPageBlocks } from './skeletons/SkeletonLayouts';

/** Protected route for regular app pages — admins are sent to the admin panel only. */
const UserOnlyRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: isDark ? theme.colors.background : '#ffffff' }}>
        <SkeletonPageBlocks isDark={isDark} colors={theme.colors} minHeight="100vh" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default UserOnlyRoute;
