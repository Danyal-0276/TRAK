import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

const Header = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, {
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      paddingTop: Math.max(insets.top, 12),
    }]}>
      <View style={styles.headerContent}>
        {navigation && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <View style={[styles.backButtonInner, { backgroundColor: colors.backgroundSecondary }]}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Shield size={24} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text variant="title" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Admin Panel
          </Text>
        </View>
        {navigation && <View style={styles.headerPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
});

export default Header;