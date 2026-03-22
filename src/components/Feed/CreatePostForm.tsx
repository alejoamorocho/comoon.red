import { useState } from 'react';
import { PaperPlaneTilt, Image, CircleNotch, UserCircle } from '@phosphor-icons/react';

interface CreatePostFormProps {
  userRole?: string;
  userName?: string;
  userPhoto?: string;
  onPostCreated?: () => void;
}

export default function CreatePostForm({
  userRole,
  userName,
  userPhoto,
  onPostCreated,
}: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          photo_url: photoUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setContent('');
        setPhotoUrl('');
        setShowPhotoInput(false);
        onPostCreated?.();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error || 'Error al publicar');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const roleBadge =
    userRole === 'leader'
      ? { label: 'Lider', color: 'text-leader' }
      : { label: 'Emprendedor', color: 'text-entrepreneur' };

  return (
    <form onSubmit={handleSubmit} className="glass mb-6 rounded-2xl border border-white/10 p-5">
      <div className="flex items-start gap-3">
        {userPhoto ? (
          <img src={userPhoto} alt={userName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-comoon-purple/20">
            <UserCircle size={24} className="text-comoon-purple" />
          </div>
        )}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-bold text-white">{userName || 'Tu'}</span>
            <span className={`text-xs ${roleBadge.color}`}>{roleBadge.label}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte algo con la comunidad..."
            rows={3}
            className="w-full resize-none rounded-xl border border-dracula-current bg-dracula-bg/50 px-4 py-3 text-sm text-white outline-none placeholder:text-dracula-comment/60 focus:border-comoon-purple"
            required
          />
        </div>
      </div>

      {showPhotoInput && (
        <div className="ml-13 mt-3">
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="URL de la imagen..."
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg/50 px-4 py-2 text-sm text-white outline-none focus:border-comoon-purple"
          />
        </div>
      )}

      {error && <p className="ml-13 mt-2 text-xs text-dracula-red">{error}</p>}

      <div className="ml-13 mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowPhotoInput(!showPhotoInput)}
          className="flex items-center gap-1 text-sm text-dracula-comment transition-colors hover:text-dracula-cyan"
        >
          <Image size={18} />
          Foto
        </button>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 rounded-full bg-comoon-purple px-5 py-2 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <CircleNotch size={16} className="animate-spin" />
          ) : (
            <PaperPlaneTilt size={16} />
          )}
          Publicar
        </button>
      </div>
    </form>
  );
}
