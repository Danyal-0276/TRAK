// src/constants/colors.js
export const COLORS = {
    // Primary colors
    primary: '#05C9B7',           // Primary accent color for buttons and links
    primaryLight: '#BEE1E6',      // Light background accents
    primaryMuted: '#B6D0D3',      // Loading state and disabled states

    // Background colors
    background: '#BEE1E6',        // Main background
    cardBackground: '#E0F3FC',    // Card and container backgrounds
    white: '#FFFFFF',             // Pure white for inputs and highlights

    // Text colors
    textPrimary: '#253237',       // Dark text and headings
    textSecondary: '#617479',     // Secondary text and icons

    // Border and divider colors
    border: '#D4F0F3',           // Subtle borders and dividers
    borderError: '#FF6B6B',      // Error state borders

    // Status colors
    error: '#FF6B6B',            // Error messages and validation
    success: '#05C9B7',          // Success states (same as primary)

    // Shadow colors
    shadowLight: '#253237',       // For light shadows with low opacity
    shadowPrimary: '#05C9B7',     // For primary button shadows
};

// Color variants with opacity for common use cases
export const COLOR_VARIANTS = {
    // Shadow variants
    shadow: {
        light: 'rgba(37, 50, 55, 0.1)',      // Light shadow
        medium: 'rgba(37, 50, 55, 0.15)',    // Medium shadow
        strong: 'rgba(37, 50, 55, 0.3)',     // Strong shadow
        primary: 'rgba(5, 201, 183, 0.3)',   // Primary button shadow
    },

    // Background variants
    overlay: 'rgba(37, 50, 55, 0.5)',      // Modal overlays
    disabled: 'rgba(182, 208, 211, 0.5)',  // Disabled states

    // Text variants
    placeholder: 'rgba(97, 116, 121, 0.7)', // Placeholder text
};

// Theme object for easy access
export const THEME = {
    colors: COLORS,
    variants: COLOR_VARIANTS,
};