import React from 'react';

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
    {children}
  </thead>
);

export const Tbody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
);

export const Tr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr style={{ borderBottom: '1px solid #eee' }}>{children}</tr>
);

export const Th: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#444', ...style }}>{children}</th>
);

export const Td: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <td style={{ padding: '1rem', color: '#555', ...style }}>{children}</td>
);
