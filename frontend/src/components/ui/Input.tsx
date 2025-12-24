import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  const containerStyle: React.CSSProperties = {
    marginBottom: '1rem',
    width: '100%'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: error ? '1px solid #e74c3c' : '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box', // Ensure padding doesn't affect width
    ...style
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={inputStyle} {...props} />
      {error && <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, style, ...props }) => {
    const containerStyle: React.CSSProperties = {
      marginBottom: '1rem',
      width: '100%'
    };
  
    const labelStyle: React.CSSProperties = {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 500,
      fontSize: '0.9rem',
      color: '#333'
    };
  
    const selectStyle: React.CSSProperties = {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: error ? '1px solid #e74c3c' : '1px solid #ddd',
      fontSize: '1rem',
      outline: 'none',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      ...style
    };
  
    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <select style={selectStyle} {...props}>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        {error && <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
      </div>
    );
};
