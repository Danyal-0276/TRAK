import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from '../../../components/ui/Text';

function getInitials(name) {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].charAt(0).toUpperCase();
}

function hasAvatarUri(uri) {
  const value = String(uri ?? '').trim();
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

export default function ProfileAvatar({ uri, name, accent, surfaceColor }) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [uri]);

  const showImage = hasAvatarUri(uri) && !loadFailed;
  const initials = getInitials(name);

  return (
    <View style={[styles.ring, { borderColor: surfaceColor, backgroundColor: showImage ? surfaceColor : accent }]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.image}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: accent }]}>
          <Text style={styles.initials} color="#FFFFFF">
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  placeholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
