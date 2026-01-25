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
    variant = 'badge'
}: ProfileCompleteBadgeProps) {
    if (!isComplete && !showPercentage) return null;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18
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
            <span className={`inline-flex items-center gap-1 ${isComplete ? 'text-dracula-yellow' : 'text-dracula-comment'}`}>
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
            <span className={`inline-flex items-center gap-1 bg-dracula-yellow/20 text-dracula-yellow border border-dracula-yellow/30 rounded-full font-medium ${sizeClasses[size]}`}>
                <Medal size={iconSizes[size]} weight="fill" />
                Perfil Completo
            </span>
        );
    }

    if (showPercentage) {
        return (
            <span className={`inline-flex items-center gap-1 bg-dracula-current text-dracula-comment border border-dracula-current rounded-full font-medium ${sizeClasses[size]}`}>
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

export function ProfileProgress({ percentage, showLabel = true, missingFields = [] }: ProfileProgressProps) {
    const isComplete = percentage === 100;

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
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
                    <span className={`text-sm font-bold ${isComplete ? 'text-dracula-yellow' : 'text-dracula-comment'}`}>
                        {percentage}%
                    </span>
                </div>
            )}

            <div className="w-full bg-dracula-current h-2 rounded-full overflow-hidden">
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
                    <p className="text-xs text-dracula-comment mb-2">Falta completar:</p>
                    <ul className="space-y-1">
                        {missingFields.map((field, i) => (
                            <li key={i} className="text-xs text-dracula-fg/70 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-dracula-comment" />
                                {field}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
