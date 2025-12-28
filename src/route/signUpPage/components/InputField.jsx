import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TextComponent from '../../../components/ui/Text';

export const InputField = forwardRef(({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    error,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit
}, ref) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = secureTextEntry;

    return (
        <View style={styles.inputGroup}>
            <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>{label}</TextComponent>
            <View style={[
                styles.inputContainer,
                { 
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                },
                isFocused && {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 4,
                },
                error && { borderColor: colors.error }
            ]}>
                <TextInput
                    ref={ref}
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={blurOnSubmit}
                    autoCapitalize={autoCapitalize || "none"}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {isPassword && (
                    <TouchableOpacity 
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error && <TextComponent variant="caption" color={colors.error} style={styles.errorText}>{error}</TextComponent>}
        </View>
    );
});

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 18,
        minHeight: 56,
        paddingVertical: 0,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        paddingVertical: 16,
        textAlignVertical: 'center',
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
});