import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, isRequired, id, className = '', rows = 3, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(7);
    const errorId = `${textareaId}-error`;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            <span>
              {label}
              {isRequired && <span className={styles.requiredMark}>*</span>}
            </span>
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={[styles.input, error ? styles.hasError : '', className].filter(Boolean).join(' ')}
          {...props}
        />
        {error && (
          <p id={errorId} className={styles.errorText} role="alert">
            {error}
          </p>
        )}
        {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
