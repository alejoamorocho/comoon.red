import { useState, useEffect } from 'react';
import { PlusCircle, CircleNotch, CheckCircle, Calculator } from '@phosphor-icons/react';

interface Cause {
  id: number;
  title: string;
  leader_name: string;
  current_amount: number;
  target_goal: number | null;
}

interface CreateProductFormProps {
  userRole?: 'leader' | 'entrepreneur';
}

export default function CreateProductForm({ userRole = 'entrepreneur' }: CreateProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [causeId, setCauseId] = useState<number | null>(null);
  const [contributionType, setContributionType] = useState('percentage');
  const [contributionAmount, setContributionAmount] = useState('10');
  const [contributionText, setContributionText] = useState('');
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // For leaders, fetch only their own causes; for entrepreneurs, fetch all active
    fetch('/api/causes?status=active')
      .then((r) => r.json())
      .then((d: { data?: Cause[] }) => setCauses(d.data || []))
      .catch(() => {});
  }, []);

  const calcContribution = () => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(contributionAmount) || 0;
    if (p <= 0 || a <= 0) return null;
    if (contributionType === 'percentage') {
      return Math.round((p * a) / 100);
    }
    return a;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!causeId) {
      setError('Selecciona una causa');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cause_id: causeId,
          name,
          description: description || null,
          price: parseInt(price),
          contribution_amount: parseFloat(contributionAmount) || 10,
          contribution_type: contributionType,
          contribution_text: contributionText || null,
          photo_url: photoUrl || null,
        }),
      });

      const data = (await res.json()) as { error?: string; data?: unknown };

      if (res.ok) {
        setSuccess(true);
        const redirectUrl =
          userRole === 'leader'
            ? '/dashboard/leader?tab=productos'
            : '/dashboard/entrepreneur?tab=productos';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        setError(data.error || 'Error al crear el producto');
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
        <p className="text-lg font-bold text-white">Producto creado exitosamente!</p>
        <p className="text-sm text-dracula-comment">Redirigiendo...</p>
      </div>
    );
  }

  const contribution = calcContribution();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Collar de Semillas..."
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Precio (COP)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50000"
            min="1000"
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripcion</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe tu producto..."
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">
          Foto del Producto (URL)
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
        />
      </div>

      {/* Cause selection */}
      <div className="rounded-xl border border-dracula-purple/30 bg-dracula-purple/10 p-5">
        <label className="mb-3 block text-sm font-bold text-dracula-purple">
          Vincular a una Causa (Obligatorio)
        </label>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {causes.map((cause) => (
            <button
              key={cause.id}
              type="button"
              onClick={() => setCauseId(cause.id)}
              className={`w-full rounded-lg border p-4 text-left transition-all ${
                causeId === cause.id
                  ? 'border-leader bg-leader/5'
                  : 'border-dracula-current bg-dracula-bg/50 hover:border-dracula-fg/30'
              }`}
            >
              <h4 className="text-sm font-medium text-white">{cause.title}</h4>
              <p className="text-xs text-dracula-comment">{cause.leader_name}</p>
            </button>
          ))}
          {causes.length === 0 && (
            <p className="p-3 text-sm text-dracula-comment">Cargando causas...</p>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold text-dracula-fg">
              Tipo de Contribucion
            </label>
            <select
              value={contributionType}
              onChange={(e) => setContributionType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-3 py-2 text-sm text-white"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-dracula-fg">Cantidad</label>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              min="1"
              className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-3 py-2 text-sm text-white"
              required
            />
          </div>
        </div>

        {contribution !== null && (
          <div className="mt-3 rounded-lg border border-dracula-current/50 bg-dracula-bg/50 p-3">
            <p className="flex items-center gap-1 text-xs text-dracula-comment">
              <Calculator size={14} />
              {contributionType === 'percentage'
                ? `Si vendes a $${parseInt(price || '0').toLocaleString('es-CO')} y donas ${contributionAmount}%, la causa recibe $${contribution.toLocaleString('es-CO')}`
                : `Por cada venta, la causa recibe $${contribution.toLocaleString('es-CO')}`}
            </p>
          </div>
        )}

        <div className="mt-3">
          <label className="mb-2 block text-xs font-bold text-dracula-fg">
            Mensaje de Contribucion (opcional)
          </label>
          <input
            type="text"
            value={contributionText}
            onChange={(e) => setContributionText(e.target.value)}
            placeholder="Ej. Donamos el 10% de cada venta a..."
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !name || !price || !causeId}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-entrepreneur py-3 font-bold text-dracula-bg shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <CircleNotch size={20} className="animate-spin" /> Creando...
          </>
        ) : (
          <>
            <PlusCircle size={20} /> Publicar Producto
          </>
        )}
      </button>
    </form>
  );
}
