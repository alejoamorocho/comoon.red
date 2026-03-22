import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Confetti,
  Trophy,
  Storefront,
  Camera,
  Tag,
  ShoppingBag,
  CircleNotch,
  CheckCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { LEADER_TAGS } from './LeaderTagBadge';
import ImageUpload from './ImageUpload';

interface OnboardingWizardProps {
  role: 'leader' | 'entrepreneur';
  profileId: number;
  initialData: {
    name?: string;
    bio?: string;
    photo_url?: string;
    department?: string;
    city?: string;
    contact_info?: Record<string, string>;
    tags?: string[];
  };
}

function getToken(): string {
  return localStorage.getItem('token') || '';
}

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function OnboardingWizard({ role, profileId, initialData }: OnboardingWizardProps) {
  const isLeader = role === 'leader';

  // Simplified steps:
  // 0 = Welcome
  // 1 = Photo upload
  // 2 = Tags (leader) / Contact details (entrepreneur) - skip if already filled
  // 3 = Create cause (leader) / Create product (entrepreneur)
  // 4 = Celebration + complete
  const totalSteps = 5;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Photo
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');

  // Leader: tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.tags || []);

  // Entrepreneur: contact (may already be filled from registration)
  const [contactWhatsapp, setContactWhatsapp] = useState(initialData.contact_info?.whatsapp || '');
  const [contactInstagram, setContactInstagram] = useState(
    initialData.contact_info?.instagram || '',
  );
  const [contactFacebook, setContactFacebook] = useState(initialData.contact_info?.facebook || '');

  // Cause/Product creation
  const [causeTitle, setCauseTitle] = useState('');
  const [causeDescription, setCauseDescription] = useState('');
  const [causeGoal, setCauseGoal] = useState('');
  const [causePhoto, setCausePhoto] = useState('');

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPhoto, setProductPhoto] = useState('');
  const [selectedCauseId, setSelectedCauseId] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState('10');
  const [contributionType, setContributionType] = useState('percentage');
  const [availableCauses, setAvailableCauses] = useState<
    Array<{ id: number; title: string; leader_name: string }>
  >([]);

  const [createdItemName, setCreatedItemName] = useState('');

  // Fetch causes for entrepreneur
  useEffect(() => {
    if (!isLeader && step === 3) {
      fetch('/api/causes?status=active')
        .then((r) => r.json())
        .then((d) => setAvailableCauses(d.data || []))
        .catch(() => {});
    }
  }, [step, isLeader]);

  const updateProfile = async (data: Record<string, unknown>) => {
    const endpoint = isLeader ? `/api/leaders/${profileId}` : `/api/entrepreneurs/${profileId}`;
    return apiCall(endpoint, 'PUT', data);
  };

  const handleNext = async () => {
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // Save photo
        await updateProfile({ photo_url: photoUrl || undefined });
      } else if (step === 2) {
        if (isLeader) {
          if (selectedTags.length === 0) {
            setError('Selecciona al menos una etiqueta');
            setLoading(false);
            return;
          }
          await updateProfile({ tags: selectedTags });
        } else {
          if (!contactWhatsapp) {
            setError('El WhatsApp es obligatorio para que te contacten');
            setLoading(false);
            return;
          }
          await updateProfile({
            contact_info: {
              whatsapp: contactWhatsapp,
              instagram: contactInstagram || undefined,
              facebook: contactFacebook || undefined,
            },
          });
        }
      } else if (step === 3) {
        if (isLeader) {
          if (!causeTitle) {
            setError('El titulo de la causa es requerido');
            setLoading(false);
            return;
          }
          const result = await apiCall('/api/causes', 'POST', {
            title: causeTitle,
            description: causeDescription || null,
            target_goal: causeGoal ? parseInt(causeGoal) : null,
            photo_url: causePhoto || null,
          });
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
          setCreatedItemName(causeTitle);
        } else {
          if (!productName || !selectedCauseId || !productPrice) {
            setError('Nombre, causa y precio son requeridos');
            setLoading(false);
            return;
          }
          const result = await apiCall('/api/products', 'POST', {
            cause_id: selectedCauseId,
            name: productName,
            description: productDescription || null,
            price: parseInt(productPrice),
            contribution_amount: parseInt(contributionAmount) || 10,
            contribution_type: contributionType,
            photo_url: productPhoto || null,
          });
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
          setCreatedItemName(productName);
        }
      } else if (step === 4) {
        const result = await apiCall('/api/auth/complete-onboarding', 'POST', {});
        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          window.location.href = result.redirectTo || '/feed';
          return;
        }
      }

      setStep(step + 1);
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const canGoBack = step > 0 && step < 4;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {step > 0 && step < 4 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-dracula-comment">
            <span>
              Paso {step} de {totalSteps - 2}
            </span>
            <span>{Math.round((step / (totalSteps - 2)) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-dracula-current">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isLeader ? 'bg-leader' : 'bg-entrepreneur'}`}
              style={{ width: `${(step / (totalSteps - 2)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}

      <div className="glass rounded-xl p-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isLeader ? 'bg-leader/20' : 'bg-entrepreneur/20'}`}
            >
              {isLeader ? (
                <Trophy size={40} className="text-leader" weight="duotone" />
              ) : (
                <Storefront size={40} className="text-entrepreneur" weight="duotone" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white">Bienvenido, {initialData.name || ''}!</h1>
            <p className="mx-auto max-w-md text-dracula-fg/80">
              Solo faltan unos detalles para completar tu perfil.
              {isLeader
                ? ' Sube tu foto, elige tus categorias y crea tu primera causa.'
                : ' Sube tu foto, agrega tu contacto y publica tu primer producto.'}
            </p>
            <button
              onClick={() => setStep(1)}
              className={`rounded-xl px-8 py-3 font-bold text-dracula-bg transition-all hover:brightness-110 ${isLeader ? 'bg-leader' : 'bg-entrepreneur'}`}
            >
              Empecemos <ArrowRight size={18} className="ml-1 inline" />
            </button>
          </div>
        )}

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="mb-2 flex items-center gap-3">
              <Camera size={24} className={isLeader ? 'text-leader' : 'text-entrepreneur'} />
              <h2 className="text-xl font-bold text-white">Tu Foto de Perfil</h2>
            </div>
            <p className="text-sm text-dracula-comment">
              Una buena foto genera confianza. Sube una imagen tuya o de tu{' '}
              {isLeader ? 'comunidad' : 'tienda'}.
            </p>

            <ImageUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              shape="circle"
              size="lg"
              label=""
              accentColor={isLeader ? 'leader' : 'entrepreneur'}
            />

            <p className="text-center text-xs text-dracula-comment">
              JPG, PNG o WebP. Maximo 5MB. Puedes saltar este paso.
            </p>
          </div>
        )}

        {/* Step 2: Tags (Leader) / Contact (Entrepreneur) */}
        {step === 2 && (
          <div className="space-y-6">
            {isLeader ? (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <Tag size={24} className="text-leader" />
                  <h2 className="text-xl font-bold text-white">Tus Categorias</h2>
                </div>
                <p className="text-sm text-dracula-comment">
                  Selecciona las que describen tu enfoque social:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(LEADER_TAGS).map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedTags(
                            isSelected
                              ? selectedTags.filter((t) => t !== tag.id)
                              : [...selectedTags, tag.id],
                          );
                        }}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-leader bg-leader/20 text-leader'
                            : 'border-dracula-current bg-dracula-current/30 text-dracula-comment hover:border-dracula-fg/30'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-dracula-green">
                    {selectedTags.length} seleccionada(s)
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <Sparkle size={24} className="text-entrepreneur" />
                  <h2 className="text-xl font-bold text-white">Canales de Contacto</h2>
                </div>
                <p className="text-sm text-dracula-comment">
                  Asi te contactaran los compradores. El WhatsApp es el mas importante.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-dracula-fg">
                      WhatsApp <span className="text-dracula-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactWhatsapp}
                      onChange={(e) => setContactWhatsapp(e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={contactInstagram}
                        onChange={(e) => setContactInstagram(e.target.value)}
                        placeholder="@tu_tienda"
                        className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={contactFacebook}
                        onChange={(e) => setContactFacebook(e.target.value)}
                        placeholder="facebook.com/tu_tienda"
                        className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Create Cause (Leader) / Create Product (Entrepreneur) */}
        {step === 3 && (
          <div className="space-y-6">
            {isLeader ? (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <Trophy size={24} className="text-leader" />
                  <h2 className="text-xl font-bold text-white">Crea tu Primera Causa</h2>
                </div>
                <p className="text-sm text-dracula-comment">
                  Los emprendedores vincularan sus productos a tu causa.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-dracula-fg">
                      Titulo de la Causa
                    </label>
                    <input
                      type="text"
                      value={causeTitle}
                      onChange={(e) => setCauseTitle(e.target.value)}
                      placeholder="Ej. Comedor Comunitario La Esperanza"
                      className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-dracula-fg">
                      Descripcion
                    </label>
                    <textarea
                      value={causeDescription}
                      onChange={(e) => setCauseDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe el impacto que tendra esta causa..."
                      className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">
                        Meta (COP)
                      </label>
                      <input
                        type="number"
                        value={causeGoal}
                        onChange={(e) => setCauseGoal(e.target.value)}
                        placeholder="5000000"
                        min="100000"
                        className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        value={causePhoto}
                        onChange={setCausePhoto}
                        shape="rect"
                        size="md"
                        label="Foto de la Causa"
                        accentColor="leader"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <ShoppingBag size={24} className="text-entrepreneur" />
                  <h2 className="text-xl font-bold text-white">Crea tu Primer Producto</h2>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-dracula-purple">
                    Vincula a una Causa
                  </label>
                  {availableCauses.length > 0 ? (
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {availableCauses.map((cause) => (
                        <button
                          key={cause.id}
                          type="button"
                          onClick={() => setSelectedCauseId(cause.id)}
                          className={`w-full rounded-lg border p-3 text-left transition-all ${
                            selectedCauseId === cause.id
                              ? 'border-leader bg-leader/10'
                              : 'border-dracula-current bg-dracula-bg/50 hover:border-dracula-fg/30'
                          }`}
                        >
                          <p className="text-sm font-medium text-white">{cause.title}</p>
                          <p className="text-xs text-dracula-comment">{cause.leader_name}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-dracula-bg/50 p-3 text-sm text-dracula-comment">
                      No hay causas activas disponibles aun.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">Nombre</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ej. Bolso Tejido"
                        className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">
                        Precio (COP)
                      </label>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="50000"
                        min="1000"
                        className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-dracula-fg">
                      Descripcion
                    </label>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={2}
                      placeholder="Describe tu producto..."
                      className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-dracula-fg">
                        Contribucion
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          min="1"
                          className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
                        />
                        <select
                          value={contributionType}
                          onChange={(e) => setContributionType(e.target.value)}
                          className="appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-3 py-3 text-sm text-white"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <ImageUpload
                        value={productPhoto}
                        onChange={setProductPhoto}
                        shape="rect"
                        size="md"
                        label="Foto del Producto"
                        accentColor="entrepreneur"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Celebration */}
        {step === 4 && (
          <div className="space-y-6 py-4 text-center">
            <Confetti size={64} className="mx-auto text-dracula-yellow" weight="duotone" />
            <h2 className="text-3xl font-bold text-white">Tu perfil esta listo!</h2>
            <p className="mx-auto max-w-md text-dracula-fg/80">
              {isLeader
                ? `Creaste tu causa "${createdItemName}". Los emprendedores ahora pueden vincular productos a ella.`
                : `Agregaste tu producto "${createdItemName}". Cada venta contribuira a la causa que elegiste.`}
            </p>
            <div className="flex items-center justify-center gap-3 text-dracula-green">
              <CheckCircle size={20} weight="fill" />
              <span className="font-medium">Perfil completo</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step > 0 && (
          <div className="mt-8 flex justify-between border-t border-dracula-current/50 pt-4">
            {canGoBack ? (
              <button
                onClick={() => {
                  setError('');
                  setStep(step - 1);
                }}
                className="flex items-center gap-2 px-4 py-2 text-dracula-comment transition-colors hover:text-white"
              >
                <ArrowLeft size={18} /> Atras
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-dracula-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${
                isLeader ? 'bg-leader' : 'bg-entrepreneur'
              }`}
            >
              {loading ? (
                <>
                  <CircleNotch size={18} className="animate-spin" /> Guardando...
                </>
              ) : step === 4 ? (
                <>Ir al Feed</>
              ) : step === 3 ? (
                <>{isLeader ? 'Crear Causa' : 'Crear Producto'}</>
              ) : step === 1 ? (
                <>
                  {photoUrl ? 'Siguiente' : 'Saltar'} <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Siguiente <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
