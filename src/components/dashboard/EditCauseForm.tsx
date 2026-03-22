import { useState } from 'react';
import {
  CircleNotch,
  CheckCircle,
  Heart,
  MapPin,
  CalendarBlank,
  ListChecks,
  ShieldCheck,
  Images,
  CaretDown,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import ImageUpload from '../ImageUpload';

interface EditCauseFormProps {
  causeId: number;
  initialData: {
    title: string;
    description: string;
    target_goal: number | null;
    photo_url: string;
    evidence_photos: string; // JSON string of URL array
    location: string;
    beneficiary_count: number | null;
    start_date: string;
    end_date: string;
    category: string;
    needs: string; // JSON string of string array
    fund_usage: string;
    impact_metrics: string; // JSON string
  };
}

function safeParseArray<T>(json: string | undefined | null, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-dracula-darker/30 rounded-xl border border-dracula-current">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-lg font-bold text-dracula-fg">{title}</span>
        </div>
        <CaretDown
          size={20}
          className={`text-dracula-comment transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="space-y-4 border-t border-dracula-current px-5 pb-5 pt-4">{children}</div>
      )}
    </div>
  );
}

const CATEGORY_OPTIONS = [
  { value: 'educacion', label: 'Educacion' },
  { value: 'salud', label: 'Salud' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'alimentacion', label: 'Alimentacion' },
  { value: 'comunidad', label: 'Comunidad' },
  { value: 'otro', label: 'Otro' },
];

const NEEDS_OPTIONS = [
  { value: 'voluntarios', label: 'Voluntarios' },
  { value: 'dinero', label: 'Dinero' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'difusion', label: 'Difusion' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'otro', label: 'Otro' },
];

export default function EditCauseForm({ causeId, initialData }: EditCauseFormProps) {
  // Section 1 - Basic Info
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');
  const [targetGoal, setTargetGoal] = useState<number | ''>(initialData.target_goal ?? '');

  // Section 2 - Location & Community
  const [location, setLocation] = useState(initialData.location || '');
  const [beneficiaryCount, setBeneficiaryCount] = useState<number | ''>(
    initialData.beneficiary_count ?? '',
  );

  // Section 3 - Timeline
  const [startDate, setStartDate] = useState(initialData.start_date || '');
  const [endDate, setEndDate] = useState(initialData.end_date || '');

  // Section 4 - Category & Needs
  const [category, setCategory] = useState(initialData.category || '');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(
    safeParseArray<string>(initialData.needs),
  );

  // Section 5 - Transparency
  const [fundUsage, setFundUsage] = useState(initialData.fund_usage || '');

  // Section 6 - Evidence Photos
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>(
    safeParseArray<string>(initialData.evidence_photos),
  );

  // UI state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    location: true,
    timeline: false,
    category: false,
    transparency: false,
    evidence: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
    );
  };

  // Evidence photo helpers
  const addEvidencePhoto = () => {
    if (evidencePhotos.length < 6) setEvidencePhotos((prev) => [...prev, '']);
  };
  const removeEvidencePhoto = (i: number) =>
    setEvidencePhotos((prev) => prev.filter((_, idx) => idx !== i));
  const updateEvidencePhoto = (i: number, url: string) =>
    setEvidencePhotos((prev) => prev.map((p, idx) => (idx === i ? url : p)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/causes/${causeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          target_goal: targetGoal === '' ? null : targetGoal,
          photo_url: photoUrl || null,
          evidence_photos: evidencePhotos,
          location,
          beneficiary_count: beneficiaryCount === '' ? null : beneficiaryCount,
          start_date: startDate || null,
          end_date: endDate || null,
          category,
          needs: selectedNeeds,
          fund_usage: fundUsage,
          impact_metrics: initialData.impact_metrics,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error || 'Error al guardar');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader';
  const selectClass =
    'w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-dracula-green/50 bg-dracula-green/20 p-3 text-sm text-dracula-green">
          <CheckCircle size={18} weight="fill" /> Causa actualizada
        </div>
      )}

      {/* Section 1: Informacion Basica */}
      <CollapsibleSection
        title="Informacion Basica"
        icon={<Heart size={22} className="text-leader" />}
        isOpen={openSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Titulo <span className="text-dracula-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripcion</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>
        <ImageUpload
          value={photoUrl}
          onChange={setPhotoUrl}
          shape="rect"
          size="lg"
          label="Foto de la causa"
          accentColor="leader"
        />
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Meta de recaudo</label>
          <input
            type="number"
            min={0}
            value={targetGoal}
            onChange={(e) => setTargetGoal(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Meta en pesos COP"
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 2: Ubicacion y Comunidad */}
      <CollapsibleSection
        title="Ubicacion y Comunidad"
        icon={<MapPin size={22} className="text-leader" />}
        isOpen={openSections.location}
        onToggle={() => toggleSection('location')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Ubicacion</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: Barrio El Poblado, Comuna 14"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Personas beneficiadas
          </label>
          <input
            type="number"
            min={0}
            value={beneficiaryCount}
            onChange={(e) =>
              setBeneficiaryCount(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="Numero de personas beneficiadas"
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 3: Linea de Tiempo */}
      <CollapsibleSection
        title="Linea de Tiempo"
        icon={<CalendarBlank size={22} className="text-leader" />}
        isOpen={openSections.timeline}
        onToggle={() => toggleSection('timeline')}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Fecha de inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Fecha de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4: Categoria y Necesidades */}
      <CollapsibleSection
        title="Categoria y Necesidades"
        icon={<ListChecks size={22} className="text-leader" />}
        isOpen={openSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-3 block text-sm font-bold text-dracula-fg">Necesidades</label>
          <div className="flex flex-wrap gap-2">
            {NEEDS_OPTIONS.map((opt) => {
              const isSelected = selectedNeeds.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleNeed(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-leader bg-leader/20 text-leader'
                      : 'border-dracula-current bg-dracula-current/30 text-dracula-comment hover:border-dracula-fg/30'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 5: Transparencia */}
      <CollapsibleSection
        title="Transparencia"
        icon={<ShieldCheck size={22} className="text-leader" />}
        isOpen={openSections.transparency}
        onToggle={() => toggleSection('transparency')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Uso de fondos</label>
          <p className="mb-2 text-sm italic text-dracula-comment">
            Explica como se usan los fondos. La transparencia genera confianza.
          </p>
          <textarea
            rows={4}
            value={fundUsage}
            onChange={(e) => setFundUsage(e.target.value)}
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 6: Fotos de Evidencia */}
      <CollapsibleSection
        title="Fotos de Evidencia"
        icon={<Images size={22} className="text-leader" />}
        isOpen={openSections.evidence}
        onToggle={() => toggleSection('evidence')}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {evidencePhotos.map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                value={url}
                onChange={(newUrl) => updateEvidencePhoto(i, newUrl)}
                shape="rect"
                size="md"
                label=""
                accentColor="leader"
              />
              <button
                type="button"
                onClick={() => removeEvidencePhoto(i)}
                className="mt-1 flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
              >
                <Trash size={12} /> Quitar
              </button>
            </div>
          ))}
        </div>
        {evidencePhotos.length < 6 && (
          <button
            type="button"
            onClick={addEvidencePhoto}
            className="flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-leader hover:text-leader"
          >
            <Plus size={16} /> Agregar foto ({evidencePhotos.length}/6)
          </button>
        )}
      </CollapsibleSection>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-leader py-3 font-bold text-dracula-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <CircleNotch size={20} className="animate-spin" /> Guardando...
          </>
        ) : (
          'Guardar Cambios'
        )}
      </button>
    </form>
  );
}
