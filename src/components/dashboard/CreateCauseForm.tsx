import { useState } from 'react';
import { PlusCircle, CircleNotch, CheckCircle, CaretDown } from '@phosphor-icons/react';
import ImageUpload from '../ImageUpload';

const CATEGORIES = [
  { value: '', label: 'Seleccionar categoría...' },
  { value: 'educacion', label: 'Educación' },
  { value: 'salud', label: 'Salud' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'comunidad', label: 'Comunidad' },
  { value: 'otro', label: 'Otro' },
];

const NEEDS_OPTIONS = [
  { value: 'voluntarios', label: 'Voluntarios' },
  { value: 'dinero', label: 'Dinero' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'difusion', label: 'Difusión' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'otro', label: 'Otro' },
];

export default function CreateCauseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extra optional fields
  const [showMore, setShowMore] = useState(false);
  const [location, setLocation] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [fundUsage, setFundUsage] = useState('');

  const toggleNeed = (value: string) => {
    setNeeds((prev) => (prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value]));
  };

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
          location: location || null,
          beneficiary_count: beneficiaryCount ? parseInt(beneficiaryCount) : null,
          start_date: startDate || null,
          end_date: endDate || null,
          category: category || null,
          needs: needs.length > 0 ? needs : null,
          fund_usage: fundUsage || null,
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
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-3 text-dracula-green" weight="fill" />
        <p className="text-lg font-bold text-white">¡Causa creada exitosamente!</p>
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
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Título de la Causa</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Biblioteca Comunitaria para Niños..."
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe el impacto que tendrá esta causa..."
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
        <div className="flex items-end">
          <ImageUpload
            value={photoUrl}
            onChange={setPhotoUrl}
            shape="rect"
            size="lg"
            label="Foto de la causa"
            accentColor="leader"
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

      {/* Collapsible extra details */}
      <div className="rounded-xl border border-dracula-current/50 bg-dracula-bg/30">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-dracula-comment transition-colors hover:text-dracula-fg"
        >
          <span>Más detalles (opcional)</span>
          <CaretDown size={16} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>

        {showMore && (
          <div className="space-y-4 border-t border-dracula-current/50 px-4 pb-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-dracula-fg">Ubicación</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Bogotá, Colombia"
                  className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-dracula-fg">
                  Beneficiarios estimados
                </label>
                <input
                  type="number"
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(e.target.value)}
                  placeholder="Ej. 100"
                  min="1"
                  className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-dracula-fg">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-dracula-fg">Fecha de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-dracula-fg">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-dracula-fg">
                Necesidades de la causa
              </label>
              <div className="flex flex-wrap gap-2">
                {NEEDS_OPTIONS.map((need) => (
                  <button
                    key={need.value}
                    type="button"
                    onClick={() => toggleNeed(need.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      needs.includes(need.value)
                        ? 'border-dracula-purple bg-dracula-purple/20 text-dracula-purple'
                        : 'border-dracula-current bg-dracula-bg text-dracula-comment hover:border-dracula-comment'
                    }`}
                  >
                    {need.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-dracula-fg">
                Uso de los fondos
              </label>
              <textarea
                value={fundUsage}
                onChange={(e) => setFundUsage(e.target.value)}
                rows={3}
                placeholder="Describe cómo se usarán los fondos recaudados..."
                className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-dracula-purple"
              />
            </div>
          </div>
        )}
      </div>

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
