import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Settings, Menu, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { getProfile } from '../utils/Service/api';

const AUTH_HIDE = [
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

const Header = () => {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profileInitial, setProfileInitial] = useState('U');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        const base = (profile?.full_name || profile?.email || 'U').trim();
        setProfileInitial(base.charAt(0).toUpperCase() || 'U');
        setAvatarPreview(profile?.avatar_image || '');
      } catch {
        setProfileInitial('U');
        setAvatarPreview('');
      }
    })();
  }, [location.pathname]);

  if (AUTH_HIDE.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const mobileNav = [
    { path: '/newsfeed', label: 'Home' },
    { path: '/search', label: 'Explore' },
    { path: '/categories', label: 'Categories' },
    { path: '/trending', label: 'Trending' },
    { path: '/bookmarks', label: 'Bookmarks' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <header className={`trak-topbar${isDesktop ? ' has-rail' : ''}`}>
      {isMobile && (
        <button
          type="button"
          className="trak-icon-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Menu"
        >
          {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {!isMobile ? (
        <form onSubmit={handleSearch} className="trak-search-wrap">
          <Search size={16} color="var(--trak-ink4)" />
          <input
            type="text"
            placeholder="Search articles, topics, sources…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      ) : (
        <button
          type="button"
          className="trak-icon-btn"
          onClick={() => navigate('/search')}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      )}

      <div className="trak-tb-right">
        <button
          type="button"
          className="trak-icon-btn"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="trak-notif-dot" />
        </button>
        <button
          type="button"
          className="trak-icon-btn"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          type="button"
          className="trak-avatar"
          onClick={() => navigate('/profile')}
          aria-label="Profile"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profileInitial
          )}
        </button>
      </div>

      {isMobile && showMobileMenu && (
        <div
          style={{
            position: 'absolute',
            top: '58px',
            left: 0,
            right: 0,
            background: 'var(--trak-surface)',
            borderBottom: '1px solid var(--trak-border)',
            boxShadow: 'var(--trak-shadow-md)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 200,
          }}
        >
          {mobileNav.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`trak-nav-btn${location.pathname === link.path ? ' active' : ''}`}
              onClick={() => {
                navigate(link.path);
                setShowMobileMenu(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
