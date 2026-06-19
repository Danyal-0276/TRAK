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
  Image,
} from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAdminLanguage } from '../../../context/AdminLanguageContext';
import TrakLogo from '../../../components/TrakLogo';
import { enableAdminAppPreview } from '../../../utils/adminAppPreview';
import './adminShell.css';

const MAIN_NAV = [
  { path: '/admin/dashboard', icon: BarChart3, labelKey: 'overview' },
  { path: '/admin/articles', icon: FileText, labelKey: 'articles' },
  { path: '/admin/users', icon: Users, labelKey: 'users' },
  { path: '/admin/admins', icon: Shield, labelKey: 'admins' },
  { path: '/admin/feedback', icon: MessageSquare, labelKey: 'feedback' },
  { path: '/admin/notifications', icon: Bell, labelKey: 'notifications', badge: true },
];

const SYSTEM_NAV = [
  { path: '/admin/settings', icon: Settings, labelKey: 'settings' },
  { path: '/admin/profile', icon: UserCircle, labelKey: 'profile' },
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
  const { adminT } = useAdminLanguage();
  const isDark = theme.mode === 'dark';

  const renderLink = ({ path, icon: Icon, labelKey, badge }) => {
    const active = linkActive(location.pathname, path);
    const showBadge = badge && unreadAlerts > 0;
    const label = adminT(labelKey);
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
        <div className="admin-sidebar__section-label">{adminT('main')}</div>
        {MAIN_NAV.map(renderLink)}
        <div className="admin-sidebar__section-label" style={{ marginTop: 12 }}>
          {adminT('system')}
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
              {isSuperAdmin ? adminT('superAdmin') : adminT('administrator')}
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
          {isDark ? adminT('lightMode') : adminT('darkMode')}
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
          {adminT('viewNewsApp')}
        </NavLink>
        <NavLink
          to="/pics"
          className="admin-sidebar__footer-btn"
          style={{ marginBottom: 8, textDecoration: 'none' }}
          onClick={() => {
            enableAdminAppPreview();
            onClose();
          }}
        >
          <Image size={16} />
          {adminT('viewPicsApp')}
        </NavLink>
        <button type="button" className="admin-sidebar__footer-btn admin-sidebar__footer-btn--danger" onClick={onLogout}>
          <LogOut size={16} />
          {adminT('signOut')}
        </button>
      </div>
    </aside>
  );
}
