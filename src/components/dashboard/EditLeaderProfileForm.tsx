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
} from '@phosphor-icons/react';
import { LEADER_TAGS } from '../LeaderTagBadge';
import colombiaData from '../../data/colombia.json';

interface EditLeaderProfileFormProps {
  profileId: number;
  initialData: {
    name: string;
    bio: string;
    photo_url: string;
    department: string;
    city: string;
    contact_info: string;
    tags: string;
  };
}

export default function EditLeaderProfileForm({
  profileId,
  initialData,
}: EditLeaderProfileFormProps) {
  const parsedContact = (() => {
    try {
      return JSON.parse(initialData.contact_info || '{}');
    } catch {
      return {};
    }
  })();
  const parsedTags: string[] = (() => {
    try {
      return JSON.parse(initialData.tags || '[]');
    } catch {
      return [];
    }
  })();

  const [name, setName] = useState(initialData.name || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');
  const [department, setDepartment] = useState(initialData.department || '');
  const [city, setCity] = useState(initialData.city || '');
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [whatsapp, setWhatsapp] = useState(parsedContact.whatsapp || '');
  const [instagram, setInstagram] = useState(parsedContact.instagram || '');
  const [facebook, setFacebook] = useState(parsedContact.facebook || '');
  const [xTwitter, setXTwitter] = useState(parsedContact.x || '');
  const [threads, setThreads] = useState(parsedContact.threads || '');
  const [tiktok, setTiktok] = useState(parsedContact.tiktok || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(parsedTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (department) {
      const depData = colombiaData.find((d) => d.departamento === department);
      setCitiesList(depData ? depData.ciudades : []);
    }
  }, [department]);

  // Initialize cities list on mount
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
      const res = await fetch(`/api/leaders/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio,
          photo_url: photoUrl || null,
          department,
          city,
          contact_info: { whatsapp, instagram, facebook, x: xTwitter, threads, tiktok },
          tags: selectedTags,
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Nombre Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Foto de Perfil (URL)
          </label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Biografia</label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
        />
        <p
          className={`mt-1 text-xs ${bio.length >= 50 ? 'text-dracula-green' : 'text-dracula-comment'}`}
        >
          {bio.length}/50 caracteres minimos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Departamento</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader"
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
            className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-leader disabled:opacity-50"
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
        <label className="mb-3 block text-sm font-bold text-dracula-fg">
          Redes Sociales y Contacto
        </label>
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
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Etiquetas</label>
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
      </div>

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
