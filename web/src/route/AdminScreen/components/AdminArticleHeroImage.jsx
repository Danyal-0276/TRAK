import React, { useEffect, useMemo, useState } from 'react';
import { clampCardAspectRatio } from '../../../utils/adminArticleCardMedia';
import { getAdminArticleImageProxyUrl } from '../../../api/adminApi';
import { apiFetch } from '../../../api/client';

/**
 * External article hero image — referrerPolicy + optional admin proxy fallback (JWT via fetch).
 */
export default function AdminArticleHeroImage({
  src,
  alt = '',
  style = {},
  maxHeight = 320,
  borderRadius = 10,
  backgroundColor = '#f1f5f9',
  dynamicAspect = true,
}) {
  const [hidden, setHidden] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyBlobUrl, setProxyBlobUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState(dynamicAspect ? 16 / 9 : null);

  useEffect(() => {
    if (!useProxy || !src) {
      setProxyBlobUrl('');
      return undefined;
    }
    let cancelled = false;
    let objectUrl = '';
    (async () => {
      try {
        const res = await apiFetch(getAdminArticleImageProxyUrl(src));
        if (!res.ok) throw new Error('proxy failed');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setProxyBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setHidden(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [useProxy, src]);

  const displaySrc = useMemo(() => {
    if (!src) return '';
    if (useProxy) return proxyBlobUrl;
    return src;
  }, [src, useProxy, proxyBlobUrl]);

  if (!src || hidden) return null;
  if (useProxy && !proxyBlobUrl) {
    return (
      <div
        aria-hidden
        style={{
          width: '100%',
          aspectRatio: aspectRatio ? String(aspectRatio) : '16 / 9',
          maxHeight,
          borderRadius,
          marginBottom: 16,
          backgroundColor,
          ...style,
        }}
      />
    );
  }

  const handleError = () => {
    if (!useProxy) {
      setUseProxy(true);
      return;
    }
    setHidden(true);
  };

  const handleLoad = (e) => {
    if (!dynamicAspect) return;
    const img = e.currentTarget;
    if (img?.naturalWidth && img?.naturalHeight) {
      setAspectRatio(clampCardAspectRatio(img.naturalWidth, img.naturalHeight));
    }
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      style={{
        width: '100%',
        ...(aspectRatio ? { aspectRatio: String(aspectRatio) } : { maxHeight }),
        objectFit: 'cover',
        borderRadius,
        marginBottom: 16,
        backgroundColor,
        display: 'block',
        ...style,
      }}
    />
  );
}
