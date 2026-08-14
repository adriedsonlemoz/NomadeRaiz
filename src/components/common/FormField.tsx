import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, help, error, children }: FormFieldProps) {
  return (
    <div className="nr-form-field">
      <label className="nr-form-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="nr-form-error">{error}</p> : help ? <p className="nr-form-help">{help}</p> : null}
    </div>
  );
}
