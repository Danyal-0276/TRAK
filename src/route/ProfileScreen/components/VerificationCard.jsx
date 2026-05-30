import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import { filledActionColors } from '../../../theme/buttonContrast';

const VerificationCard = ({
  channel,
  onChannelChange,
  code,
  onCodeChange,
  onSend,
  onConfirm,
  sending,
  verifying,
  message,
  devHint,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const accent = colors.primary;
  const action = filledActionColors(colors, isDark);
  const accentSoft = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
          <ShieldCheck size={20} color={accent} strokeWidth={2.25} />
        </View>
        <View style={styles.headText}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Verify your account</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Confirm email or phone for a trusted badge on your profile.
          </Text>
        </View>
      </View>

      <View style={styles.channelRow}>
        {['email', 'phone'].map((ch) => (
          <TouchableOpacity
            key={ch}
            onPress={() => onChannelChange(ch)}
            style={[
              styles.channelBtn,
              {
                borderColor: channel === ch ? accent : colors.borderLight,
                backgroundColor: channel === ch ? accentSoft : colors.backgroundSecondary,
              },
            ]}
          >
            <Text style={[styles.channelLabel, { color: channel === ch ? (isDark ? colors.textPrimary : accent) : colors.textSecondary }]}>
              {ch === 'email' ? 'Email' : 'Phone'}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={onSend}
          disabled={sending}
          style={[styles.sendBtn, { backgroundColor: action.background, opacity: sending ? 0.7 : 1 }]}
        >
          <Text style={[styles.sendBtnText, { color: action.foreground }]}>
            {sending ? 'Sending…' : 'Send code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeRow}>
        <TextInput
          value={code}
          onChangeText={onCodeChange}
          placeholder="Enter verification code"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              borderColor: colors.borderLight,
              backgroundColor: colors.backgroundSecondary,
              color: colors.textPrimary,
            },
          ]}
        />
        <TouchableOpacity
          onPress={onConfirm}
          disabled={verifying}
          style={[styles.verifyBtn, { borderColor: colors.borderLight, opacity: verifying ? 0.7 : 1 }]}
        >
          <Text style={[styles.verifyBtnText, { color: colors.textPrimary }]}>
            {verifying ? '…' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={[styles.hint, { color: colors.textSecondary }]}>{message}</Text> : null}
      {devHint ? <Text style={[styles.devHint, { color: accent }]}>Test code: {devHint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  head: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  channelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  channelLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  verifyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    marginTop: 10,
  },
  devHint: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default VerificationCard;
