
// ============================================
// FILE: components/KeywordSelection/KeywordInput.jsx
// ============================================
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function KeywordInput({ value, onChangeText, onSubmit, onAdd }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = !value.trim();
    const borderColorAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(borderColorAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const borderColor = borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
    });
    
    return (
        <Animated.View 
            style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: borderColor,
                    shadowColor: colors.shadowDark || '#000',
                }
            ]}
        >
            <TextInput
                style={[styles.keywordInput, { color: colors.textPrimary }]}
                placeholder="Enter a keyword..."
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity
                style={[
                    styles.addButton,
                    {
                        backgroundColor: isDisabled ? colors.textTertiary : colors.primary,
                        shadowColor: colors.shadowDark || '#000',
                        opacity: isDisabled ? 0.7 : 1,
                    }
                ]}
                onPress={onAdd}
                disabled={isDisabled}
                activeOpacity={0.7}
            >
                <Plus size={20} color={colors.textInverse || colors.surface} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 4,
        marginBottom: 20,
        borderWidth: 1.5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    keywordInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 14,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
});
