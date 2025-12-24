import React from 'react';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, action, children }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};
