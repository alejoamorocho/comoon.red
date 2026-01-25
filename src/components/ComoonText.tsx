interface ComoonTextProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    className?: string;
}

const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
};

export default function ComoonText({ size = 'md', className = '' }: ComoonTextProps) {
    return (
        <span className={`font-bold lowercase ${sizeClasses[size]} ${className}`}>
            <span className="text-white">co</span>
            <span className="text-comoon-purple">moon</span>
        </span>
    );
}

export function ComoonTextInline({ className = '' }: { className?: string }) {
    return (
        <span className={`font-bold lowercase ${className}`}>
            <span className="text-white">co</span>
            <span className="text-comoon-purple">moon</span>
        </span>
    );
}
