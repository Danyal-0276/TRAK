import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { useAuth } from '../../context/AuthContext';
import Text from '../../components/ui/Text';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { resendEmailVerification } from '../../api/authEmailApi';

const VerifyEmailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);
  const { user, verifyEmail } = useAuth();
  const { success, error: showError } = useFeedback();
  const email = (route.params?.email || user?.email || '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onVerify = async () => {
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 6) {
      showError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(trimmed);
      success('Email verified');
      navigation.navigate('TagSelection', { fromSignup: true });
    } catch (e) {
      showError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    try {
      const data = await resendEmailVerification();
      if (data.dev_code) setCode(String(data.dev_code));
      setTimer(60);
      success('New code sent');
    } catch (e) {
      showError(e.message || 'Could not resend');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <Mail size={40} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text variant="h2" style={{ textAlign: 'center', marginBottom: 8 }}>
          Verify your email
        </Text>
        <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginBottom: 24 }}>
          Code sent to {email}. Expires in 5 minutes.
        </Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.codeInput,
            {
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
            },
          ]}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: action.background }]}
          onPress={onVerify}
          disabled={loading}
        >
          <Text variant="button" color={action.foreground}>
            {loading ? 'Verifying…' : 'Verify email'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onResend} disabled={timer > 0 || resendLoading} style={styles.linkBtn}>
          <Text variant="body" color={colors.primary}>
            {timer > 0 ? `Resend in ${timer}s` : resendLoading ? 'Sending…' : 'Resend code'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('TagSelection', { fromSignup: true })}
          style={styles.linkBtn}
        >
          <Text variant="caption" color={colors.textSecondary}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  codeInput: {
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
});

export default VerifyEmailScreen;
