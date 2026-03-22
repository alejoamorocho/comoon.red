import { useState } from 'react';
import { PlusCircle, CircleNotch, CheckCircle } from '@phosphor-icons/react';

export default function CreateCauseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/causes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          target_goal: goal ? parseInt(goal) : null,
          photo_url: photoUrl || null,
        }),
      });

      const data = (await res.json()) as { error?: string; data?: unknown };

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/leader?tab=causas';
        }, 1500);
      } else {
        setError(data.error || 'Error al crear la causa');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-3 text-dracula-green" weight="fill" />
        <p className="text-lg font-bold text-white">Causa creada exitosamente!</p>
        <p className="text-sm text-dracula-comment">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}
      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Titulo de la Causa</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Biblioteca Comunitaria para Ninos..."
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripcion</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe el impacto que tendra esta causa..."
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Meta Financiera (COP)
          </label>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="5000000"
            min="100000"
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Foto (URL)</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
          />
        </div>
      </div>

      {goal && (
        <div className="rounded-xl border border-dracula-current/50 bg-dracula-bg/50 p-4">
          <p className="mb-2 text-xs text-dracula-comment">Vista previa de meta:</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-dracula-current">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-dracula-green to-dracula-cyan" />
          </div>
          <p className="mt-1 text-xs text-dracula-comment">
            $0 de ${parseInt(goal || '0').toLocaleString('es-CO')}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !title}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dracula-purple py-3 font-bold text-dracula-bg shadow-[0_0_20px_rgba(189,147,249,0.2)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <CircleNotch size={20} className="animate-spin" /> Creando...
          </>
        ) : (
          <>
            <PlusCircle size={20} /> Publicar Causa
          </>
        )}
      </button>
    </form>
  );
}
