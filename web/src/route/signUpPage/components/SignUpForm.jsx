import React, { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SocialButtons } from './SocialButtons';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import Button from '../../../components/ui/Button';

export const SignUpForm = ({
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    onSignUpPress,
    onSocialPress,
    loading,
    loadingProvider,
    errors
}) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 18 }}>
                <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                    Full Name
                </Text>
                <input
                    type="text"
                    style={{
                        width: '100%',
                        border: `1.5px solid ${errors.fullName ? colors.error : colors.border}`,
                        borderRadius: 'clamp(12px, 3vw, 14px)',
                        padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 18px)',
                        fontSize: 'clamp(14px, 3.5vw, 16px)',
                        color: colors.textPrimary,
                        backgroundColor: colors.backgroundSecondary,
                        outline: 'none',
                    }}
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            emailRef.current?.focus();
                        }
                    }}
                />
                {errors.fullName && (
                    <Text variant="caption" color={colors.error} style={{ fontSize: 12, marginTop: 6, fontWeight: '500' }}>
                        {errors.fullName}
                    </Text>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                    Email address
                </Text>
                <input
                    ref={emailRef}
                    type="email"
                    style={{
                        width: '100%',
                        border: `1.5px solid ${errors.email ? colors.error : colors.border}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                        fontSize: 16,
                        color: colors.textPrimary,
                        backgroundColor: colors.backgroundSecondary,
                        outline: 'none',
                    }}
                    placeholder="hello@trak.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            passwordRef.current?.focus();
                        }
                    }}
                />
                {errors.email && (
                    <Text variant="caption" color={colors.error} style={{ fontSize: 12, marginTop: 6, fontWeight: '500' }}>
                        {errors.email}
                    </Text>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                    Password
                </Text>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1.5px solid ${errors.password ? colors.error : colors.border}`,
                    borderRadius: 'clamp(12px, 3vw, 14px)',
                    backgroundColor: colors.backgroundSecondary,
                    paddingLeft: 'clamp(14px, 3.5vw, 18px)',
                    paddingRight: 'clamp(14px, 3.5vw, 18px)',
                    minHeight: 'clamp(48px, 12vw, 56px)',
                }}>
                    <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: colors.textPrimary,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            padding: '16px 0',
                        }}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                confirmPasswordRef.current?.focus();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            padding: 4,
                            marginLeft: 8,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <Text variant="caption" color={colors.error} style={{ fontSize: 12, marginTop: 6, fontWeight: '500' }}>
                        {errors.password}
                    </Text>
                )}
            </div>

            <div style={{ marginBottom: 18 }}>
                <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                    Confirm Password
                </Text>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1.5px solid ${errors.confirmPassword ? colors.error : colors.border}`,
                    borderRadius: 14,
                    backgroundColor: colors.backgroundSecondary,
                    paddingLeft: 18,
                    paddingRight: 18,
                    minHeight: 56,
                }}>
                    <input
                        ref={confirmPasswordRef}
                        type={showConfirmPassword ? 'text' : 'password'}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: colors.textPrimary,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            padding: '16px 0',
                        }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSignUpPress?.();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                            padding: 4,
                            marginLeft: 8,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <Text variant="caption" color={colors.error} style={{ fontSize: 12, marginTop: 6, fontWeight: '500' }}>
                        {errors.confirmPassword}
                    </Text>
                )}
            </div>

            <Button
                title={loading ? 'Creating account...' : 'Create account'}
                variant="primary"
                primaryColors={[colors.primary, colors.primary]}
                onPress={onSignUpPress}
                disabled={loading}
                style={{
                    width: '100%',
                    marginTop: 4,
                    marginBottom: 'clamp(16px, 4vw, 20px)',
                    opacity: loading ? 0.6 : 1,
                    padding: 'clamp(14px, 3.5vw, 18px)',
                }}
            />

            <SocialButtons
                onSocialPress={onSocialPress}
                loadingProvider={loadingProvider}
            />
        </div>
    );
};

