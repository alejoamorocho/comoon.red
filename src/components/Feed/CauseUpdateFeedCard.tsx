import {
  Newspaper,
  Trophy,
  Heart,
  CheckCircle,
  MapPin,
  ArrowRight,
  Flag,
} from '@phosphor-icons/react';
import type { CauseUpdateFeedItem } from '../../types/feed';
import { UPDATE_TYPE_CONFIG } from '../../types/feed';
import { getRelativeTime } from '../../utils/format';

interface CauseUpdateFeedCardProps {
  update: CauseUpdateFeedItem;
}

export default function CauseUpdateFeedCard({ update }: CauseUpdateFeedCardProps) {
  const config = UPDATE_TYPE_CONFIG[update.update_type] || UPDATE_TYPE_CONFIG.progress;
  const { Icon, label, bgClass, textClass, borderClass } = config;

  return (
    <div
      className={`glass flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${borderClass} group`}
    >
      {/* Update with photo */}
      {update.photo_url && (
        <div className="relative h-48 overflow-hidden bg-dracula-current/20">
          <a href={`/causes/${update.cause.id}`}>
            <img
              src={update.photo_url}
              alt={update.title}
              width={400}
              height={300}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
          {/* Type badge overlay */}
          <div
            className={`absolute left-3 top-3 ${bgClass} rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${textClass} flex items-center gap-1.5`}
          >
            <Icon size={14} weight="duotone" />
            {label}
          </div>
          {/* Time badge */}
          <div className="absolute right-3 top-3 rounded-full bg-dracula-bg/90 px-2 py-1 text-xs text-dracula-comment backdrop-blur">
            {getRelativeTime(update.created_at)}
          </div>
          {/* Closing badge */}
          {update.is_closing && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-dracula-green/90 px-3 py-1 text-xs font-bold text-dracula-bg backdrop-blur">
              <CheckCircle size={14} weight="fill" />
              Causa Completada
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Type badge (if no photo) */}
        {!update.photo_url && (
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${bgClass} ${textClass}`}
            >
              <Icon size={14} weight="duotone" />
              {label}
            </span>
            <span className="text-xs text-dracula-comment">
              {getRelativeTime(update.created_at)}
            </span>
          </div>
        )}

        {/* Title */}
        <a
          href={`/causes/${update.cause.id}`}
          className="mb-3 block transition-opacity hover:opacity-80"
        >
          <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
            {update.title}
          </h3>
        </a>

        {/* Content preview */}
        <p className="mb-4 line-clamp-3 text-sm text-dracula-fg/80">{update.content}</p>

        {/* Additional photos preview */}
        {update.photos && update.photos.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {update.photos.slice(0, 3).map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Foto ${idx + 1}`}
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
              />
            ))}
            {update.photos.length > 3 && (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-dracula-current/40">
                <span className="text-sm text-dracula-comment">+{update.photos.length - 3}</span>
              </div>
            )}
          </div>
        )}

        {/* Leader info */}
        <div className="mb-4 flex items-center gap-3 border-t border-white/5 pt-4">
          {update.leader.photo_url ? (
            <img
              src={update.leader.photo_url}
              alt={update.leader.name}
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leader/20">
              <span className="font-bold text-leader">{update.leader.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <a
              href={`/leaders/${update.leader.id}`}
              className="block truncate text-sm font-medium text-leader transition-colors hover:text-white"
            >
              {update.leader.name}
            </a>
            {(update.leader.city || update.leader.department) && (
              <p className="flex items-center gap-1 text-xs text-dracula-comment">
                <MapPin size={10} />
                {update.leader.city}
                {update.leader.city && update.leader.department ? ', ' : ''}
                {update.leader.department}
              </p>
            )}
          </div>
        </div>

        {/* Linked cause */}
        <a
          href={`/causes/${update.cause.id}`}
          className={`block rounded-lg border bg-dracula-bg/60 p-3 ${update.cause.status === 'completed' ? 'border-dracula-green/30' : 'border-leader/20'} mb-4 transition-colors hover:border-leader/40`}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-1 flex items-center gap-1 text-xs text-dracula-comment">
                <Flag size={10} />
                Causa
              </p>
              <p className="line-clamp-1 text-sm font-medium text-leader">{update.cause.title}</p>
            </div>
            {update.cause.status === 'completed' && (
              <span className="flex items-center gap-1 text-xs font-medium text-dracula-green">
                <CheckCircle size={12} weight="fill" />
                Completada
              </span>
            )}
          </div>
        </a>

        {/* View cause link */}
        <a
          href={`/causes/${update.cause.id}`}
          className={`mt-auto inline-flex items-center gap-1.5 text-sm font-medium ${textClass} transition-opacity hover:opacity-80`}
        >
          Ver causa
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
