import React from 'react';

interface CustomTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const uniqueId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="custom-textarea-container">
      {label && (
        <label 
          htmlFor={uniqueId} 
          className="custom-textarea-label"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={uniqueId}
        className={`custom-textarea ${error ? 'custom-textarea-error' : ''} ${className}`}
        {...props}
      />
      
      {error && (
        <div className="custom-textarea-error-message">{error}</div>
      )}
      
      <style>{`
        .custom-textarea-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .custom-textarea-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .custom-textarea {
          min-height: 100px;
          padding: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #1f2937;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          resize: vertical;
        }
        
        .custom-textarea:focus {
          outline: none;
          border-color: #c5e82e;
          box-shadow: 0 0 0 3px rgba(197, 232, 46, 0.15);
        }
        
        .custom-textarea-error {
          border-color: #ef4444;
        }
        
        .custom-textarea-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
        
        .custom-textarea-error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .custom-textarea::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};