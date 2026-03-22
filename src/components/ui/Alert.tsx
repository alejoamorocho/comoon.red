import { cn } from '../../utils/cn';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

const alertStyles = {
  error: 'bg-dracula-red/10 border-dracula-red/30 text-dracula-red',
  success: 'bg-dracula-green/10 border-dracula-green/30 text-dracula-green',
  warning: 'bg-dracula-orange/10 border-dracula-orange/30 text-dracula-orange',
  info: 'bg-dracula-cyan/10 border-dracula-cyan/30 text-dracula-cyan',
};

export function Alert({ type, message, className }: AlertProps) {
  if (!message) return null;
  return (
    <div
      className={cn('rounded-lg border px-4 py-3 text-sm', alertStyles[type], className)}
      role="alert"
    >
      {message}
    </div>
  );
}
