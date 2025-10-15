export const mockAuthAPI = {
  signUp: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate validation
    if (!userData.fullName || !userData.email || !userData.password) {
      throw new Error('All fields are required');
    }
    
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email address');
    }
    
    // Simulate successful registration
    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: Math.random().toString(36).substr(2, 9),
        fullName: userData.fullName,
        email: userData.email,
        createdAt: new Date().toISOString()
      },
      token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9)
    };
  },
  
  socialSignUp: async (provider) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Signed up with ${provider}`,
      user: {
        id: Math.random().toString(36).substr(2, 9),
        fullName: `${provider} User`,
        email: `user@${provider}.com`,
        provider: provider,
        createdAt: new Date().toISOString()
      },
      token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9)
    };
  }
};