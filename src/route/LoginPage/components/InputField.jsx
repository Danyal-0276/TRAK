import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry, 
    keyboardType 
}) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
        />
    </View>
);

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#f8f9fa',
    },
});