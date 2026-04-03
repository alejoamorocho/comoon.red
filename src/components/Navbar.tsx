import {
  UsersThree,
  Storefront,
  Rows,
  SignOut,
  User,
  Trophy,
  ShoppingBag,
  Gear,
  Info,
} from '@phosphor-icons/react';

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'leader' | 'entrepreneur' | 'admin';
  onboardingComplete?: boolean;
  userName?: string;
}

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
          <path
            d="M 59.0625 37.5 L 316.3125 37.5 L 316.3125 337.5 L 59.0625 337.5 Z"
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="nav-moon-inner">
          <path
            d="M 153.1875 92.722656 L 315.9375 92.722656 L 315.9375 282.472656 L 153.1875 282.472656 Z"
            clipRule="nonzero"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#nav-moon-outer)">
        <path
          fill="#9986bf"
          d="M 232.242188 321.746094 C 263.921875 321.746094 293.058594 310.769531 316.019531 292.398438 C 288.84375 320.152344 250.902344 337.367188 208.972656 337.367188 C 126.183594 337.367188 59.0625 270.246094 59.0625 187.457031 C 59.0625 104.671875 126.183594 37.570312 208.972656 37.570312 C 250.902344 37.570312 288.824219 54.785156 316.019531 82.539062 C 293.058594 64.167969 263.921875 53.195312 232.242188 53.195312 C 158.09375 53.195312 97.976562 113.308594 97.976562 187.457031 C 97.976562 261.628906 158.09375 321.722656 232.242188 321.722656 Z"
        />
      </g>
      <g clipPath="url(#nav-moon-inner)">
        <path
          fill="#fdfdfd"
          d="M 206.285156 102.5 C 186.226562 102.5 167.777344 109.449219 153.242188 121.082031 C 170.445312 103.507812 194.46875 92.609375 221.019531 92.609375 C 273.4375 92.609375 315.9375 135.109375 315.9375 187.527344 C 315.9375 239.945312 273.4375 282.429688 221.019531 282.429688 C 194.46875 282.429688 170.460938 271.53125 153.242188 253.957031 C 167.777344 265.589844 186.226562 272.539062 206.285156 272.539062 C 253.234375 272.539062 291.296875 234.472656 291.296875 187.527344 C 291.296875 140.5625 253.234375 102.511719 206.285156 102.511719 Z"
        />
      </g>
    </svg>
  );
}

function LogoutButton() {
  return (
    <button
      onClick={() => {
        fetch('/api/auth/logout', { method: 'POST' }).then(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        });
      }}
      className="flex items-center gap-2 rounded-full border border-dracula-comment/30 px-3 py-1.5 text-xs font-medium text-dracula-comment transition-colors hover:border-dracula-red/50 hover:text-dracula-red"
    >
      <SignOut size={14} />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}

export default function Navbar({ isLoggedIn = false, userRole, onboardingComplete }: NavbarProps) {
  const isOnboarded = isLoggedIn && onboardingComplete;

  return (
    <nav
      aria-label="Navegacion principal"
      className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-dracula-bg/80 px-6 py-3 backdrop-blur-lg"
    >
      {/* Left: Logo + About */}
      <div className="flex items-center gap-6">
        <a href="/" className="group flex items-center gap-2">
          <ComoonLogo size={28} />
          <span className="text-lg font-bold lowercase tracking-tight">
            <span className="text-white">co</span>
            <span className="text-comoon-purple">moon</span>
          </span>
        </a>

        <a
          href="/about"
          className="hidden items-center gap-1.5 text-xs font-medium text-dracula-comment-accessible transition-colors hover:text-white sm:flex"
        >
          <Info size={14} weight="duotone" />
          About
        </a>
      </div>

      {/* Right: Nav links + Auth */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Public nav */}
        {!isLoggedIn && (
          <>
            <NavLink href="/feed" icon={<Rows size={18} weight="duotone" />} label="Feed" />
            <NavLink
              href="/store"
              icon={<Storefront size={18} weight="duotone" />}
              label="Tienda"
            />
            <NavLink
              href="/leaders"
              icon={<UsersThree size={18} weight="duotone" />}
              label="Lideres"
            />
          </>
        )}

        {/* Logged in but NOT onboarded */}
        {isLoggedIn && !onboardingComplete && (
          <>
            <NavLink href="/feed" icon={<Rows size={18} weight="duotone" />} label="Feed" />
            <NavLink href="/onboarding" label="Completar Perfil" />
          </>
        )}

        {/* Leader nav */}
        {isOnboarded && userRole === 'leader' && (
          <>
            <NavLink href="/feed" icon={<Rows size={18} weight="duotone" />} label="Feed" />
            <NavLink
              href="/dashboard/leader?tab=causas"
              icon={<Trophy size={18} weight="duotone" />}
              label="Causas"
            />
            <NavLink
              href="/dashboard/leader?tab=productos"
              icon={<ShoppingBag size={18} weight="duotone" />}
              label="Tienda"
            />
          </>
        )}

        {/* Entrepreneur nav */}
        {isOnboarded && userRole === 'entrepreneur' && (
          <>
            <NavLink href="/feed" icon={<Rows size={18} weight="duotone" />} label="Feed" />
            <NavLink
              href="/dashboard/entrepreneur?tab=productos"
              icon={<ShoppingBag size={18} weight="duotone" />}
              label="Productos"
            />
            <NavLink
              href="/leaders"
              icon={<UsersThree size={18} weight="duotone" />}
              label="Causas"
            />
          </>
        )}

        {/* Admin nav */}
        {isOnboarded && userRole === 'admin' && (
          <>
            <NavLink href="/feed" icon={<Rows size={18} weight="duotone" />} label="Feed" />
            <NavLink
              href="/leaders"
              icon={<UsersThree size={18} weight="duotone" />}
              label="Lideres"
            />
            <NavLink
              href="/store"
              icon={<Storefront size={18} weight="duotone" />}
              label="Tienda"
            />
            <NavLink
              href="/dashboard/admin"
              icon={<Gear size={18} weight="duotone" />}
              label="Admin"
            />
          </>
        )}

        {/* Auth */}
        <div className="ml-1 flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {isOnboarded && (
                <a
                  href={
                    userRole === 'leader'
                      ? '/dashboard/leader'
                      : userRole === 'entrepreneur'
                        ? '/dashboard/entrepreneur'
                        : '/dashboard/admin'
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    userRole === 'leader'
                      ? 'border-leader/40 text-leader hover:bg-leader hover:text-dracula-bg'
                      : userRole === 'entrepreneur'
                        ? 'border-entrepreneur/40 text-entrepreneur hover:bg-entrepreneur hover:text-dracula-bg'
                        : 'border-dracula-purple/40 text-dracula-purple hover:bg-dracula-purple hover:text-dracula-bg'
                  }`}
                >
                  <User size={14} />
                  <span className="hidden sm:inline">
                    {userRole === 'leader'
                      ? 'Lider'
                      : userRole === 'entrepreneur'
                        ? 'Emprendedor'
                        : 'Admin'}
                  </span>
                </a>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-xs font-medium text-dracula-comment-accessible transition-colors hover:text-white"
              >
                Ingresar
              </a>
              <a
                href="/register"
                className="rounded-full border border-comoon-purple/30 bg-comoon-purple/15 px-3.5 py-1.5 text-xs font-bold text-comoon-purple transition-colors hover:bg-comoon-purple hover:text-white"
              >
                Unete
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon?: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 text-xs font-medium text-dracula-fg/60 transition-colors hover:text-white"
      aria-label={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </a>
  );
}
