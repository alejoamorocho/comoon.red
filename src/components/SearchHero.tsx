import { MagnifyingGlass } from '@phosphor-icons/react';

export default function SearchHero() {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-dracula-purple to-dracula-cyan rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative flex items-center bg-dracula-bg/80 backdrop-blur-xl border border-dracula-current rounded-full px-6 py-4 shadow-2xl">
                <MagnifyingGlass size={24} className="text-dracula-comment mr-4" />
                <input
                    type="text"
                    placeholder="Busca causas, líderes o productos..."
                    className="bg-transparent border-none outline-none text-dracula-fg placeholder-dracula-comment w-full text-lg"
                />
                <button className="bg-dracula-purple text-dracula-bg font-bold px-6 py-2 rounded-full hover:brightness-110 transition-all">
                    Buscar
                </button>
            </div>
        </div>
    );
}
