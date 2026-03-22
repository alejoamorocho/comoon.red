import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-dracula-fg">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
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
Textarea.displayName = 'Textarea';
