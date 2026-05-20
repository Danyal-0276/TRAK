import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Clock, Bookmark, Tag } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../context/AuthContext';
import { getUserKeywordsFromServer } from '../utils/Service/api';
import { getUserKeywords } from '../utils/userKeywordsStorage';

const AppSidebar = () => {
  const { isDesktop } = useResponsive();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [topicRows, setTopicRows] = useState([]);

  const loadTopics = useCallback(async () => {
    if (!user) {
      setTopicRows([]);
      return;
    }
    try {
      const res = await getUserKeywordsFromServer();
      const kws = Array.isArray(res?.keywords) ? res.keywords : [];
      if (kws.length) {
        setTopicRows(kws.map((t, i) => ({ id: `${i}-${t}`, topic: String(t) })));
        return;
      }
    } catch {
      /* local fallback */
    }
    const local = getUserKeywords();
    setTopicRows(local.map((t, i) => ({ id: `${i}-${t}`, topic: String(t) })));
  }, [user]);

  useEffect(() => {
    loadTopics();
    const onKw = () => loadTopics();
    window.addEventListener('trak-keywords-changed', onKw);
    window.addEventListener('focus', onKw);
    return () => {
      window.removeEventListener('trak-keywords-changed', onKw);
      window.removeEventListener('focus', onKw);
    };
  }, [loadTopics]);

  const hideNavPaths = [
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

  if (hideNavPaths.includes(location.pathname) || location.pathname.startsWith('/admin') || !isDesktop) {
    return null;
  }

  const quickLinks = [
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Clock, label: 'Recent', path: '/recent' },
    { icon: Tag, label: 'Categories', path: '/categories' },
  ];

  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Help', path: '/help' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ];

  return (
    <aside className="trak-rail">
      <div className="trak-widget">
        <h3 className="trak-w-title">Quick links</h3>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              type="button"
              className={`trak-rail-link${isActive ? ' active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              <Icon size={16} />
              {link.label}
            </button>
          );
        })}
      </div>

      <div className="trak-widget">
        <h3 className="trak-w-title">Your topics</h3>
        {!user ? (
          <p style={{ fontSize: '12px', color: 'var(--trak-ink3)', margin: 0 }}>
            Sign in to see the topics you follow.
          </p>
        ) : topicRows.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--trak-ink3)', margin: 0 }}>
            No keywords yet.{' '}
            <button
              type="button"
              onClick={() => navigate('/categories')}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--trak-accent)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Choose categories
            </button>
          </p>
        ) : (
          <div>
            {topicRows.map((row) => (
              <button
                key={row.id}
                type="button"
                className="trak-topic-chip"
                onClick={() => navigate(`/search?q=${encodeURIComponent(row.topic)}`)}
              >
                #{row.topic}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--trak-border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {footerLinks.map(({ label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--trak-ink4)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--trak-ink4)' }}>© 2025 TRAK</div>
      </div>
    </aside>
  );
};

export default AppSidebar;
