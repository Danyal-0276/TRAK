import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { SkeletonPageBlocks } from './skeletons/SkeletonLayouts';
import { disableAdminAppPreview, isAdminAppPreview } from '../utils/adminAppPreview';

/** Protected route for regular app pages — admins are sent to the admin panel unless preview mode is on. */
const UserOnlyRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const preview = isAdminAppPreview();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: isDark ? theme.colors.background : '#ffffff' }}>
        <SkeletonPageBlocks isDark={isDark} colors={theme.colors} minHeight="100vh" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (isAdmin && !preview) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      {isAdmin && preview ? (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '8px 16px',
            fontSize: 13,
            background: isDark ? '#1e293b' : '#eff6ff',
            color: isDark ? '#e2e8f0' : '#1e40af',
            borderBottom: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`,
          }}
        >
          <span>Admin preview mode</span>
          <Link
            to="/admin/dashboard"
            onClick={() => disableAdminAppPreview()}
            style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}
          >
            Return to admin panel
          </Link>
        </div>
      ) : null}
      {children}
    </>
  );
};

export default UserOnlyRoute;
