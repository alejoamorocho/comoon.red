import { Leaf, UsersThree, PawPrint, BookOpen, FirstAid, Palette, House, ForkKnife } from '@phosphor-icons/react';

export interface LeaderTag {
    id: string;
    name: string;
    color: string;
    icon: string;
}

// Tag configuration with colors and icons
export const LEADER_TAGS: Record<string, LeaderTag> = {
    ambiental: { id: 'ambiental', name: 'Ambiental', color: 'emerald', icon: 'Leaf' },
    social: { id: 'social', name: 'Social', color: 'blue', icon: 'UsersThree' },
    animales: { id: 'animales', name: 'Animales', color: 'orange', icon: 'PawPrint' },
    educacion: { id: 'educacion', name: 'Educacion', color: 'purple', icon: 'BookOpen' },
    salud: { id: 'salud', name: 'Salud', color: 'red', icon: 'FirstAid' },
    cultura: { id: 'cultura', name: 'Cultura', color: 'pink', icon: 'Palette' },
    comunidad: { id: 'comunidad', name: 'Comunidad', color: 'cyan', icon: 'House' },
    alimentacion: { id: 'alimentacion', name: 'Alimentacion', color: 'yellow', icon: 'ForkKnife' },
};

// Color classes for each tag
const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
};

// Icon component mapping
const IconComponents: Record<string, typeof Leaf> = {
    Leaf,
    UsersThree,
    PawPrint,
    BookOpen,
    FirstAid,
    Palette,
    House,
    ForkKnife,
};

interface LeaderTagBadgeProps {
    tagId: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export default function LeaderTagBadge({ tagId, size = 'sm', showIcon = true }: LeaderTagBadgeProps) {
    const tag = LEADER_TAGS[tagId];
    if (!tag) return null;

    const colors = colorClasses[tag.color] || colorClasses.blue;
    const IconComponent = IconComponents[tag.icon] || Leaf;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-1.5 text-base gap-2',
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16,
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
        >
            {showIcon && <IconComponent size={iconSizes[size]} weight="fill" />}
            {tag.name}
        </span>
    );
}

// Component for tag selection (used in dashboard)
interface TagSelectorProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter(t => t !== tagId));
        } else {
            onChange([...selectedTags, tagId]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {Object.values(LEADER_TAGS).map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                const colors = colorClasses[tag.color] || colorClasses.blue;
                const IconComponent = IconComponents[tag.icon] || Leaf;

                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            isSelected
                                ? `${colors.bg} ${colors.text} ${colors.border}`
                                : 'bg-dracula-current/30 text-dracula-comment border-dracula-current hover:border-dracula-fg/30'
                        }`}
                    >
                        <IconComponent size={14} weight={isSelected ? 'fill' : 'duotone'} />
                        {tag.name}
                    </button>
                );
            })}
        </div>
    );
}

// Component to display multiple tags
interface LeaderTagsListProps {
    tags: string[];
    size?: 'sm' | 'md' | 'lg';
    maxVisible?: number;
}

export function LeaderTagsList({ tags, size = 'sm', maxVisible = 3 }: LeaderTagsListProps) {
    if (!tags || tags.length === 0) return null;

    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;

    return (
        <div className="flex flex-wrap gap-1.5">
            {visibleTags.map(tagId => (
                <LeaderTagBadge key={tagId} tagId={tagId} size={size} />
            ))}
            {remainingCount > 0 && (
                <span className={`inline-flex items-center rounded-full bg-dracula-current/50 text-dracula-comment ${
                    size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'md' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base'
                }`}>
                    +{remainingCount}
                </span>
            )}
        </div>
    );
}
