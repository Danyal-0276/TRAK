import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TrakLogo from './TrakLogo';
import {
  Home,
  Compass,
  LayoutGrid,
  TrendingUp,
  Bookmark,
  Clock,
  Bell,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../context/AuthContext';

const NAV_MAIN = [
  { path: '/newsfeed', label: 'Home', icon: Home },
  { path: '/search', label: 'Explore', icon: Compass },
  { path: '/categories', label: 'Categories', icon: LayoutGrid },
  { path: '/trending', label: 'Trending', icon: TrendingUp },
];

const NAV_LIBRARY = [
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { path: '/recent', label: 'Recent', icon: Clock },
];

const NAV_ACCOUNT = [
  { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function MainNavSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDesktop } = useResponsive();
  const { isAdmin } = useAuth();

  const hidePaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/forgot-password-code',
    '/reset-password',
    '/password-changed',
    '/tag-selection',
    '/keyword-selection',
    '/verify-email',
    '/terms',
    '/privacy',
  ];

  if (!isDesktop || hidePaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  const renderGroup = (label, items) => (
    <div className="trak-nav-group" key={label}>
      <div className="trak-nav-lbl">{label}</div>
      {items.map(({ path, label: itemLabel, icon: Icon, badge }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            className={`trak-nav-btn${active ? ' active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={17} className="trak-nav-ico" />
            {itemLabel}
            {badge && <span className="trak-n-badge">3</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="trak-main-nav">
      <div className="trak-logo-wrap" onClick={() => navigate('/newsfeed')} role="presentation">
        <TrakLogo size={36} variant="auto" />
        <span className="trak-logo-word">
          TR<em>A</em>K
        </span>
      </div>

      {renderGroup('Discover', NAV_MAIN)}
      {renderGroup('Library', NAV_LIBRARY)}
      {renderGroup('Account', NAV_ACCOUNT)}

      <div className="trak-sidebar-foot">
        {isAdmin && (
          <button
            type="button"
            className={`trak-nav-btn${location.pathname.startsWith('/admin') ? ' active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <Shield size={17} className="trak-nav-ico" />
            Admin Panel
          </button>
        )}
        <button
          type="button"
          className="trak-nav-btn"
          onClick={() => navigate('/about')}
        >
          About TRAK
        </button>
      </div>
    </aside>
  );
}
