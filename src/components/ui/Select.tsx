import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-dracula-fg">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg border bg-dracula-bg/50 px-4 py-3 text-dracula-fg transition-all',
            error ? 'border-dracula-red' : 'border-white/10 focus:border-dracula-purple',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-dracula-red">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
