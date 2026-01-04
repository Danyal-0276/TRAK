import React from 'react';
import { X } from 'lucide-react';

export function KeywordChip({ keyword, onRemove }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#2563eb',
            padding: '10px 16px',
            borderRadius: 25,
            marginBottom: 12,
            alignSelf: 'flex-start',
            boxShadow: '0 2px 3px rgba(37, 99, 235, 0.2)',
            marginRight: 8,
        }}>
            <span style={{
                color: '#ffffff',
                fontSize: 'clamp(13px, 3.5vw, 14px)',
                fontWeight: '600',
                marginRight: 8,
            }}>
                {keyword}
            </span>
            <button
                onClick={onRemove}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <X size={14} color="#ffffff" />
            </button>
        </div>
    );
}


