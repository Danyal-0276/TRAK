import React from 'react';

export function Tag({ label, isSelected, onPress, isSubTag = false }) {
    return (
        <button
            onClick={onPress}
            style={{
                backgroundColor: isSelected 
                    ? (isSubTag ? '#64748b' : '#2563eb')
                    : '#ffffff',
                padding: isSubTag ? '8px 12px' : '10px 16px',
                borderRadius: 20,
                border: `1px solid ${isSelected 
                    ? (isSubTag ? '#64748b' : '#2563eb')
                    : (isSubTag ? '#64748b' : '#cbd5e1')}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(15, 23, 42, 0.05)',
                transition: 'all 0.2s ease',
                fontSize: isSubTag ? 'clamp(12px, 3vw, 13px)' : 'clamp(13px, 3.5vw, 14px)',
                fontWeight: isSelected ? '600' : '500',
                color: isSelected ? '#ffffff' : (isSubTag ? '#475569' : '#334155'),
                margin: '5px',
            }}
        >
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    border: '2px solid #ffffff',
                    zIndex: 1,
                }} />
            )}
            {label}
        </button>
    );
}


