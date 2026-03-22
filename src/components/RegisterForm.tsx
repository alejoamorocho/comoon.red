import { useState, useEffect } from 'react';
import {
  UsersThree,
  Storefront,
  MapPin,
  CheckCircle,
  Eye,
  EyeSlash,
  Lock,
  Warning,
  CircleNotch,
} from '@phosphor-icons/react';
import colombiaData from '../data/colombia.json';

interface City {
  id: number;
  departamento: string;
  ciudades: string[];
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  userId?: number;
  error?: string;
}

export default function RegisterForm() {
  const [role, setRole] = useState<'leader' | 'entrepreneur'>('leader');
  const [department, setDepartment] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  useEffect(() => {
    if (department) {
      const depData = colombiaData.find((d) => d.departamento === department);
      setCitiesList(depData ? depData.ciudades : []);
      setCity('');
    }
  }, [department]);

  // Password validation
  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordError('Las contrasenas no coinciden');
    } else if (formData.password && formData.password.length < 8) {
      setPasswordError('La contrasena debe tener al menos 8 caracteres');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contrasenas no coinciden');
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role,
          name: formData.name,
          storeName: role === 'entrepreneur' ? formData.name : undefined,
          location: city ? `${city}, ${department}` : department,
          bio: formData.bio,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (data.success) {
        // Auto-login after successful registration
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });
          const loginData = await loginRes.json();

          if (loginData.success && loginData.user) {
            localStorage.setItem('user', JSON.stringify(loginData.user));
            if (loginData.token) localStorage.setItem('token', loginData.token);
            if (loginData.refreshToken)
              localStorage.setItem('refreshToken', loginData.refreshToken);
            window.location.href = '/onboarding';
            return;
          }
        } catch {
          // Auto-login failed, show success screen instead
        }
        setSuccess(true);
      } else {
        setError(data.error || 'Error al registrar usuario');
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error de conexion. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 text-center">
        <CheckCircle size={64} className="mx-auto mb-4 text-dracula-green" weight="fill" />
        <h2 className="mb-2 text-3xl font-bold text-white">Registro Exitoso!</h2>
        <p className="mb-6 text-dracula-fg/80">
          Gracias por unirte a{' '}
          <span className="font-bold">
            <span className="text-white">co</span>
            <span className="text-comoon-purple">moon</span>
          </span>
          . Ya puedes iniciar sesion y gestionar tu perfil.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/"
            className="rounded-lg border border-dracula-current px-6 py-2 font-bold text-white transition-colors hover:border-white"
          >
            Inicio
          </a>
          <a
            href="/login"
            className="rounded-lg bg-dracula-purple px-6 py-2 font-bold text-dracula-bg transition-colors hover:bg-white"
          >
            Iniciar Sesion
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-4">
          <Warning size={24} className="shrink-0 text-dracula-red" />
          <p className="text-sm font-medium text-dracula-red">{error}</p>
        </div>
      )}

      {/* Role Selection */}
      <div className="mb-8 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Selecciona tu rol">
        <button
          type="button"
          role="radio"
          aria-checked={role === 'leader'}
          aria-label="Soy Lider"
          onClick={() => setRole('leader')}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            role === 'leader'
              ? 'border-leader bg-leader/20 text-white'
              : 'border-dracula-current bg-transparent text-dracula-comment hover:border-leader/50'
          }`}
        >
          <UsersThree size={28} weight={role === 'leader' ? 'fill' : 'duotone'} />
          <span className="text-sm font-bold">Soy Lider</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={role === 'entrepreneur'}
          aria-label="Soy Emprendedor"
          onClick={() => setRole('entrepreneur')}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            role === 'entrepreneur'
              ? 'border-entrepreneur bg-entrepreneur/20 text-white'
              : 'border-dracula-current bg-transparent text-dracula-comment hover:border-entrepreneur/50'
          }`}
        >
          <Storefront size={28} weight={role === 'entrepreneur' ? 'fill' : 'duotone'} />
          <span className="text-sm font-bold">Soy Emprendedor</span>
        </button>
      </div>

      {/* Name and Email */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            {role === 'leader' ? 'Nombre Completo' : 'Nombre de la Tienda'}
          </label>
          <input
            type="text"
            required
            disabled={loading}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
            placeholder={role === 'leader' ? 'Ej. Maria Perez' : 'Ej. Artesanias del Valle'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Correo Electronico</label>
          <input
            type="email"
            required
            disabled={loading}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
            placeholder="hola@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            <Lock size={16} className="mr-1 inline" />
            Contrasena
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              disabled={loading}
              className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2 pr-10 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment transition-colors hover:text-white"
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">
            <Lock size={16} className="mr-1 inline" />
            Confirmar Contrasena
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              disabled={loading}
              className={`w-full rounded-lg border bg-dracula-bg px-4 py-2 pr-10 text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50 ${
                passwordError
                  ? 'border-dracula-red focus:border-dracula-red'
                  : 'border-dracula-current focus:border-dracula-purple'
              }`}
              placeholder="Repite tu contrasena"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment transition-colors hover:text-white"
            >
              {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Password Error Message */}
      {passwordError && (
        <p className="-mt-2 text-sm font-medium text-dracula-red">{passwordError}</p>
      )}

      {/* Location Fields (Colombia Data) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Departamento</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              disabled={loading}
              className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg py-2 pl-10 pr-4 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
            >
              <option value="">Selecciona...</option>
              {colombiaData.map((d) => (
                <option key={d.id} value={d.departamento}>
                  {d.departamento}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-dracula-fg">Ciudad / Municipio</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={!department || loading}
              className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg py-2 pl-10 pr-4 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
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
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-dracula-fg">
          Biografia / Descripcion
        </label>
        <textarea
          rows={4}
          required
          disabled={loading}
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-2 text-white outline-none focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple disabled:opacity-50"
          placeholder={
            role === 'leader'
              ? 'Cuentanos sobre tu liderazgo y tu comunidad...'
              : 'Describe tu emprendimiento y que productos ofreces...'
          }
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading || !!passwordError}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dracula-green py-3 font-bold text-dracula-bg shadow-[0_0_20px_rgba(80,250,123,0.2)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <CircleNotch size={20} className="animate-spin" />
            Registrando...
          </>
        ) : role === 'leader' ? (
          'Registrarme como Lider'
        ) : (
          'Registrarme como Emprendedor'
        )}
      </button>

      <p className="text-center text-sm text-dracula-comment-accessible">
        Ya tienes cuenta?{' '}
        <a href="/login" className="font-medium text-dracula-purple hover:underline">
          Inicia Sesion
        </a>
      </p>
    </form>
  );
}
