import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--trak-bg)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 3px rgba(15, 23, 42, 0.05)',
        }}>
            <Search size={20} color="#64748b" style={{ marginRight: 10 }} />
            <input
                type="text"
                placeholder="Search categories..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    flex: 1,
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    color: 'var(--trak-ink)',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                }}
            />
        </div>
    );
}


