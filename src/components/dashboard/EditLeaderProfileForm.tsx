import { useState, useEffect } from 'react';
import {
  CircleNotch,
  CheckCircle,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  XLogo,
  TiktokLogo,
  ThreadsLogo,
  Heart,
  Users,
  MapPin,
  Trophy,
  Quotes,
  Images,
  ShareNetwork,
  Tag,
  CaretDown,
  Envelope,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import { LEADER_TAGS } from '../LeaderTagBadge';
import ImageUpload from '../ImageUpload';
import colombiaData from '../../data/colombia.json';

interface Achievement {
  title: string;
  description: string;
  year: number | '';
}

interface Award {
  title: string;
  year: number | '';
  organization: string;
}

interface Testimonial {
  name: string;
  text: string;
  photo: string;
}

interface EditLeaderProfileFormProps {
  profileId: number;
  initialData: {
    name: string;
    bio: string;
    photo_url: string;
    cover_url: string;
    department: string;
    city: string;
    contact_info: string;
    tags: string;
    organization_name: string;
    who_we_are: string;
    our_why: string;
    how_to_help: string;
    years_active: number | null;
    impact_scope: string;
    community: string;
    areas_of_influence: string;
    people_impacted: number | null;
    achievements: string;
    testimonials: string;
    media_gallery: string;
    awards: string;
    email: string;
    preferred_contact: string;
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

function safeParseObject(json: string | undefined | null): Record<string, string> {
  try {
    return JSON.parse(json || '{}');
  } catch {
    return {};
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

export default function EditLeaderProfileForm({
  profileId,
  initialData,
}: EditLeaderProfileFormProps) {
  const parsedContact = safeParseObject(initialData.contact_info);
  const parsedTags: string[] = safeParseArray<string>(initialData.tags);

  // Section 1 - Identity
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');
  const [coverUrl, setCoverUrl] = useState(initialData.cover_url || '');
  const [name, setName] = useState(initialData.name || '');
  const [organizationName, setOrganizationName] = useState(initialData.organization_name || '');

  // Section 2 - Story
  const [whoWeAre, setWhoWeAre] = useState(initialData.who_we_are || '');
  const [ourWhy, setOurWhy] = useState(initialData.our_why || '');
  const [howToHelp, setHowToHelp] = useState(initialData.how_to_help || '');

  // Section 3 - Location
  const [department, setDepartment] = useState(initialData.department || '');
  const [city, setCity] = useState(initialData.city || '');
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [community, setCommunity] = useState(initialData.community || '');
  const [impactScope, setImpactScope] = useState(initialData.impact_scope || '');
  const [yearsActive, setYearsActive] = useState<number | ''>(initialData.years_active ?? '');

  // Section 4 - Impact
  const [peopleImpacted, setPeopleImpacted] = useState<number | ''>(
    initialData.people_impacted ?? '',
  );
  const [achievements, setAchievements] = useState<Achievement[]>(
    safeParseArray<Achievement>(initialData.achievements),
  );
  const [awards, setAwards] = useState<Award[]>(safeParseArray<Award>(initialData.awards));

  // Section 5 - Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    safeParseArray<Testimonial>(initialData.testimonials),
  );

  // Section 6 - Gallery
  const [mediaGallery, setMediaGallery] = useState<string[]>(
    safeParseArray<string>(initialData.media_gallery),
  );

  // Section 7 - Contact
  const [whatsapp, setWhatsapp] = useState(parsedContact.whatsapp || '');
  const [instagram, setInstagram] = useState(parsedContact.instagram || '');
  const [facebook, setFacebook] = useState(parsedContact.facebook || '');
  const [xTwitter, setXTwitter] = useState(parsedContact.x || '');
  const [threads, setThreads] = useState(parsedContact.threads || '');
  const [tiktok, setTiktok] = useState(parsedContact.tiktok || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [preferredContact, setPreferredContact] = useState(initialData.preferred_contact || '');

  // Section 8 - Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(parsedTags);

  // UI state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: true,
    story: true,
    location: true,
    impact: false,
    testimonials: false,
    gallery: false,
    contact: false,
    tags: false,
  });
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

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic list helpers
  const addAchievement = () =>
    setAchievements((prev) => [...prev, { title: '', description: '', year: '' }]);
  const removeAchievement = (i: number) =>
    setAchievements((prev) => prev.filter((_, idx) => idx !== i));
  const updateAchievement = (i: number, field: keyof Achievement, value: string | number) =>
    setAchievements((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const addAward = () => setAwards((prev) => [...prev, { title: '', year: '', organization: '' }]);
  const removeAward = (i: number) => setAwards((prev) => prev.filter((_, idx) => idx !== i));
  const updateAward = (i: number, field: keyof Award, value: string | number) =>
    setAwards((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const addTestimonial = () =>
    setTestimonials((prev) => [...prev, { name: '', text: '', photo: '' }]);
  const removeTestimonial = (i: number) =>
    setTestimonials((prev) => prev.filter((_, idx) => idx !== i));
  const updateTestimonial = (i: number, field: keyof Testimonial, value: string) =>
    setTestimonials((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));

  const addGalleryPhoto = () => {
    if (mediaGallery.length < 6) setMediaGallery((prev) => [...prev, '']);
  };
  const removeGalleryPhoto = (i: number) =>
    setMediaGallery((prev) => prev.filter((_, idx) => idx !== i));
  const updateGalleryPhoto = (i: number, url: string) =>
    setMediaGallery((prev) => prev.map((p, idx) => (idx === i ? url : p)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/leaders/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio: whoWeAre,
          photo_url: photoUrl || null,
          cover_url: coverUrl || null,
          department,
          city,
          contact_info: { whatsapp, instagram, facebook, x: xTwitter, threads, tiktok },
          tags: selectedTags,
          organization_name: organizationName,
          who_we_are: whoWeAre,
          our_why: ourWhy,
          how_to_help: howToHelp,
          years_active: yearsActive === '' ? null : yearsActive,
          impact_scope: impactScope,
          community,
          areas_of_influence: initialData.areas_of_influence,
          people_impacted: peopleImpacted === '' ? null : peopleImpacted,
          achievements,
          testimonials,
          media_gallery: mediaGallery,
          awards,
          email,
          preferred_contact: preferredContact,
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
          <CheckCircle size={18} weight="fill" /> Perfil actualizado
        </div>
      )}

      {/* Section 1: Tu Identidad */}
      <CollapsibleSection
        title="Tu Identidad"
        icon={<Heart size={22} className="text-leader" />}
        isOpen={openSections.identity}
        onToggle={() => toggleSection('identity')}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            value={photoUrl}
            onChange={setPhotoUrl}
            shape="circle"
            size="lg"
            label="Tu foto de perfil"
            accentColor="leader"
          />
          <ImageUpload
            value={coverUrl}
            onChange={setCoverUrl}
            shape="rect"
            size="lg"
            label="Foto de portada"
            accentColor="leader"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">
              Nombre de la Organizacion
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Nombre de tu organizacion o colectivo"
              className={inputClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Tu Historia */}
      <CollapsibleSection
        title="Tu Historia"
        icon={<Users size={22} className="text-leader" />}
        isOpen={openSections.story}
        onToggle={() => toggleSection('story')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Quienes somos</label>
          <p className="mb-2 text-sm italic text-dracula-comment">
            Cuenta la historia de tu comunidad o colectivo. Las personas que lean esto quieren
            conocer tu corazon.
          </p>
          <textarea
            rows={4}
            value={whoWeAre}
            onChange={(e) => setWhoWeAre(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Por que hacemos lo que hacemos
          </label>
          <p className="mb-2 text-sm italic text-dracula-comment">
            Comparte tu motivacion. Que te mueve cada dia a trabajar por los demas?
          </p>
          <textarea
            rows={4}
            value={ourWhy}
            onChange={(e) => setOurWhy(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Con que nos puedes ayudar
          </label>
          <p className="mb-2 text-sm italic text-dracula-comment">
            Se especifico. Cuando la gente sabe como ayudar, actua.
          </p>
          <textarea
            rows={4}
            value={howToHelp}
            onChange={(e) => setHowToHelp(e.target.value)}
            className={inputClass}
          />
        </div>
      </CollapsibleSection>

      {/* Section 3: Ubicación y Alcance */}
      <CollapsibleSection
        title="Ubicación y Alcance"
        icon={<MapPin size={22} className="text-leader" />}
        isOpen={openSections.location}
        onToggle={() => toggleSection('location')}
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
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Comunidad / Barrio</label>
          <input
            type="text"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            placeholder="Ej: Barrio El Poblado, Vereda La Esperanza"
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">
              Alcance de impacto
            </label>
            <select
              value={impactScope}
              onChange={(e) => setImpactScope(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecciona...</option>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
              <option value="nacional">Nacional</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-dracula-fg">Años activos</label>
            <input
              type="number"
              min={0}
              value={yearsActive}
              onChange={(e) => setYearsActive(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 5"
              className={inputClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4: Impacto y Logros */}
      <CollapsibleSection
        title="Impacto y Logros"
        icon={<Trophy size={22} className="text-leader" />}
        isOpen={openSections.impact}
        onToggle={() => toggleSection('impact')}
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Personas / familias impactadas
          </label>
          <input
            type="number"
            min={0}
            value={peopleImpacted}
            onChange={(e) => setPeopleImpacted(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ej: 500"
            className={inputClass}
          />
        </div>

        {/* Achievements */}
        <div>
          <label className="mb-3 block text-sm font-bold text-dracula-fg">Logros</label>
          <div className="space-y-3">
            {achievements.map((ach, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-dracula-current bg-dracula-bg/50 p-4"
              >
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={ach.title}
                    onChange={(e) => updateAchievement(i, 'title', e.target.value)}
                    placeholder="Título del logro"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={ach.year}
                    onChange={(e) =>
                      updateAchievement(
                        i,
                        'year',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    placeholder="Ano"
                    className={`${inputClass} md:w-28`}
                  />
                </div>
                <textarea
                  rows={2}
                  value={ach.description}
                  onChange={(e) => updateAchievement(i, 'description', e.target.value)}
                  placeholder="Descripción del logro"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(i)}
                  className="flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
                >
                  <Trash size={14} /> Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAchievement}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-leader hover:text-leader"
          >
            <Plus size={16} /> Agregar logro
          </button>
        </div>

        {/* Awards */}
        <div>
          <label className="mb-3 block text-sm font-bold text-dracula-fg">Reconocimientos</label>
          <div className="space-y-3">
            {awards.map((aw, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-dracula-current bg-dracula-bg/50 p-4"
              >
                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    type="text"
                    value={aw.title}
                    onChange={(e) => updateAward(i, 'title', e.target.value)}
                    placeholder="Título"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={aw.year}
                    onChange={(e) =>
                      updateAward(i, 'year', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Ano"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={aw.organization}
                    onChange={(e) => updateAward(i, 'organization', e.target.value)}
                    placeholder="Organizacion que otorga"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAward(i)}
                  className="flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
                >
                  <Trash size={14} /> Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAward}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-leader hover:text-leader"
          >
            <Plus size={16} /> Agregar reconocimiento
          </button>
        </div>
      </CollapsibleSection>

      {/* Section 5: Testimonios */}
      <CollapsibleSection
        title="Testimonios de tu Comunidad"
        icon={<Quotes size={22} className="text-leader" />}
        isOpen={openSections.testimonials}
        onToggle={() => toggleSection('testimonials')}
      >
        <p className="text-sm italic text-dracula-comment">
          Los testimonios de quienes han sido parte de tu trabajo son la mejor prueba de tu impacto.
        </p>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-dracula-current bg-dracula-bg/50 p-4"
            >
              <div className="flex items-start gap-4">
                <ImageUpload
                  value={t.photo}
                  onChange={(url) => updateTestimonial(i, 'photo', url)}
                  shape="circle"
                  size="sm"
                  label=""
                  accentColor="leader"
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTestimonial(i, 'name', e.target.value)}
                    placeholder="Nombre de la persona"
                    className={inputClass}
                  />
                  <textarea
                    rows={3}
                    value={t.text}
                    onChange={(e) => updateTestimonial(i, 'text', e.target.value)}
                    placeholder="Testimonio"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTestimonial(i)}
                className="flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
              >
                <Trash size={14} /> Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTestimonial}
          className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-leader hover:text-leader"
        >
          <Plus size={16} /> Agregar testimonio
        </button>
      </CollapsibleSection>

      {/* Section 6: Galeria */}
      <CollapsibleSection
        title="Galeria de Fotos"
        icon={<Images size={22} className="text-leader" />}
        isOpen={openSections.gallery}
        onToggle={() => toggleSection('gallery')}
      >
        <p className="text-sm italic text-dracula-comment">
          Muestra tu trabajo. Las fotos cuentan historias que las palabras no pueden.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {mediaGallery.map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                value={url}
                onChange={(newUrl) => updateGalleryPhoto(i, newUrl)}
                shape="rect"
                size="md"
                label=""
                accentColor="leader"
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
        {mediaGallery.length < 6 && (
          <button
            type="button"
            onClick={addGalleryPhoto}
            className="flex items-center gap-2 rounded-lg border border-dashed border-dracula-current px-4 py-2.5 text-sm text-dracula-comment transition-colors hover:border-leader hover:text-leader"
          >
            <Plus size={16} /> Agregar foto ({mediaGallery.length}/6)
          </button>
        )}
      </CollapsibleSection>

      {/* Section 7: Redes Sociales y Contacto */}
      <CollapsibleSection
        title="Redes Sociales y Contacto"
        icon={<ShareNetwork size={22} className="text-leader" />}
        isOpen={openSections.contact}
        onToggle={() => toggleSection('contact')}
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
            />
          </div>
          {/* Email */}
          <div className="flex items-center gap-3">
            <Envelope size={20} className="shrink-0 text-dracula-purple" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-leader"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Metodo de contacto preferido
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
            <option value="telefono">Telefono</option>
          </select>
        </div>
      </CollapsibleSection>

      {/* Section 8: Etiquetas */}
      <CollapsibleSection
        title="Etiquetas"
        icon={<Tag size={22} className="text-leader" />}
        isOpen={openSections.tags}
        onToggle={() => toggleSection('tags')}
      >
        <div className="flex flex-wrap gap-2">
          {Object.values(LEADER_TAGS).map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTags(
                    isSelected
                      ? selectedTags.filter((t) => t !== tag.id)
                      : [...selectedTags, tag.id],
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
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
