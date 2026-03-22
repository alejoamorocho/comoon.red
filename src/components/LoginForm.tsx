import { useState } from 'react';
import { Eye, EyeSlash, SignIn, Warning, CircleNotch } from '@phosphor-icons/react';

interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    role: string;
    name?: string;
    onboardingComplete?: boolean;
  };
  redirectTo?: string;
  error?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user) {
        // Store user info in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(data.user));

        // Store tokens if needed for client-side API calls
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Get redirect URL: onboarding takes priority, then query param, then server response
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl =
          data.user?.onboardingComplete === false
            ? '/onboarding'
            : urlParams.get('redirect') || data.redirectTo || '/feed';

        // Redirect to appropriate page
        window.location.href = redirectUrl;
      } else {
        setError(data.error || 'Error al iniciar sesion');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexion. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-dracula-red/50 bg-dracula-red/20 p-4">
          <Warning size={24} className="shrink-0 text-dracula-red" />
          <p className="text-sm font-medium text-dracula-red">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-dracula-fg">
          Correo Electronico
        </label>
        <input
          id="login-email"
          type="email"
          required
          className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 text-white outline-none transition-colors focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-bold text-dracula-fg">
          Contrasena
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            className="w-full rounded-lg border border-dracula-current bg-dracula-bg px-4 py-3 pr-12 text-white outline-none transition-colors focus:border-dracula-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple"
            placeholder="Tu contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dracula-comment transition-colors hover:text-white"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-dracula-current bg-dracula-bg text-dracula-purple focus:ring-dracula-purple"
          />
          <span className="text-dracula-fg/80">Recordarme</span>
        </label>
        <a href="#" className="text-dracula-purple hover:underline">
          Olvidaste tu contrasena?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dracula-purple py-3 font-bold text-dracula-bg shadow-[0_0_20px_rgba(189,147,249,0.3)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <CircleNotch size={20} className="animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            <SignIn size={20} />
            Iniciar Sesion
          </>
        )}
      </button>

      <p className="text-center text-sm text-dracula-comment-accessible">
        No tienes cuenta?{' '}
        <a href="/register" className="font-medium text-comoon-purple hover:underline">
          Registrate
        </a>
      </p>

      {/* Demo Credentials - only shown in development */}
      {import.meta.env.DEV && (
        <div className="mt-8 rounded-lg border border-dracula-comment/30 bg-dracula-current/30 p-4">
          <p className="mb-2 text-xs font-bold text-dracula-comment">CREDENCIALES DE PRUEBA:</p>
          <div className="space-y-1 text-xs text-dracula-fg/70">
            <p>
              <span className="text-dracula-purple">Admin:</span> admin@comoon.co / admin123
            </p>
            <p>
              <span className="text-leader">Lider:</span> elena.marin@email.com / cualquier
            </p>
            <p>
              <span className="text-entrepreneur">Emprendedor:</span> artesanias@email.com /
              cualquier
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
