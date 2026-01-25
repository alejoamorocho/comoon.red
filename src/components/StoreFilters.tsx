import { useState } from 'react';
import { Funnel, Heart, UsersThree, X, MapPin } from '@phosphor-icons/react';

interface Cause {
    id: string;
    title: string;
    leaderName: string;
}

interface Leader {
    id: string;
    name: string;
    location: string;
}

interface StoreFiltersProps {
    causes: Cause[];
    leaders: Leader[];
    activeCauseId?: string | null;
    activeLeaderId?: string | null;
}

export default function StoreFilters({
    causes,
    leaders,
    activeCauseId,
    activeLeaderId
}: StoreFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'causa' | 'lider' | null>(null);

    const handleFilterSelect = (type: 'causa' | 'lider', id: string) => {
        const param = type === 'causa' ? 'causa' : 'lider';
        window.location.href = `/store?${param}=${id}`;
    };

    const clearFilters = () => {
        window.location.href = '/store';
    };

    const hasActiveFilter = activeCauseId || activeLeaderId;

    return (
        <div className="mb-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <button
                    onClick={() => {
                        setFilterType(filterType === 'causa' ? null : 'causa');
                        setShowFilters(filterType !== 'causa');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        filterType === 'causa' || activeCauseId
                            ? 'bg-leader/20 border-leader text-leader'
                            : 'bg-dracula-current/30 border-dracula-current text-dracula-fg/80 hover:border-leader'
                    }`}
                >
                    <Heart size={18} weight="duotone" />
                    Filtrar por Causa
                </button>

                <button
                    onClick={() => {
                        setFilterType(filterType === 'lider' ? null : 'lider');
                        setShowFilters(filterType !== 'lider');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        filterType === 'lider' || activeLeaderId
                            ? 'bg-leader/20 border-leader text-leader'
                            : 'bg-dracula-current/30 border-dracula-current text-dracula-fg/80 hover:border-leader'
                    }`}
                >
                    <UsersThree size={18} weight="duotone" />
                    Filtrar por Lider
                </button>

                {hasActiveFilter && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-dracula-red hover:text-white transition-colors text-sm"
                    >
                        <X size={16} />
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Filter Options */}
            {showFilters && filterType && (
                <div className="glass p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Funnel size={16} />
                            {filterType === 'causa' ? 'Selecciona una causa' : 'Selecciona un lider'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowFilters(false);
                                setFilterType(null);
                            }}
                            className="text-dracula-comment hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filterType === 'causa' ? (
                            causes.map(cause => (
                                <button
                                    key={cause.id}
                                    onClick={() => handleFilterSelect('causa', cause.id)}
                                    className={`text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                                        activeCauseId === cause.id
                                            ? 'bg-leader/20 border-leader'
                                            : 'bg-dracula-bg/50 border-dracula-current hover:border-leader/50'
                                    }`}
                                >
                                    <p className="font-bold text-white text-sm">{cause.title}</p>
                                    <p className="text-xs text-dracula-comment">Lider: {cause.leaderName}</p>
                                </button>
                            ))
                        ) : (
                            leaders.map(leader => (
                                <button
                                    key={leader.id}
                                    onClick={() => handleFilterSelect('lider', leader.id)}
                                    className={`text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                                        activeLeaderId === leader.id
                                            ? 'bg-leader/20 border-leader'
                                            : 'bg-dracula-bg/50 border-dracula-current hover:border-leader/50'
                                    }`}
                                >
                                    <p className="font-bold text-white text-sm">{leader.name}</p>
                                    <p className="text-xs text-dracula-comment flex items-center gap-1">
                                        <MapPin size={12} />
                                        {leader.location}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
