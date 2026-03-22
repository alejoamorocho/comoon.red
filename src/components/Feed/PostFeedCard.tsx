import { useState } from 'react';
import { MapPin, UserCircle, ShareNetwork, ChatText } from '@phosphor-icons/react';
import type { PostFeedItem } from '../../types/feed';
import ShareButtons from '../ShareButtons';

interface PostFeedCardProps {
  post: PostFeedItem;
}

export default function PostFeedCard({ post }: PostFeedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.content.length > 200;
  const displayContent = isLong && !expanded ? post.content.slice(0, 200) + '...' : post.content;

  const roleBadge =
    post.author.role === 'leader'
      ? { label: 'Lider', color: 'bg-leader/20 text-leader border-leader/30' }
      : {
          label: 'Emprendedor',
          color: 'bg-entrepreneur/20 text-entrepreneur border-entrepreneur/30',
        };

  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-comoon-purple/10">
      {/* Author header */}
      <div className="p-5 pb-3">
        <div className="mb-3 flex items-center gap-3">
          {post.author.photo_url ? (
            <img
              src={post.author.photo_url}
              alt={post.author.name}
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-comoon-purple/20">
              <UserCircle size={24} className="text-comoon-purple" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-white">{post.author.name}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
            {(post.author.city || post.author.department) && (
              <p className="flex items-center gap-1 text-xs text-dracula-comment">
                <MapPin size={10} />
                {post.author.city}
                {post.author.city && post.author.department ? ', ' : ''}
                {post.author.department}
              </p>
            )}
          </div>
          <div className="text-xs text-dracula-comment">
            <ChatText size={16} className="mr-1 inline" />
            Post
          </div>
        </div>

        {/* Content */}
        <p className="whitespace-pre-line text-sm leading-relaxed text-dracula-fg/90">
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-dracula-cyan hover:underline"
          >
            {expanded ? 'Leer menos' : 'Leer mas'}
          </button>
        )}
      </div>

      {/* Photo */}
      {post.photo_url && (
        <div className="px-5 pb-3">
          <img
            src={post.photo_url}
            alt="Foto del post"
            loading="lazy"
            decoding="async"
            className="max-h-80 w-full rounded-xl object-cover"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 px-5 pb-4 pt-3">
        <span className="text-xs text-dracula-comment">
          {new Date(post.created_at).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-2">
          <ShareButtons
            title={`Post de ${post.author.name} en Comoon`}
            text={post.content.slice(0, 100)}
          />
        </div>
      </div>
    </div>
  );
}
