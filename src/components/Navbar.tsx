import {
  UsersThree,
  Storefront,
  Rows,
  SignOut,
  User,
  Heart,
  ShoppingBag,
} from '@phosphor-icons/react';

import ComoonBrand from './ComoonBrand';

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'leader' | 'entrepreneur' | 'admin';
  onboardingComplete?: boolean;
  userName?: string;
  currentPath?: string;
}

const NAV_PILLS = [
  {
    href: '/feed',
    label: 'Feed',
    icon: Rows,
    color: 'border-white/10 bg-white/5 text-dracula-fg/70 hover:text-white hover:border-white/20',
  },
  {
    href: '/leaders',
    label: 'Líderes',
    icon: UsersThree,
    color:
      'border-comoon-purple/15 bg-comoon-purple/5 text-comoon-purple/80 hover:text-comoon-purple hover:border-comoon-purple/30',
  },
  {
    href: '/causes',
    label: 'Causas',
    icon: Heart,
    color: 'border-leader/15 bg-leader/5 text-leader/80 hover:text-leader hover:border-leader/30',
  },
  {
    href: '/entrepreneurs',
    label: 'Emprendedores',
    icon: ShoppingBag,
    color:
      'border-community/15 bg-community/5 text-community/80 hover:text-community hover:border-community/30',
  },
  {
    href: '/store',
    label: 'Tienda',
    icon: Storefront,
    color:
      'border-entrepreneur/15 bg-entrepreneur/5 text-entrepreneur/80 hover:text-entrepreneur hover:border-entrepreneur/30',
  },
];

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

export default function Navbar({
  isLoggedIn = false,
  userRole,
  onboardingComplete,
  currentPath = '',
}: NavbarProps) {
  // Hide navbar on home page — navigation is in the hero
  if (currentPath === '/') return null;

  const isOnboarded = isLoggedIn && onboardingComplete;

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-white/5 bg-dracula-bg/80 px-3 py-3 backdrop-blur-lg sm:px-6"
    >
      {/* Left: Logo */}
      <a href="/" className="flex items-center" style={{ viewTransitionName: 'comoon-logo' }}>
        <ComoonBrand size={28} />
      </a>

      {/* Center: Unified nav pills */}
      <div
        className="scrollbar-hide flex items-center gap-1 overflow-x-auto sm:gap-1.5"
        style={{ viewTransitionName: 'nav-pills' }}
      >
        {NAV_PILLS.map((pill) => {
          const Icon = pill.icon;
          const isActive = currentPath === pill.href || currentPath.startsWith(pill.href + '/');
          return (
            <a
              key={pill.href}
              href={pill.href}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${pill.color} ${isActive ? 'ring-1 ring-white/20 brightness-125' : ''}`}
            >
              <Icon size={13} weight="duotone" />
              <span className="hidden md:inline">{pill.label}</span>
            </a>
          );
        })}
      </div>

      {/* Right: Auth */}
      <div className="flex items-center gap-2">
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
                    ? 'Líder'
                    : userRole === 'entrepreneur'
                      ? 'Emprendedor'
                      : 'Admin'}
                </span>
              </a>
            )}
            {!isOnboarded && (
              <a
                href="/onboarding"
                className="rounded-full border border-comoon-purple/30 bg-comoon-purple/15 px-3 py-1.5 text-xs font-bold text-comoon-purple transition-colors hover:bg-comoon-purple hover:text-white"
              >
                Completar Perfil
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
              Únete
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
