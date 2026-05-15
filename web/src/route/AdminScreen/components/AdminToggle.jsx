import React from 'react';

export default function AdminToggle({ value, onChange, activeColor = '#4CAF50' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 50,
        height: 26,
        borderRadius: 13,
        border: 'none',
        padding: 2,
        cursor: 'pointer',
        backgroundColor: value ? activeColor : '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        transition: 'background-color 0.2s ease',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
