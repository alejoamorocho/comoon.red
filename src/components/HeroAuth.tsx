import { useState, useEffect } from 'react';
import {
  UsersThree,
  Storefront,
  Eye,
  EyeSlash,
  SignIn,
  Warning,
  CircleNotch,
  ArrowRight,
} from '@phosphor-icons/react';
import colombiaData from '../data/colombia.json';

type Tab = 'login' | 'register';

export default function HeroAuth() {
  const [tab, setTab] = useState<Tab>('register');

  return (
    <div className="w-full max-w-md">
      {/* Tab switcher */}
      <div className="mb-1 flex overflow-hidden rounded-t-2xl border border-b-0 border-white/10">
        <button
          onClick={() => setTab('register')}
          className={`flex-1 py-3 text-sm font-bold transition-all ${
            tab === 'register'
              ? 'bg-dracula-current/80 text-white'
              : 'bg-dracula-current/20 text-dracula-comment hover:text-white'
          }`}
        >
          Crear Cuenta
        </button>
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-3 text-sm font-bold transition-all ${
            tab === 'login'
              ? 'bg-dracula-current/80 text-white'
              : 'bg-dracula-current/20 text-dracula-comment hover:text-white'
          }`}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* Form card */}
      <div className="glass rounded-b-2xl rounded-tl-none rounded-tr-none border border-t-0 border-white/10 p-6">
        {tab === 'login' ? <CompactLogin /> : <CompactRegister />}
      </div>
    </div>
  );
}

function CompactLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

        const redirectUrl =
          data.user?.onboardingComplete === false ? '/onboarding' : data.redirectTo || '/feed';
        window.location.href = redirectUrl;
      } else {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-dracula-red/50 bg-dracula-red/10 p-3">
          <Warning size={18} className="shrink-0 text-dracula-red" />
          <p className="text-xs text-dracula-red">{error}</p>
        </div>
      )}

      <div>
        <input
          type="email"
          required
          disabled={loading}
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          disabled={loading}
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 pr-10 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment transition-colors hover:text-white"
        >
          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-comoon-purple py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(153,134,191,0.4)] disabled:opacity-70"
      >
        {loading ? (
          <CircleNotch size={18} className="animate-spin" />
        ) : (
          <>
            <SignIn size={18} />
            Iniciar Sesión
          </>
        )}
      </button>
    </form>
  );
}

function CompactRegister() {
  const [role, setRole] = useState<'leader' | 'entrepreneur'>('leader');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (department) {
      const depData = colombiaData.find((d) => d.departamento === department);
      setCitiesList(depData ? depData.ciudades : []);
      setCity('');
    }
  }, [department]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
    } else if (password && password.length < 8) {
      setPasswordError('Mínimo 8 caracteres');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Mínimo 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          role,
          name,
          storeName: role === 'entrepreneur' ? name : undefined,
          location: city ? `${city}, ${department}` : department,
          bio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
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
          // fallback
        }
        window.location.href = '/login';
      } else {
        setError(data.error || 'Error al registrar');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-dracula-red/50 bg-dracula-red/10 p-3">
          <Warning size={18} className="shrink-0 text-dracula-red" />
          <p className="text-xs text-dracula-red">{error}</p>
        </div>
      )}

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole('leader')}
          className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold transition-all ${
            role === 'leader'
              ? 'border-leader bg-leader/15 text-leader'
              : 'border-dracula-current text-dracula-comment hover:border-leader/40'
          }`}
        >
          <UsersThree size={16} weight={role === 'leader' ? 'fill' : 'regular'} />
          Líder
        </button>
        <button
          type="button"
          onClick={() => setRole('entrepreneur')}
          className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold transition-all ${
            role === 'entrepreneur'
              ? 'border-entrepreneur bg-entrepreneur/15 text-entrepreneur'
              : 'border-dracula-current text-dracula-comment hover:border-entrepreneur/40'
          }`}
        >
          <Storefront size={16} weight={role === 'entrepreneur' ? 'fill' : 'regular'} />
          Emprendedor
        </button>
      </div>

      <input
        type="text"
        required
        disabled={loading}
        className="w-full rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
        placeholder={role === 'leader' ? 'Nombre completo' : 'Nombre de la tienda'}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        required
        disabled={loading}
        className="w-full rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            disabled={loading}
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 pr-9 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dracula-comment transition-colors hover:text-white"
          >
            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          disabled={loading}
          className={`w-full rounded-lg border bg-dracula-bg/80 px-4 py-2.5 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple ${
            passwordError ? 'border-dracula-red/50' : 'border-dracula-current'
          }`}
          placeholder="Confirmar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {passwordError && <p className="text-xs text-dracula-red">{passwordError}</p>}

      {/* Location */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
          disabled={loading}
          className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-comoon-purple"
        >
          <option value="">Departamento</option>
          {colombiaData.map((d) => (
            <option key={d.id} value={d.departamento}>
              {d.departamento}
            </option>
          ))}
        </select>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          disabled={!department || loading}
          className="w-full appearance-none rounded-lg border border-dracula-current bg-dracula-bg/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-comoon-purple disabled:opacity-50"
        >
          <option value="">Ciudad</option>
          {citiesList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <textarea
        rows={2}
        required
        disabled={loading}
        className="w-full resize-none rounded-lg border border-dracula-current bg-dracula-bg/80 px-4 py-2.5 text-sm text-white placeholder-dracula-comment outline-none transition-colors focus:border-comoon-purple"
        placeholder={
          role === 'leader' ? 'Cuéntanos sobre tu liderazgo...' : 'Describe tu emprendimiento...'
        }
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading || !!passwordError}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-all disabled:opacity-70 ${
          role === 'leader'
            ? 'bg-leader hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]'
            : 'bg-entrepreneur hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        }`}
      >
        {loading ? (
          <CircleNotch size={18} className="animate-spin" />
        ) : (
          <>
            Crear mi cuenta
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
