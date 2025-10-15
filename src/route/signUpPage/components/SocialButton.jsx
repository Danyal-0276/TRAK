import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const SocialButton = ({ icon, onPress, loading }) => (
    <TouchableOpacity 
        style={styles.socialButton} 
        onPress={onPress}
        disabled={loading}
    >
        {loading ? (
            <ActivityIndicator size="small" color="#000" />
        ) : (
            <Text style={styles.socialButtonText}>{icon}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    socialButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
