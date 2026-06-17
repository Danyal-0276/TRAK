import React from 'react';
import { cn } from '../../lib/cn';
import Badge from './Badge';
import './Chip.css';

export default function Chip({ active = false, label, icon, count, onClick, className }) {
  const showCount = typeof count === 'number' && count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('trak-chip', active && 'trak-chip--active', className)}
    >
      {icon}
      <span className="trak-chip-label">{label}</span>
      {showCount ? (
        <Badge variant={active ? 'default' : 'secondary'} className="trak-badge-count">
          {count}
        </Badge>
      ) : null}
    </button>
  );
}
