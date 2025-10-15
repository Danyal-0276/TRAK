import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
        >
            <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: 10,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});