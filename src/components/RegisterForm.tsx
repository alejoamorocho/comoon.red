import { useState, useEffect } from 'react';
import { UsersThree, Storefront, MapPin, CheckCircle, Eye, EyeSlash, Lock } from '@phosphor-icons/react';
import colombiaData from '../data/colombia.json';

interface City {
    id: number;
    departamento: string;
    ciudades: string[];
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

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bio: '',
        contact: ''
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

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            console.log("Registered:", { role, department, city, ...formData });
        }, 1500);
        // In real implementation: fetch('/api/auth/register', { method: 'POST', body: ... })
    };

    if (success) {
        return (
            <div className="text-center py-12">
                <CheckCircle size={64} className="text-dracula-green mx-auto mb-4" weight="fill" />
                <h2 className="text-3xl font-bold text-white mb-2">Registro Exitoso!</h2>
                <p className="text-dracula-fg/80 mb-6">Gracias por unirte a comoon. Ya puedes iniciar sesion y gestionar tu perfil.</p>
                <div className="flex gap-4 justify-center">
                    <a href="/" className="px-6 py-2 border border-dracula-current text-white font-bold rounded-lg hover:border-white transition-colors">Inicio</a>
                    <a href="/login" className="px-6 py-2 bg-dracula-purple text-dracula-bg font-bold rounded-lg hover:bg-white transition-colors">
                        Iniciar Sesion
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    type="button"
                    onClick={() => setRole('leader')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'leader'
                        ? 'border-dracula-purple bg-dracula-purple/20 text-white'
                        : 'border-dracula-current bg-transparent text-dracula-comment hover:border-dracula-purple/50'
                        }`}
                >
                    <UsersThree size={32} weight={role === 'leader' ? 'fill' : 'duotone'} />
                    <span className="font-bold">Soy Lider Social</span>
                </button>
                <button
                    type="button"
                    onClick={() => setRole('entrepreneur')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'entrepreneur'
                        ? 'border-dracula-cyan bg-dracula-cyan/20 text-white'
                        : 'border-dracula-current bg-transparent text-dracula-comment hover:border-dracula-cyan/50'
                        }`}
                >
                    <Storefront size={32} weight={role === 'entrepreneur' ? 'fill' : 'duotone'} />
                    <span className="font-bold">Soy Emprendedor</span>
                </button>
            </div>

            {/* Name and Email */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">Nombre {role === 'leader' ? 'Completo' : 'de la Tienda'}</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-2 text-white focus:border-dracula-purple outline-none"
                        placeholder={role === 'leader' ? "Ej. Maria Perez" : "Ej. Artesanias del Valle"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">Correo Electronico</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-2 text-white focus:border-dracula-purple outline-none"
                        placeholder="hola@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">
                        <Lock size={16} className="inline mr-1" />
                        Contrasena
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-2 pr-10 text-white focus:border-dracula-purple outline-none"
                            placeholder="Minimo 8 caracteres"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">
                        <Lock size={16} className="inline mr-1" />
                        Confirmar Contrasena
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            minLength={8}
                            className={`w-full bg-dracula-bg border rounded-lg px-4 py-2 pr-10 text-white outline-none ${
                                passwordError ? 'border-dracula-red focus:border-dracula-red' : 'border-dracula-current focus:border-dracula-purple'
                            }`}
                            placeholder="Repite tu contrasena"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Error Message */}
            {passwordError && (
                <p className="text-dracula-red text-sm font-medium -mt-2">{passwordError}</p>
            )}

            {/* Location Fields (Colombia Data) */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">Departamento</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment" />
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                            className="w-full bg-dracula-bg border border-dracula-current rounded-lg pl-10 pr-4 py-2 text-white focus:border-dracula-purple outline-none appearance-none"
                        >
                            <option value="">Selecciona...</option>
                            {colombiaData.map((d) => (
                                <option key={d.id} value={d.departamento}>{d.departamento}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-dracula-fg mb-2">Ciudad / Municipio</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment" />
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            disabled={!department}
                            className="w-full bg-dracula-bg border border-dracula-current rounded-lg pl-10 pr-4 py-2 text-white focus:border-dracula-purple outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="">Selecciona...</option>
                            {citiesList.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-dracula-fg mb-2">Biografia / Descripcion</label>
                <textarea
                    rows={4}
                    required
                    className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-2 text-white focus:border-dracula-purple outline-none"
                    placeholder={role === 'leader' ? "Cuentanos sobre tu liderazgo y tu comunidad..." : "Describe tu emprendimiento y que productos ofreces..."}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-dracula-fg mb-2">Contacto (WhatsApp / Redes)</label>
                <input
                    type="text"
                    className="w-full bg-dracula-bg border border-dracula-current rounded-lg px-4 py-2 text-white focus:border-dracula-purple outline-none"
                    placeholder="Ej. +57 300 123 4567"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={loading || !!passwordError}
                className="w-full bg-dracula-green text-dracula-bg font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(80,250,123,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? 'Procesando...' : (role === 'leader' ? 'Registrarme como Lider' : 'Crear mi Tienda')}
            </button>

            <p className="text-center text-dracula-comment text-sm">
                Ya tienes cuenta? <a href="/login" className="text-dracula-purple hover:underline font-medium">Inicia Sesion</a>
            </p>
        </form>
    );
}
