import { useState } from 'react';
import {
  Heart,
  PencilSimple,
  Archive,
  Calendar,
  ShoppingBag,
  PlusCircle,
  WarningCircle,
} from '@phosphor-icons/react';

interface Cause {
  id: number;
  title: string;
  description: string | null;
  target_goal: number | null;
  current_amount: number;
  photo_url: string | null;
  status: string;
  created_at: string;
}

interface CauseManagementListProps {
  causes: Array<Cause>;
  productCounts?: Record<number, number>;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Activa', bg: 'bg-dracula-green/20', text: 'text-dracula-green' },
  completed: { label: 'Completada', bg: 'bg-dracula-cyan/20', text: 'text-dracula-cyan' },
  archived: { label: 'Archivada', bg: 'bg-dracula-comment/20', text: 'text-dracula-comment' },
  pending: { label: 'Pendiente', bg: 'bg-dracula-yellow/20', text: 'text-dracula-yellow' },
};

export default function CauseManagementList({
  causes: initialCauses,
  productCounts = {},
}: CauseManagementListProps) {
  const [causes, setCauses] = useState<Cause[]>(initialCauses);
  const [archiving, setArchiving] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleArchive = async (causeId: number) => {
    setArchiving(causeId);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/causes/${causeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCauses((prev) => prev.filter((c) => c.id !== causeId));
      }
    } catch {
      // silently fail
    } finally {
      setArchiving(null);
      setConfirmId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (causes.length === 0) {
    return (
      <div className="py-12 text-center">
        <Heart size={48} className="mx-auto mb-4 text-dracula-comment" weight="duotone" />
        <p className="mb-2 text-lg font-bold text-white">Aun no tienes causas.</p>
        <p className="mb-4 text-sm text-dracula-comment">Crea tu primera causa!</p>
        <a
          href="?tab=crear"
          className="inline-flex items-center gap-2 rounded-xl bg-dracula-purple px-5 py-2.5 font-bold text-dracula-bg transition-all hover:brightness-110"
        >
          <PlusCircle size={18} />
          Crear Causa
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {causes.map((cause) => {
        const status = statusConfig[cause.status] ?? {
          label: 'Pendiente',
          bg: 'bg-dracula-yellow/20',
          text: 'text-dracula-yellow',
        };
        const progress =
          cause.target_goal && cause.target_goal > 0
            ? Math.min((cause.current_amount / cause.target_goal) * 100, 100)
            : null;
        const products = productCounts[cause.id] || 0;

        return (
          <div
            key={cause.id}
            className="rounded-xl border border-dracula-current bg-dracula-current/30 p-4 transition-all hover:border-dracula-purple/30"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-dracula-current/50">
                {cause.photo_url ? (
                  <img
                    src={cause.photo_url}
                    alt={cause.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Heart size={28} className="text-dracula-comment" weight="duotone" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-bold text-white">{cause.title}</h3>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>

                {cause.description && (
                  <p className="mb-2 line-clamp-1 text-sm text-dracula-comment">
                    {cause.description}
                  </p>
                )}

                {/* Progress bar */}
                {progress !== null && cause.target_goal && (
                  <div className="mb-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-dracula-current">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-dracula-green to-dracula-cyan transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-dracula-comment">
                      ${cause.current_amount.toLocaleString('es-CO')} de $
                      {cause.target_goal.toLocaleString('es-CO')} ({Math.round(progress)}%)
                    </p>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-dracula-comment">
                  <span className="flex items-center gap-1">
                    <ShoppingBag size={12} />
                    {products} producto{products !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(cause.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2 border-t border-dracula-current/50 pt-3">
              <button
                type="button"
                onClick={() =>
                  (window.location.href = `/dashboard/leader?tab=editar-causa&id=${cause.id}`)
                }
                className="flex items-center gap-1.5 rounded-lg bg-leader/10 px-3 py-1.5 text-xs font-bold text-leader transition-all hover:bg-leader/20"
              >
                <PencilSimple size={14} />
                Editar
              </button>

              {cause.status === 'active' && (
                <>
                  {confirmId === cause.id ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-dracula-yellow">
                        <WarningCircle size={14} />
                        Confirmar?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleArchive(cause.id)}
                        disabled={archiving === cause.id}
                        className="rounded-lg bg-dracula-red/20 px-3 py-1.5 text-xs font-bold text-dracula-red transition-all hover:bg-dracula-red/30 disabled:opacity-50"
                      >
                        {archiving === cause.id ? 'Archivando...' : 'Si, archivar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg bg-dracula-current/50 px-3 py-1.5 text-xs font-bold text-dracula-comment transition-all hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(cause.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-dracula-red/10 px-3 py-1.5 text-xs font-bold text-dracula-red transition-all hover:bg-dracula-red/20"
                    >
                      <Archive size={14} />
                      Archivar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
