
// ============================================
// FILE: components/KeywordSelection/KeywordInput.jsx
// ============================================
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

export function KeywordInput({ value, onChangeText, onSubmit, onAdd }) {
    const isDisabled = !value.trim();
    
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.keywordInput}
                placeholder="Enter a keyword..."
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity
                style={[
                    styles.addButton,
                    isDisabled && styles.disabledAddButton
                ]}
                onPress={onAdd}
                disabled={isDisabled}
                activeOpacity={0.7}
            >
                <Plus size={20} color={isDisabled ? "#94a3b8" : "#ffffff"} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#0f172a',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    keywordInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        paddingVertical: 12,
    },
    addButton: {
        backgroundColor: '#2563eb',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    disabledAddButton: {
        backgroundColor: '#e2e8f0',
        shadowOpacity: 0,
        elevation: 0,
    },
});
