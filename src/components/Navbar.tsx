import { UsersThree, Storefront, Briefcase, House, SignIn } from '@phosphor-icons/react';

// Logo SVG Component
function ComoonLogo({ size = 32 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 375 375"
            preserveAspectRatio="xMidYMid meet"
            className="transition-transform group-hover:rotate-12"
        >
            <defs>
                <clipPath id="nav-moon-outer">
                    <path d="M 59.0625 37.5 L 316.3125 37.5 L 316.3125 337.5 L 59.0625 337.5 Z" clipRule="nonzero"/>
                </clipPath>
                <clipPath id="nav-moon-inner">
                    <path d="M 153.1875 92.722656 L 315.9375 92.722656 L 315.9375 282.472656 L 153.1875 282.472656 Z" clipRule="nonzero"/>
                </clipPath>
            </defs>
            <g clipPath="url(#nav-moon-outer)">
                <path fill="#9986bf" d="M 232.242188 321.746094 C 263.921875 321.746094 293.058594 310.769531 316.019531 292.398438 C 288.84375 320.152344 250.902344 337.367188 208.972656 337.367188 C 126.183594 337.367188 59.0625 270.246094 59.0625 187.457031 C 59.0625 104.671875 126.183594 37.570312 208.972656 37.570312 C 250.902344 37.570312 288.824219 54.785156 316.019531 82.539062 C 293.058594 64.167969 263.921875 53.195312 232.242188 53.195312 C 158.09375 53.195312 97.976562 113.308594 97.976562 187.457031 C 97.976562 261.628906 158.09375 321.722656 232.242188 321.722656 Z"/>
            </g>
            <g clipPath="url(#nav-moon-inner)">
                <path fill="#fdfdfd" d="M 206.285156 102.5 C 186.226562 102.5 167.777344 109.449219 153.242188 121.082031 C 170.445312 103.507812 194.46875 92.609375 221.019531 92.609375 C 273.4375 92.609375 315.9375 135.109375 315.9375 187.527344 C 315.9375 239.945312 273.4375 282.429688 221.019531 282.429688 C 194.46875 282.429688 170.460938 271.53125 153.242188 253.957031 C 167.777344 265.589844 186.226562 272.539062 206.285156 272.539062 C 253.234375 272.539062 291.296875 234.472656 291.296875 187.527344 C 291.296875 140.5625 253.234375 102.511719 206.285156 102.511719 Z"/>
            </g>
        </svg>
    );
}

export default function Navbar() {
    return (
        <nav className="glass sticky top-4 z-50 mx-4 mt-4 rounded-xl px-6 py-4 flex justify-between items-center shadow-lg shadow-dracula-bg/50">
            <a href="/" className="flex items-center gap-2 group">
                <ComoonLogo size={36} />
                <span className="text-2xl font-bold tracking-tight text-white lowercase">comoon</span>
            </a>

            <div className="flex items-center gap-4 md:gap-6">
                <NavLink href="/" icon={<House size={24} weight="duotone" />} label="Inicio" />
                <NavLink href="/leaders" icon={<UsersThree size={24} weight="duotone" />} label="Lideres" />
                <NavLink href="/entrepreneurs" icon={<Briefcase size={24} weight="duotone" />} label="Emprendedores" />
                <NavLink href="/store" icon={<Storefront size={24} weight="duotone" />} label="Tienda" />

                <div className="flex items-center gap-2 ml-2">
                    <a
                        href="/login"
                        className="px-3 py-2 rounded-full text-dracula-fg/80 hover:text-white transition-colors font-medium text-sm flex items-center gap-1"
                    >
                        <SignIn size={18} />
                        <span className="hidden md:inline">Ingresar</span>
                    </a>
                    <a
                        href="/register"
                        className="px-4 py-2 rounded-full border border-dracula-purple text-dracula-purple hover:bg-dracula-purple hover:text-dracula-bg transition-colors font-bold text-sm"
                    >
                        Unete
                    </a>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-2 text-dracula-fg/80 hover:text-dracula-cyan transition-colors duration-200 font-medium"
            aria-label={label}
        >
            {icon}
            <span className="hidden lg:inline">{label}</span>
        </a>
    );
}
