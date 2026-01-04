import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

export function KeywordInput({ value, onChange, onSubmit, onAdd }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDisabled = !value.trim();
    
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: '4px 16px',
            marginBottom: 20,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 2px 3px rgba(15, 23, 42, 0.05)',
        }}>
            <input
                type="text"
                placeholder="Enter a keyword..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSubmit();
                    }
                }}
                style={{
                    flex: 1,
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    color: colors.textPrimary,
                    padding: '12px 0',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                }}
            />
            <button
                onClick={onAdd}
                disabled={isDisabled}
                style={{
                    backgroundColor: isDisabled ? colors.border : '#2563eb',
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10,
                    border: 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    boxShadow: isDisabled ? 'none' : '0 2px 3px rgba(37, 99, 235, 0.3)',
                }}
            >
                <Plus size={20} color={isDisabled ? colors.textTertiary : "#ffffff"} />
            </button>
        </div>
    );
}


