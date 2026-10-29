import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={18} style={{ color: 'var(--danger-text)' }} />,
    success: <CheckCircle size={18} style={{ color: 'var(--success-text)' }} />,
    info: <Info size={18} style={{ color: 'var(--info-text)' }} />,
    warning: <AlertTriangle size={18} style={{ color: 'var(--warning-text)' }} />
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {icons[type] || icons.info}
      </div>
      <div style={{ flex: 1, lineHeight: 1.5 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'opacity 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
