import { useState, useEffect } from 'react';
import {
  Storefront,
  Heart,
  MapPin,
  Info,
  ShareNetwork,
  CaretDown,
  Envelope,
  Globe,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  XLogo,
  TiktokLogo,
  ThreadsLogo,
  CircleNotch,
  CheckCircle,
} from '@phosphor-icons/react';
import ImageUpload from '../ImageUpload';
import colombiaData from '../../data/colombia.json';

interface EditEntrepreneurProfileFormProps {
  profileId: number;
  initialData: {
    store_name: string;
    bio: string;
    photo_url: string;
    cover_url: string;
    logo_url: string;
    department: string;
    city: string;
    contact_info: string;
    store_story: string;
    what_makes_special: string;
    social_connection: string;
    years_in_business: number | null;
    email: string;
    preferred_contact: string;
    store_policies: string;
    shipping_info: string;
  };
}

function Section({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-dracula-darker/50 overflow-hidden rounded-xl border border-dracula-current/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-dracula-current/20"
      >
        {icon}
        <span className="flex-1 font-bold text-dracula-fg">{title}</span>
        <CaretDown
          size={18}
          className={`text-dracula-comment transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="space-y-4 px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function EditEntrepreneurProfileForm({
  profileId,
  initialData,
}: EditEntrepreneurProfileFormProps) {
  const parsedContact = (() => {
    try {
      return JSON.parse(initialData.contact_info || '{}');
    } catch {
      return {};
    }
  })();

  // Section 1: Tu Tienda
  const [storeName, setStoreName] = useState(initialData.store_name || '');
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(initialData.cover_url || '');

  // Section 2: Tu Historia
  const [bio, setBio] = useState(initialData.bio || '');
  const [storeStory, setStoreStory] = useState(initialData.store_story || '');
  const [whatMakesSpecial, setWhatMakesSpecial] = useState(initialData.what_makes_special || '');
  const [socialConnection, setSocialConnection] = useState(initialData.social_connection || '');

  // Section 3: Ubicación
  const [department, setDepartment] = useState(initialData.department || '');
  const [city, setCity] = useState(initialData.city || '');
  const [citiesList, setCitiesList] = useState<string[]>([]);

  // Section 4: Información de tu Tienda
  const [yearsInBusiness, setYearsInBusiness] = useState<number | null>(
    initialData.years_in_business,
  );
  const [storePolicies, setStorePolicies] = useState(initialData.store_policies || '');
  const [shippingInfo, setShippingInfo] = useState(initialData.shipping_info || '');

  // Section 5: Redes Sociales y Contacto
  const [whatsapp, setWhatsapp] = useState(parsedContact.whatsapp || '');
  const [instagram, setInstagram] = useState(parsedContact.instagram || '');
  const [facebook, setFacebook] = useState(parsedContact.facebook || '');
  const [xTwitter, setXTwitter] = useState(parsedContact.x || '');
  const [tiktok, setTiktok] = useState(parsedContact.tiktok || '');
  const [threads, setThreads] = useState(parsedContact.threads || '');
  const [website, setWebsite] = useState(parsedContact.website || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [preferredContact, setPreferredContact] = useState(initialData.preferred_contact || '');

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (department) {
      const depData = colombiaData.find((d) => d.departamento === department);
      setCitiesList(depData ? depData.ciudades : []);
    }
  }, [department]);

  useEffect(() => {
    if (initialData.department) {
      const depData = colombiaData.find((d) => d.departamento === initialData.department);
      setCitiesList(depData ? depData.ciudades : []);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/entrepreneurs/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_name: storeName,
          bio,
          photo_url: photoUrl || null,
          cover_url: coverUrl || null,
          logo_url: logoUrl || null,
          department,
          city,
          store_story: storeStory,
          what_makes_special: whatMakesSpecial,
          social_connection: socialConnection,
          years_in_business: yearsInBusiness,
          email: email || null,
          preferred_contact: preferredContact || null,
          store_policies: storePolicies,
          shipping_info: shippingInfo,
          contact_info: {
            whatsapp: whatsapp || undefined,
            instagram: instagram || undefined,
            facebook: facebook || undefined,
            x: xTwitter || undefined,
            threads: threads || undefined,
            tiktok: tiktok || undefined,
            website: website || undefined,
          },
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
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur';
  const textareaClass =
    'w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur resize-none';
  const selectClass =
    'w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur';
  const socialInputClass =
    'flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur';
  const helperClass = 'mt-1 text-xs text-dracula-comment italic';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-3 text-sm text-dracula-red">
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-dracula-green/50 bg-dracula-green/20 p-3 text-sm text-dracula-green">
          <CheckCircle size={18} weight="fill" /> Perfil actualizado
        </div>
      )}

      {/* Section 1: Tu Tienda */}
      <Section
        icon={<Storefront size={20} className="text-entrepreneur" />}
        title="Tu Tienda"
        defaultOpen
      >
        <div className="grid gap-6 md:grid-cols-3">
          <ImageUpload
            value={photoUrl}
            onChange={setPhotoUrl}
            shape="rect"
            size="lg"
            label="Foto principal de tu tienda"
            accentColor="entrepreneur"
          />
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            shape="circle"
            size="md"
            label="Logo de tu tienda"
            accentColor="entrepreneur"
          />
          <ImageUpload
            value={coverUrl}
            onChange={setCoverUrl}
            shape="rect"
            size="lg"
            label="Foto de portada"
            accentColor="entrepreneur"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Nombre de la Tienda
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className={inputClass}
          />
        </div>
      </Section>

      {/* Section 2: Tu Historia */}
      <Section
        icon={<Heart size={20} className="text-entrepreneur" />}
        title="Tu Historia"
        defaultOpen
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>Describe tu tienda en pocas palabras.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Historia de tu Emprendimiento
          </label>
          <textarea
            rows={4}
            value={storeStory}
            onChange={(e) => setStoreStory(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>
            Cuenta cómo nació tu emprendimiento. La gente conecta con historias reales.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Qué Hace Especiales tus Productos
          </label>
          <textarea
            rows={3}
            value={whatMakesSpecial}
            onChange={(e) => setWhatMakesSpecial(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>¿Qué hace únicos tus productos? ¿Qué los diferencia?</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Conexión Social</label>
          <textarea
            rows={3}
            value={socialConnection}
            onChange={(e) => setSocialConnection(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>
            ¿Cómo conecta tu negocio con las causas sociales? Esto inspira a tus clientes.
          </p>
        </div>
      </Section>

      {/* Section 3: Ubicación */}
      <Section
        icon={<MapPin size={20} className="text-entrepreneur" />}
        title="Ubicación"
        defaultOpen
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Departamento</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecciona...</option>
              {colombiaData.map((d) => (
                <option key={d.id} value={d.departamento}>
                  {d.departamento}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Ciudad</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!department}
              className={`${selectClass} disabled:opacity-50`}
            >
              <option value="">Selecciona...</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Section 4: Información de tu Tienda */}
      <Section
        icon={<Info size={20} className="text-entrepreneur" />}
        title="Información de tu Tienda"
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Años en el Negocio</label>
          <input
            type="number"
            min={0}
            value={yearsInBusiness ?? ''}
            onChange={(e) =>
              setYearsInBusiness(e.target.value ? parseInt(e.target.value, 10) : null)
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Políticas de la Tienda
          </label>
          <textarea
            rows={3}
            value={storePolicies}
            onChange={(e) => setStorePolicies(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>Políticas de cambio, devolución, garantía...</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Información de Envío
          </label>
          <textarea
            rows={3}
            value={shippingInfo}
            onChange={(e) => setShippingInfo(e.target.value)}
            className={textareaClass}
          />
          <p className={helperClass}>¿Haces envíos? ¿Cuáles son tus tiempos y costos?</p>
        </div>
      </Section>

      {/* Section 5: Redes Sociales y Contacto */}
      <Section
        icon={<ShareNetwork size={20} className="text-entrepreneur" />}
        title="Redes Sociales y Contacto"
      >
        <div className="space-y-3">
          {/* WhatsApp */}
          <div className="flex items-center gap-3">
            <WhatsappLogo size={20} className="shrink-0 text-[#25D366]" />
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+57 300 123 4567"
              className={socialInputClass}
            />
          </div>
          {/* Instagram */}
          <div className="flex items-center gap-3">
            <InstagramLogo size={20} className="shrink-0 text-[#E4405F]" />
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@tucuenta"
              className={socialInputClass}
            />
          </div>
          {/* Facebook */}
          <div className="flex items-center gap-3">
            <FacebookLogo size={20} className="shrink-0 text-[#1877F2]" />
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="facebook.com/tupagina"
              className={socialInputClass}
            />
          </div>
          {/* X (Twitter) */}
          <div className="flex items-center gap-3">
            <XLogo size={20} className="shrink-0 text-white" />
            <input
              type="text"
              value={xTwitter}
              onChange={(e) => setXTwitter(e.target.value)}
              placeholder="@tucuenta"
              className={socialInputClass}
            />
          </div>
          {/* TikTok */}
          <div className="flex items-center gap-3">
            <TiktokLogo size={20} className="shrink-0 text-white" />
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@tucuenta"
              className={socialInputClass}
            />
          </div>
          {/* Threads */}
          <div className="flex items-center gap-3">
            <ThreadsLogo size={20} className="shrink-0 text-white" />
            <input
              type="text"
              value={threads}
              onChange={(e) => setThreads(e.target.value)}
              placeholder="@tucuenta"
              className={socialInputClass}
            />
          </div>
          {/* Website */}
          <div className="flex items-center gap-3">
            <Globe size={20} className="shrink-0 text-dracula-purple" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className={socialInputClass}
            />
          </div>
          {/* Email */}
          <div className="flex items-center gap-3">
            <Envelope size={20} className="shrink-0 text-dracula-cyan" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={socialInputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Método de Contacto Preferido
          </label>
          <select
            value={preferredContact}
            onChange={(e) => setPreferredContact(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="email">Email</option>
            <option value="website">Sitio Web</option>
          </select>
        </div>
      </Section>

      {/* Public profile link */}
      <div className="rounded-lg border border-dracula-current/50 bg-dracula-bg/50 p-4">
        <p className="mb-1 text-xs text-dracula-comment">Tu tienda pública:</p>
        <a
          href={`/entrepreneurs/${profileId}`}
          className="text-sm text-entrepreneur hover:underline"
        >
          comoon.co/entrepreneurs/{profileId}
        </a>
      </div>

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
