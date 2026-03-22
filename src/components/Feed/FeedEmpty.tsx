import { MagnifyingGlass, FunnelSimple, ArrowCounterClockwise } from '@phosphor-icons/react';

interface FeedEmptyProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function FeedEmpty({ hasFilters = false, onClearFilters }: FeedEmptyProps) {
  return (
    <div className="glass rounded-2xl border border-white/5 p-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-dracula-current/30">
        {hasFilters ? (
          <FunnelSimple size={40} className="text-dracula-comment" />
        ) : (
          <MagnifyingGlass size={40} className="text-dracula-comment" />
        )}
      </div>

      <h3 className="mb-2 text-xl font-bold text-white">
        {hasFilters ? 'Sin resultados' : 'No hay contenido disponible'}
      </h3>

      <p className="mx-auto mb-6 max-w-md text-dracula-comment">
        {hasFilters
          ? 'No encontramos contenido con los filtros seleccionados. Intenta ajustar los filtros o limpiarlos para ver todo el contenido.'
          : 'Aun no hay productos, causas o historias publicadas. Vuelve pronto para ver novedades.'}
      </p>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 rounded-full border border-dracula-purple/50 bg-dracula-purple/20 px-6 py-3 font-medium text-white transition-colors hover:bg-dracula-purple/30"
        >
          <ArrowCounterClockwise size={18} />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
