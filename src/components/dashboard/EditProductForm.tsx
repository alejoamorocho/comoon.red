import { useState } from 'react';
import {
  CircleNotch,
  CheckCircle,
  ShoppingCart,
  Images,
  Handshake,
  Info,
  CaretDown,
  Plus,
  Trash,
  Package,
} from '@phosphor-icons/react';
import ImageUpload from '../ImageUpload';

interface EditProductFormProps {
  productId: number;
  initialData: {
    name: string;
    description: string;
    price: number;
    photo_url: string;
    gallery_photos: string; // JSON string
    cause_id: number;
    cause_title: string; // Display only
    contribution_type: string;
    contribution_amount: number | null;
    contribution_text: string;
    category: string;
    availability: string;
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

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'out_of_stock', label: 'Agotado' },
  { value: 'preorder', label: 'Pre-orden' },
];

export default function EditProductForm({ productId, initialData }: EditProductFormProps) {
  // Section 1 - Product Info
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');
  const [price, setPrice] = useState<number | ''>(initialData.price ?? '');

  // Section 2 - Gallery
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(
    safeParseArray<string>(initialData.gallery_photos),
  );

  // Section 4 - Contribution
  const [contributionType, setContributionType] = useState(initialData.contribution_type || '');
  const [contributionAmount, setContributionAmount] = useState<number | ''>(
    initialData.contribution_amount ?? '',
  );
  const [contributionText, setContributionText] = useState(initialData.contribution_text || '');

  // Section 5 - Additional Details
  const [category, setCategory] = useState(initialData.category || '');
  const [availability, setAvailability] = useState(initialData.availability || '');

  // UI state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    product: true,
    gallery: false,
    cause: false,
    contribution: true,
    details: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Gallery photo helpers
  const addGalleryPhoto = () => {
    if (galleryPhotos.length < 6) setGalleryPhotos((prev) => [...prev, '']);
  };
  const removeGalleryPhoto = (i: number) =>
    setGalleryPhotos((prev) => prev.filter((_, idx) => idx !== i));
  const updateGalleryPhoto = (i: number, url: string) =>
    setGalleryPhotos((prev) => prev.map((p, idx) => (idx === i ? url : p)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: price === '' ? 0 : price,
          photo_url: photoUrl || null,
          gallery_photos: galleryPhotos,
          cause_id: initialData.cause_id,
          contribution_type: contributionType,
          contribution_amount: contributionAmount === '' ? null : contributionAmount,
          contribution_text: contributionText,
          category,
          availability,
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
    'w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur';
  const selectClass =
    'w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-dracula-green/50 bg-dracula-green/20 p-3 text-sm text-dracula-green">
          <CheckCircle size={18} weight="fill" /> Producto actualizado
        </div>
      )}

      {/* Section 1: Informacion del Producto */}
      <CollapsibleSection
        title="Informacion del Producto"
        icon={<ShoppingCart size={22} className="text-entrepreneur" />}
        isOpen={openSections.product}
        onToggle={() => toggleSection('product')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Nombre <span className="text-dracula-red">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripcion</label>
          <textarea
            rows={3}
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
          label="Foto principal"
          accentColor="entrepreneur"
        />
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Precio (COP)</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Precio en pesos COP"
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 2: Galeria de Fotos */}
      <CollapsibleSection
        title="Galeria de Fotos"
        icon={<Images size={22} className="text-entrepreneur" />}
        isOpen={openSections.gallery}
        onToggle={() => toggleSection('gallery')}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {galleryPhotos.map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                value={url}
                onChange={(newUrl) => updateGalleryPhoto(i, newUrl)}
                shape="rect"
                size="md"
                label=""
                accentColor="entrepreneur"
              />
              <button
                type="button"
                onClick={() => removeGalleryPhoto(i)}
                className="mt-1 flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
              >
                <Trash size={12} /> Quitar
              </button>
            </div>
          ))}
        </div>
        {galleryPhotos.length < 6 && (
          <button
            type="button"
            onClick={addGalleryPhoto}
            className="flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-entrepreneur hover:text-entrepreneur"
          >
            <Plus size={16} /> Agregar foto ({galleryPhotos.length}/6)
          </button>
        )}
      </CollapsibleSection>

      {/* Section 3: Causa Asociada (read-only) */}
      <CollapsibleSection
        title="Causa Asociada"
        icon={<Handshake size={22} className="text-entrepreneur" />}
        isOpen={openSections.cause}
        onToggle={() => toggleSection('cause')}
      >
        <div className="flex items-center gap-3 rounded-lg border border-dracula-purple/30 bg-dracula-purple/10 px-4 py-3">
          <Info size={20} className="shrink-0 text-dracula-purple" />
          <div>
            <p className="text-sm text-dracula-comment">Este producto apoya la causa:</p>
            <p className="font-bold text-dracula-fg">
              {initialData.cause_title || 'Sin causa asociada'}
            </p>
          </div>
        </div>
        <p className="text-xs italic text-dracula-comment">
          La causa asociada no se puede cambiar desde aqui.
        </p>
      </CollapsibleSection>

      {/* Section 4: Contribucion Social */}
      <CollapsibleSection
        title="Contribucion Social"
        icon={<Package size={22} className="text-entrepreneur" />}
        isOpen={openSections.contribution}
        onToggle={() => toggleSection('contribution')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Tipo de contribucion
          </label>
          <select
            value={contributionType}
            onChange={(e) => setContributionType(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Monto de contribucion
          </label>
          <input
            type="number"
            min={0}
            value={contributionAmount}
            onChange={(e) =>
              setContributionAmount(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder={contributionType === 'percentage' ? 'Ej: 10' : 'Ej: 5000'}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Texto de contribucion
          </label>
          <input
            type="text"
            value={contributionText}
            onChange={(e) => setContributionText(e.target.value)}
            placeholder="Ej: Donamos el 10% de cada venta"
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 5: Detalles Adicionales */}
      <CollapsibleSection
        title="Detalles Adicionales"
        icon={<Info size={22} className="text-entrepreneur" />}
        isOpen={openSections.details}
        onToggle={() => toggleSection('details')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Artesanias, Alimentos, Ropa"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Disponibilidad</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CollapsibleSection>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-entrepreneur py-3 font-bold text-dracula-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
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
