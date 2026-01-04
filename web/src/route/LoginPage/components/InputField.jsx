import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import TextComponent from '../../../components/ui/Text';

export const InputField = forwardRef(({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    secureTextEntry,
    keyboardType,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit
}, ref) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = secureTextEntry || type === 'password';

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div style={{ marginBottom: 24 }}>
            <TextComponent variant="body" color={colors.textPrimary} style={{ fontSize: 15, marginBottom: 10, fontWeight: '600', letterSpacing: -0.3 }}>
                {label}
            </TextComponent>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                border: `1.5px solid ${isFocused ? colors.primary : colors.border}`,
                borderRadius: 14,
                paddingLeft: 18,
                paddingRight: 18,
                minHeight: 56,
                backgroundColor: isFocused ? colors.surface : colors.backgroundSecondary,
                boxShadow: isFocused ? `0 4px 12px ${colors.shadowColored}` : 'none',
                transition: 'all 0.2s ease',
            }}>
                <input
                    ref={ref}
                    type={inputType}
                    style={{
                        flex: 1,
                        fontSize: 16,
                        padding: '16px 0',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: colors.textPrimary,
                    }}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onSubmitEditing) {
                            onSubmitEditing();
                        }
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            padding: 4,
                            marginLeft: 8,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
});

