import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dracula-fg">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-dracula-bg/50 px-4 py-3 text-dracula-fg placeholder-dracula-comment/50 transition-all',
            error ? 'border-dracula-red' : 'border-white/10 focus:border-dracula-purple',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-dracula-red">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
