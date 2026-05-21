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
import { Shield } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { requestPasswordReset, verifyPasswordResetOtp } from '../../api/authPasswordApi';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import Text from '../../components/ui/Text';

const ForgotPasswordCodeScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { error: showError } = useFeedback();
  const email = (route.params?.email || '').trim().toLowerCase();
  const emailSent = route.params?.emailSent !== false;
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigation.replace('ForgotPassword');
    }
  }, [email, navigation]);

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
      const res = await verifyPasswordResetOtp({ email, code: trimmed });
      navigation.navigate('ResetPassword', {
        email,
        resetToken: res.reset_token,
        fromOtp: true,
      });
    } catch (e) {
      showError(e.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (timer > 0 || !email) return;
    setResendLoading(true);
    try {
      await requestPasswordReset(email);
      setTimer(60);
    } catch (e) {
      showError(e.message || 'Could not resend code.');
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="body" color={colors.textSecondary}>
            Back
          </Text>
        </TouchableOpacity>

        <Shield size={40} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text variant="h2" style={{ textAlign: 'center', marginBottom: 8 }}>
          Enter verification code
        </Text>
        <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginBottom: 24 }}>
          {emailSent
            ? `We sent a 6-digit code to ${email || 'your email'}. Check your inbox and spam.`
            : `If your account exists, a code was sent to ${email || 'your email'}.`}
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
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={onVerify}
          disabled={loading || code.replace(/\D/g, '').length !== 6}
        >
          <Text variant="button" color={colors.textInverse}>
            {loading ? 'Verifying…' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onResend} disabled={timer > 0 || resendLoading} style={styles.linkBtn}>
          <Text variant="body" color={colors.primary}>
            {timer > 0
              ? `Resend in ${timer}s`
              : resendLoading
                ? 'Sending…'
                : 'Resend code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
          <Text variant="caption" color={colors.textSecondary}>
            Back to sign in
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 24 },
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

export default ForgotPasswordCodeScreen;
