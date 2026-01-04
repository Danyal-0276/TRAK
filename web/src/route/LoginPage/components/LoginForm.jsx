import React, { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SocialButtons } from './SocialButtons';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import Button from '../../../components/ui/Button';

export const LoginForm = ({
    email,
    setEmail,
    password,
    setPassword,
    onLoginPress,
    onForgotPasswordPress,
    onSocialPress,
    loadingProvider
}) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const passwordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ minHeight: 400 }}>
            <div style={{ marginBottom: 8 }}>
                <div style={{ marginBottom: 18 }}>
                    <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                        Email
                    </Text>
                    <input
                        type="email"
                        style={{
                            width: '100%',
                            border: `1.5px solid ${colors.border}`,
                            borderRadius: 'clamp(12px, 3vw, 14px)',
                            padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 18px)',
                            fontSize: 'clamp(14px, 3.5vw, 16px)',
                            color: colors.textPrimary,
                            backgroundColor: colors.backgroundSecondary,
                            outline: 'none',
                            transition: 'all 0.2s ease',
                        }}
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                passwordRef.current?.focus();
                            }
                        }}
                    />
                </div>

                <div style={{ marginBottom: 18 }}>
                    <Text variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                        Password
                    </Text>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1.5px solid ${colors.border}`,
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
                                fontSize: 'clamp(14px, 3.5vw, 16px)',
                                color: colors.textPrimary,
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                padding: 'clamp(12px, 3vw, 16px) 0',
                            }}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onLoginPress?.();
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
                </div>

                <button
                    onClick={onForgotPasswordPress}
                    style={{
                        alignSelf: 'flex-end',
                        marginTop: 4,
                        marginBottom: 8,
                        padding: '8px 4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    <Text variant="body" color="#000000" style={{ fontSize: 15, fontWeight: '600', letterSpacing: -0.2 }}>
                        Forgot password?
                    </Text>
                </button>
            </div>

            <div style={{ marginTop: 20 }}>
                <Button
                    title="Sign in"
                    variant="primary"
                    primaryColors={[colors.primary, colors.primary]}
                    onPress={onLoginPress}
                    disabled={!email || !password}
                    style={{
                        width: '100%',
                        marginBottom: 'clamp(20px, 5vw, 24px)',
                        opacity: (!email || !password) ? 0.6 : 1,
                        padding: 'clamp(14px, 3.5vw, 18px)',
                        fontSize: 'clamp(15px, 3.5vw, 17px)',
                    }}
                />

                <SocialButtons
                    onSocialPress={onSocialPress}
                    loadingProvider={loadingProvider}
                />
            </div>
        </div>
    );
};

