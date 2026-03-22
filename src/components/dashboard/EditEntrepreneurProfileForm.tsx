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
  Globe,
} from '@phosphor-icons/react';
import colombiaData from '../../data/colombia.json';

interface EditEntrepreneurProfileFormProps {
  profileId: number;
  initialData: {
    store_name: string;
    bio: string;
    photo_url: string;
    department: string;
    city: string;
    contact_info: string;
  };
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

  const [storeName, setStoreName] = useState(initialData.store_name || '');
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
  const [website, setWebsite] = useState(parsedContact.website || '');
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
          department,
          city,
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
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            Nombre de la Tienda
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Foto (URL)</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">Descripcion</label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
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
            className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur"
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
            className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none focus:border-entrepreneur disabled:opacity-50"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
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
              className="flex-1 rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2.5 text-sm text-white outline-none focus:border-entrepreneur"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dracula-current/50 bg-dracula-bg/50 p-4">
        <p className="mb-1 text-xs text-dracula-comment">Tu tienda publica:</p>
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
