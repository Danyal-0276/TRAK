import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Shield,
  FileText,
  Bell,
  Settings,
  UserCircle,
  LogOut,
  Newspaper,
  Moon,
  Sun,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';
import { enableAdminAppPreview } from '../../../utils/adminAppPreview';
import './adminShell.css';

const MAIN_NAV = [
  { path: '/admin/dashboard', icon: BarChart3, label: 'Overview' },
  { path: '/admin/articles', icon: FileText, label: 'Articles' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/admins', icon: Shield, label: 'Admins' },
  { path: '/admin/feedback', icon: MessageSquare, label: 'User feedback' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications', badge: true },
];

const SYSTEM_NAV = [
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
  { path: '/admin/profile', icon: UserCircle, label: 'Profile' },
];

function linkActive(pathname, path) {
  if (path === '/admin/dashboard') {
    return (
      pathname === '/admin/dashboard' ||
      pathname === '/admin' ||
      pathname === '/admin/analytics'
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function AdminSidebar({
  open,
  onClose,
  user,
  isSuperAdmin,
  onLogout,
  unreadAlerts = 0,
}) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.mode === 'dark';

  const renderLink = ({ path, icon: Icon, label, badge }) => {
    const active = linkActive(location.pathname, path);
    const showBadge = badge && unreadAlerts > 0;
    return (
      <NavLink
        key={path}
        to={path}
        onClick={onClose}
        className={`admin-sidebar__link${active ? ' admin-sidebar__link--active' : ''}`}
      >
        <span className="admin-sidebar__link-icon">
          <Icon size={18} strokeWidth={active ? 2.5 : 2} />
          {showBadge ? (
            <span className="admin-sidebar__badge" aria-label={`${unreadAlerts} unread alerts`}>
              {unreadAlerts > 99 ? '99+' : unreadAlerts}
            </span>
          ) : null}
        </span>
        {label}
      </NavLink>
    );
  };

  const email = user?.email || '';
  const initial = email.charAt(0).toUpperCase() || 'A';

  return (
    <aside
      className={`admin-sidebar${open ? '' : ' admin-sidebar--closed'}`}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-icon admin-sidebar__brand-icon--logo">
          <TrakLogo size={34} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 className="admin-sidebar__brand-title">TRAK Admin</h2>
          <p className="admin-sidebar__brand-sub">News operations</p>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__section-label">Main</div>
        {MAIN_NAV.map(renderLink)}
        <div className="admin-sidebar__section-label" style={{ marginTop: 12 }}>
          System
        </div>
        {SYSTEM_NAV.map(renderLink)}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__user-avatar">{initial}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="admin-sidebar__user-email" title={email}>
              {email}
            </div>
            <div className="admin-sidebar__user-role">
              {isSuperAdmin ? 'Super Admin' : 'Administrator'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="admin-sidebar__footer-btn"
          onClick={toggleTheme}
          style={{ marginBottom: 8 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
        <NavLink
          to="/newsfeed"
          className="admin-sidebar__footer-btn"
          style={{ marginBottom: 8, textDecoration: 'none' }}
          onClick={() => {
            enableAdminAppPreview();
            onClose();
          }}
        >
          <Newspaper size={16} />
          View news app
        </NavLink>
        <button type="button" className="admin-sidebar__footer-btn admin-sidebar__footer-btn--danger" onClick={onLogout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
