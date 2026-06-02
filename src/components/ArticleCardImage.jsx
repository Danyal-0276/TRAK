import React, { useCallback, useEffect, useState, memo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { getAccessToken } from '../api/client';
import { getUserArticleImageProxyUrl } from '../utils/articleMedia';

/**
 * Article hero image — direct CDN load with authenticated proxy fallback (hotlink blocks).
 */
function ArticleCardImage({
  src,
  alt = '',
  height = 200,
  borderRadius = 12,
  backgroundColor = '#e5e7eb',
  style,
  imageStyle,
}) {
  const [failed, setFailed] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [authHeaders, setAuthHeaders] = useState(undefined);

  useEffect(() => {
    setFailed(false);
    setUseProxy(false);
    setAuthHeaders(undefined);
  }, [src]);

  useEffect(() => {
    if (!useProxy) return undefined;
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (!cancelled) {
        setAuthHeaders(token ? { Authorization: `Bearer ${token}` } : undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useProxy]);

  const handleError = useCallback(async () => {
    if (!useProxy) {
      const token = await getAccessToken();
      setAuthHeaders(token ? { Authorization: `Bearer ${token}` } : undefined);
      setUseProxy(true);
      return;
    }
    setFailed(true);
  }, [useProxy]);

  if (!src) return null;

  if (failed) {
    return (
      <View
        style={[
          styles.placeholder,
          { height, borderRadius, backgroundColor },
          style,
        ]}
      />
    );
  }

  const uri = useProxy ? getUserArticleImageProxyUrl(src) : src;

  return (
    <Image
      source={{ uri, headers: authHeaders }}
      style={[{ width: '100%', height, borderRadius, backgroundColor }, imageStyle, style]}
      resizeMode="cover"
      onError={handleError}
      accessibilityLabel={alt || 'Article image'}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
  },
});

export default memo(ArticleCardImage);
