import { CheckCircle, Star, Medal } from '@phosphor-icons/react';

interface ProfileCompleteBadgeProps {
  isComplete: boolean;
  completionPercentage?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  variant?: 'badge' | 'inline' | 'icon-only';
}

export default function ProfileCompleteBadge({
  isComplete,
  completionPercentage = 0,
  size = 'sm',
  showPercentage = false,
  variant = 'badge',
}: ProfileCompleteBadgeProps) {
  if (!isComplete && !showPercentage) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  if (variant === 'icon-only') {
    return isComplete ? (
      <Medal
        size={iconSizes[size]}
        weight="fill"
        className="text-dracula-yellow"
        title="Perfil Completo"
      />
    ) : null;
  }

  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1 ${isComplete ? 'text-dracula-yellow' : 'text-dracula-comment'}`}
      >
        {isComplete ? (
          <>
            <Medal size={iconSizes[size]} weight="fill" />
            <span className={sizeClasses[size]}>Perfil Completo</span>
          </>
        ) : showPercentage ? (
          <span className={sizeClasses[size]}>{completionPercentage}% completo</span>
        ) : null}
      </span>
    );
  }

  // Default badge variant
  if (isComplete) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-dracula-yellow/30 bg-dracula-yellow/20 font-medium text-dracula-yellow ${sizeClasses[size]}`}
      >
        <Medal size={iconSizes[size]} weight="fill" />
        Perfil Completo
      </span>
    );
  }

  if (showPercentage) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-dracula-current bg-dracula-current font-medium text-dracula-comment ${sizeClasses[size]}`}
      >
        {completionPercentage}% completo
      </span>
    );
  }

  return null;
}

// Progress bar component for showing profile completion
interface ProfileProgressProps {
  percentage: number;
  showLabel?: boolean;
  missingFields?: string[];
}

export function ProfileProgress({
  percentage,
  showLabel = true,
  missingFields = [],
}: ProfileProgressProps) {
  const isComplete = percentage === 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-dracula-fg">
            {isComplete ? (
              <span className="flex items-center gap-1 text-dracula-yellow">
                <Medal size={16} weight="fill" />
                Perfil Completo
              </span>
            ) : (
              'Completar Perfil'
            )}
          </span>
          <span
            className={`text-sm font-bold ${isComplete ? 'text-dracula-yellow' : 'text-dracula-comment'}`}
          >
            {percentage}%
          </span>
        </div>
      )}

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-dracula-current"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del perfil"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-dracula-yellow to-dracula-orange'
              : 'bg-gradient-to-r from-leader to-entrepreneur'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!isComplete && missingFields.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-dracula-comment">Falta completar:</p>
          <ul className="space-y-1">
            {missingFields.map((field, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-dracula-fg/70">
                <span className="h-1 w-1 rounded-full bg-dracula-comment" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
