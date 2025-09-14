// src/route/Login/helper.js

/**
 * Validates email address format
 * @param {string} email - The email to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password must be less than 128 characters' };
    }

    return { isValid: true, error: '' };
};

/**
 * Sanitizes input text by trimming and converting to lowercase
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return '';
    }

    return input.trim().toLowerCase();
};

/**
 * Formats error messages for consistent display
 * @param {Error|string} error - The error to format
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error;
    }

    if (error && error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Validates if the form is complete and ready for submission
 * @param {string} email - Email input
 * @param {string} password - Password input
 * @returns {Object} - { isValid: boolean, errors: object }
 */
export const validateLoginForm = (email, password) => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const errors = {};

    if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
    }

    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Generates a random string for testing purposes
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

/**
 * Checks if the device is connected to the internet
 * @returns {boolean} - Connection status
 */
export const isConnectedToInternet = () => {
    // This would typically use NetInfo from @react-native-community/netinfo
    // For now, we'll return true as a placeholder
    return true;
};

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
};