import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children }) => {
  const styles = {
    success: { background: '#dcfce7', color: '#166534' },
    error: { background: '#fee2e2', color: '#991b1b' },
    warning: { background: '#fef3c7', color: '#92400e' },
    info: { background: '#e0f2fe', color: '#075985' }
  };

  const baseStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'inline-block',
    ...styles[variant]
  };

  return <span style={baseStyle}>{children}</span>;
};
