import { useState, useEffect, useCallback } from 'react';
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
  activeLeaderId,
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

  const closeFilters = useCallback(() => {
    setShowFilters(false);
    setFilterType(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFilters();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeFilters]);

  return (
    <div className="mb-8">
      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            setFilterType(filterType === 'causa' ? null : 'causa');
            setShowFilters(filterType !== 'causa');
          }}
          aria-expanded={showFilters && filterType === 'causa'}
          aria-haspopup="listbox"
          className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
            filterType === 'causa' || activeCauseId
              ? 'border-leader bg-leader/20 text-leader'
              : 'border-dracula-current bg-dracula-current/30 text-dracula-fg/80 hover:border-leader'
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
          aria-expanded={showFilters && filterType === 'lider'}
          aria-haspopup="listbox"
          className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
            filterType === 'lider' || activeLeaderId
              ? 'border-leader bg-leader/20 text-leader'
              : 'border-dracula-current bg-dracula-current/30 text-dracula-fg/80 hover:border-leader'
          }`}
        >
          <UsersThree size={18} weight="duotone" />
          Filtrar por Lider
        </button>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-dracula-red transition-colors hover:text-white"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && filterType && (
        <div className="glass animate-in fade-in slide-in-from-top-2 rounded-xl border border-white/10 p-4 duration-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
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

          <div
            role="listbox"
            aria-label={filterType === 'causa' ? 'Causas disponibles' : 'Lideres disponibles'}
            className="grid grid-cols-1 gap-2 md:grid-cols-2"
          >
            {filterType === 'causa'
              ? causes.map((cause) => (
                  <button
                    key={cause.id}
                    role="option"
                    aria-selected={activeCauseId === cause.id}
                    onClick={() => handleFilterSelect('causa', cause.id)}
                    className={`rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${
                      activeCauseId === cause.id
                        ? 'border-leader bg-leader/20'
                        : 'border-dracula-current bg-dracula-bg/50 hover:border-leader/50'
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{cause.title}</p>
                    <p className="text-xs text-dracula-comment">Lider: {cause.leaderName}</p>
                  </button>
                ))
              : leaders.map((leader) => (
                  <button
                    key={leader.id}
                    role="option"
                    aria-selected={activeLeaderId === leader.id}
                    onClick={() => handleFilterSelect('lider', leader.id)}
                    className={`rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${
                      activeLeaderId === leader.id
                        ? 'border-leader bg-leader/20'
                        : 'border-dracula-current bg-dracula-bg/50 hover:border-leader/50'
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{leader.name}</p>
                    <p className="flex items-center gap-1 text-xs text-dracula-comment">
                      <MapPin size={12} />
                      {leader.location}
                    </p>
                  </button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
