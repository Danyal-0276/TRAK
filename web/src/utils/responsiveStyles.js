/**
 * Utility functions for responsive styling
 */

export const getResponsivePadding = (isMobile, isTablet) => {
    if (isMobile) return '0 16px 16px 16px';
    if (isTablet) return '0 20px 20px 20px';
    return '0 24px 24px 24px';
};

export const getResponsiveMaxWidth = (isMobile, isTablet, desktopWidth = '1400px') => {
    if (isMobile) return '100%';
    if (isTablet) return '100%';
    return desktopWidth;
};

export const getResponsiveGridColumns = (isMobile, isTablet, minWidth = 250) => {
    if (isMobile) return '1fr';
    if (isTablet) return `repeat(auto-fill, minmax(${minWidth - 40}px, 1fr))`;
    return `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;
};

export const getResponsiveGap = (isMobile, isTablet) => {
    if (isMobile) return '16px';
    if (isTablet) return '20px';
    return '24px';
};

export const getResponsiveFontSize = (isMobile, isTablet, desktopSize) => {
    if (isMobile) return `${desktopSize - 6}px`;
    if (isTablet) return `${desktopSize - 4}px`;
    return `${desktopSize}px`;
};

