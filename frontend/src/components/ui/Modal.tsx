import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px' }) => {
  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  };

  const contentStyle: React.CSSProperties = {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: width,
    maxWidth: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div style={overlayStyle} onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
    }}>
      <div style={contentStyle}>
        <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
            <button 
                onClick={onClose} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
            >
                &times;
            </button>
        </div>
        {children}
      </div>
    </div>
  );
};
