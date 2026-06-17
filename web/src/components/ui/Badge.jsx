import React from 'react';
import { cn } from '../../lib/cn';
import './Badge.css';

const VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'accent'];

export default function Badge({
  children,
  variant = 'secondary',
  className,
  as: Component = 'span',
  ...props
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'secondary';

  return (
    <Component
      className={cn(
        'trak-badge',
        `trak-badge--${safeVariant}`,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
