import { MagnifyingGlass } from '@phosphor-icons/react';

export default function SearchHero() {
  return (
    <div className="group relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dracula-purple to-dracula-cyan opacity-25 blur transition-opacity group-hover:opacity-50"></div>
      <div className="relative flex items-center rounded-full border border-dracula-current bg-dracula-bg/80 px-3 py-3 shadow-2xl backdrop-blur-xl sm:px-6 sm:py-4">
        <MagnifyingGlass size={24} className="mr-2 shrink-0 text-dracula-comment sm:mr-4" />
        <input
          type="text"
          placeholder="Busca causas, líderes o productos..."
          className="w-full min-w-0 border-none bg-transparent text-base text-dracula-fg placeholder-dracula-comment outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dracula-purple sm:text-lg"
        />
        <button className="shrink-0 rounded-full bg-dracula-purple px-4 py-2 font-bold text-dracula-bg transition-all hover:brightness-110 sm:px-6">
          Buscar
        </button>
      </div>
    </div>
  );
}
