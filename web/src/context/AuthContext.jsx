import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // User credentials (email: password)
    const userCredentials = {
        // Admins
        'daniyal@admin.com': 'admin123',
        'shahroz@admin.com': 'admin123',
        'abdullah@admin.com': 'admin123',
        // Regular user
        'ali@user.com': 'user123',
    };

    // Admin emails
    const adminEmails = [
        'daniyal@admin.com',
        'shahroz@admin.com',
        'abdullah@admin.com'
    ];

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAdmin(userData.isAdmin || false);
            } catch (error) {
                console.error('Error loading user:', error);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const emailLower = email.toLowerCase().trim();
        
        // Check if user exists and password matches
        if (!userCredentials[emailLower]) {
            throw new Error('Invalid email or password');
        }
        
        if (userCredentials[emailLower] !== password) {
            throw new Error('Invalid email or password');
        }
        
        // Check if email is admin
        const isAdminUser = adminEmails.includes(emailLower) || emailLower.endsWith('@admin.com');
        
        const userData = {
            email: emailLower,
            name: emailLower.split('@')[0],
            isAdmin: isAdminUser,
            loginTime: new Date().toISOString()
        };

        setUser(userData);
        setIsAdmin(isAdminUser);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        isAdmin,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

