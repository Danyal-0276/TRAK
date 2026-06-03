import React, { useEffect, useMemo, useState } from 'react';
import { clampCardAspectRatio } from '../utils/adminArticleCardMedia';
import { apiFetch } from '../api/client';

/**
 * Article hero image for feed cards — direct load with optional authenticated proxy fallback.
 */
export default function ArticleCardImage({
  src,
  alt = '',
  style = {},
  maxHeight = 320,
  borderRadius = 10,
  backgroundColor = '#f1f5f9',
  dynamicAspect = true,
  getProxyUrl,
}) {
  const [failed, setFailed] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyBlobUrl, setProxyBlobUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState(dynamicAspect ? 16 / 9 : null);

  useEffect(() => {
    setFailed(false);
    setUseProxy(false);
    setProxyBlobUrl('');
    setAspectRatio(dynamicAspect ? 16 / 9 : null);
  }, [src, dynamicAspect]);

  useEffect(() => {
    if (!useProxy || !src || !getProxyUrl) {
      setProxyBlobUrl('');
      return undefined;
    }
    let cancelled = false;
    let objectUrl = '';
    (async () => {
      try {
        const res = await apiFetch(getProxyUrl(src));
        if (!res.ok) throw new Error('proxy failed');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setProxyBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [useProxy, src, getProxyUrl]);

  const displaySrc = useMemo(() => {
    if (!src) return '';
    if (useProxy) return proxyBlobUrl;
    return src;
  }, [src, useProxy, proxyBlobUrl]);

  if (!src) return null;

  if (failed) {
    return (
      <div
        aria-hidden
        style={{
          width: '100%',
          aspectRatio: aspectRatio ? String(aspectRatio) : '16 / 9',
          maxHeight,
          borderRadius,
          backgroundColor,
          ...style,
        }}
      />
    );
  }

  if (useProxy && !proxyBlobUrl) {
    return (
      <div
        aria-hidden
        style={{
          width: '100%',
          aspectRatio: aspectRatio ? String(aspectRatio) : '16 / 9',
          maxHeight,
          borderRadius,
          backgroundColor,
          ...style,
        }}
      />
    );
  }

  const handleError = () => {
    if (!useProxy && getProxyUrl) {
      setUseProxy(true);
      return;
    }
    setFailed(true);
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
        backgroundColor,
        display: 'block',
        ...style,
      }}
    />
  );
}
