import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  style, 
  children, 
  ...props 
}) => {
  const baseStyle: React.CSSProperties = {
    cursor: 'pointer',
    border: 'none',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
    ...style
  };

  const variants = {
    primary: { background: '#3498db', color: 'white' },
    secondary: { background: '#95a5a6', color: 'white' },
    danger: { background: '#e74c3c', color: 'white' },
    ghost: { background: 'transparent', color: '#666' },
    icon: { background: 'transparent', color: '#666', padding: '4px' }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.85rem' },
    md: { padding: '10px 20px', fontSize: '1rem' },
    lg: { padding: '12px 24px', fontSize: '1.1rem' }
  };

  const combinedStyle = {
    ...baseStyle,
    ...variants[variant],
    ...(variant !== 'icon' ? sizes[size] : {})
  };

  return (
    <button style={combinedStyle} {...props}>
      {children}
    </button>
  );
};
