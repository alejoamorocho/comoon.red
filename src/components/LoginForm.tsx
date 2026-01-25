import { useState } from 'react';
import { Eye, EyeSlash, SignIn, Warning } from '@phosphor-icons/react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Mock validation - in real app, call API
            if (email === 'admin@comoon.co' && password === 'admin123') {
                // Admin login
                localStorage.setItem('user', JSON.stringify({ email, role: 'admin', name: 'Administrador' }));
                window.location.href = '/dashboard/admin';
            } else if (email === 'lider@comoon.co' && password === 'lider123') {
                // Leader login
                localStorage.setItem('user', JSON.stringify({ email, role: 'leader', name: 'Elena Marin', id: 1 }));
                window.location.href = '/dashboard/leader';
            } else if (email === 'emprendedor@comoon.co' && password === 'emprendedor123') {
                // Entrepreneur login
                localStorage.setItem('user', JSON.stringify({ email, role: 'entrepreneur', name: 'Artesanias del Valle', id: 1 }));
                window.location.href = '/dashboard/entrepreneur';
            } else {
                setError('Correo o contrasena incorrectos');
                setLoading(false);
            }
        }, 1000);

        // In real implementation:
        // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        // const data = await res.json();
        // if (data.success) { localStorage.setItem('token', data.token); redirect... }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-dracula-red/20 border border-dracula-red/50 rounded-lg p-4 flex items-center gap-3">
                    <Warning size={24} className="text-dracula-red" />
                    <p className="text-dracula-red font-medium">{error}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-dracula-fg mb-2">Correo Electronico</label>
                <input
                    type="email"
                    required
                    className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-3 text-white focus:border-dracula-purple outline-none"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-dracula-fg mb-2">Contrasena</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-3 pr-12 text-white focus:border-dracula-purple outline-none"
                        placeholder="Tu contrasena"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dracula-comment hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-dracula-current bg-dracula-bg text-dracula-purple focus:ring-dracula-purple" />
                    <span className="text-dracula-fg/80">Recordarme</span>
                </label>
                <a href="#" className="text-dracula-purple hover:underline">Olvidaste tu contrasena?</a>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-dracula-purple text-dracula-bg font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(189,147,249,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    'Ingresando...'
                ) : (
                    <>
                        <SignIn size={20} />
                        Iniciar Sesion
                    </>
                )}
            </button>

            <p className="text-center text-dracula-comment text-sm">
                No tienes cuenta? <a href="/register" className="text-dracula-cyan hover:underline font-medium">Registrate</a>
            </p>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-dracula-current/30 rounded-lg border border-dracula-comment/30">
                <p className="text-dracula-comment text-xs font-bold mb-2">CREDENCIALES DE PRUEBA:</p>
                <div className="space-y-1 text-xs text-dracula-fg/70">
                    <p><span className="text-dracula-purple">Admin:</span> admin@comoon.co / admin123</p>
                    <p><span className="text-dracula-purple">Lider:</span> lider@comoon.co / lider123</p>
                    <p><span className="text-dracula-cyan">Emprendedor:</span> emprendedor@comoon.co / emprendedor123</p>
                </div>
            </div>
        </form>
    );
}
