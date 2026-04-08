import { Heart, Target, MapPin } from '@phosphor-icons/react';
import type { CauseFeedItem } from '../../types/feed';
import { LeaderTagsList } from '../LeaderTagBadge';
import { formatCOP } from '../../utils/format';

interface CauseFeedCardProps {
  cause: CauseFeedItem;
}

export default function CauseFeedCard({ cause }: CauseFeedCardProps) {
  // Calculate progress percentage
  const progress = cause.target_goal
    ? Math.min((cause.current_amount / cause.target_goal) * 100, 100)
    : 0;

  return (
    <div className="glass group overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-leader/10">
      {/* Cause Image */}
      <div className="relative h-48 overflow-hidden bg-dracula-current/20">
        <a href={`/causes/${cause.id}`}>
          {cause.photo_url ? (
            <img
              src={cause.photo_url}
              alt={cause.title}
              width={400}
              height={300}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Heart size={64} className="text-leader/30" weight="duotone" />
            </div>
          )}
        </a>
        {/* Type badge */}
        <div className="absolute left-3 top-3 rounded-full bg-leader/90 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          Causa
        </div>
        {/* Progress indicator */}
        {cause.target_goal && (
          <div className="absolute right-3 top-3 rounded-full bg-dracula-bg/90 px-3 py-1 text-xs font-bold text-leader backdrop-blur">
            {Math.round(progress)}% logrado
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Cause Title */}
        <a href={`/causes/${cause.id}`} className="mb-2 block transition-colors hover:text-leader">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white">
            {cause.title}
          </h3>
        </a>

        {/* Leader info */}
        <div className="mb-4 flex items-center gap-3">
          {cause.leader.photo_url ? (
            <img
              src={cause.leader.photo_url}
              alt={cause.leader.name}
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-leader/20">
              <span className="text-xs font-bold text-leader">{cause.leader.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <a
              href={`/leaders/${cause.leader.id}`}
              className="block truncate text-sm font-medium text-leader transition-colors hover:text-white"
            >
              {cause.leader.name}
            </a>
            {(cause.leader.city || cause.leader.department) && (
              <p className="flex items-center gap-1 text-xs text-dracula-comment">
                <MapPin size={10} />
                {cause.leader.city}
                {cause.leader.city && cause.leader.department ? ', ' : ''}
                {cause.leader.department}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {cause.leader.tags && cause.leader.tags.length > 0 && (
          <div className="mb-4">
            <LeaderTagsList tags={cause.leader.tags} size="sm" maxVisible={3} />
          </div>
        )}

        {/* Progress bar */}
        {cause.target_goal && (
          <div className="mb-4 rounded-xl border border-leader/20 bg-dracula-bg/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-dracula-comment">Recaudado</span>
              <span className="font-bold text-leader">{formatCOP(cause.current_amount)}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-dracula-current/50"
              role="progressbar"
              aria-valuenow={cause.current_amount}
              aria-valuemin={0}
              aria-valuemax={cause.target_goal}
              aria-label="Progreso de la causa"
            >
              <div
                className="h-full bg-gradient-to-r from-leader to-dracula-purple transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-dracula-comment">Meta</span>
              <span className="text-white">{formatCOP(cause.target_goal)}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {cause.description && (
          <p className="mb-4 line-clamp-2 text-sm text-dracula-fg/80">{cause.description}</p>
        )}

        {/* CTA */}
        <a
          href={`/causes/${cause.id}`}
          className="block w-full rounded-full border border-leader/30 bg-leader/20 py-2.5 text-center text-sm font-medium text-leader transition-colors hover:bg-leader/30"
        >
          Ver causa completa
        </a>
      </div>
    </div>
  );
}
