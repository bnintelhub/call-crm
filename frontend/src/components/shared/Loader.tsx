import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoaderProps {
  text?: string;
  size?: number;
  fullHeight?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  text = 'Loading...',
  size = 28,
  fullHeight = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        minHeight: fullHeight ? '300px' : 'auto',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      {text && <span style={{ fontSize: '0.8125rem' }}>{text}</span>}
    </div>
  );
};

export default Loader;
