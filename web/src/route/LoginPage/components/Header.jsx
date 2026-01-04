import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

export const Header = ({ onBackPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();
    
    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigate(-1);
        }
    };
    
    return (
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
            <button
                onClick={handleBack}
                style={{
                    width: 'clamp(36px, 9vw, 40px)',
                    height: 'clamp(36px, 9vw, 40px)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.backgroundSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.backgroundSecondary;
                }}
            >
                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
            </button>
        </div>
    );
};

