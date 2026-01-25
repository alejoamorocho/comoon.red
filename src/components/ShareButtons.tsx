import { WhatsappLogo, FacebookLogo, TwitterLogo, Link, Moon } from '@phosphor-icons/react';
import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    text: string;
    url?: string;
    showLabel?: boolean;
}

export default function ShareButtons({ title, text, url, showLabel = false }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const getUrl = () => {
        if (typeof window !== 'undefined') {
            return url || window.location.href;
        }
        return '';
    };

    const shareWhatsApp = () => {
        const shareText = `${text} - Descubre mas en Comoon ${getUrl()}`;
        const link = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(link, '_blank');
    };

    const shareFacebook = () => {
        const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}&quote=${encodeURIComponent(text)}`;
        window.open(link, '_blank');
    };

    const shareTwitter = () => {
        const shareText = `${text} via @comoon_co`;
        const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`;
        window.open(link, '_blank');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(getUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-3">
            {showLabel && (
                <span className="text-xs text-dracula-comment flex items-center gap-1">
                    <Moon size={14} weight="duotone" className="text-dracula-purple" />
                    Difusion Lunar
                </span>
            )}
            <div className="flex gap-1">
                <button
                    onClick={shareWhatsApp}
                    className="p-2 rounded-full bg-dracula-current/50 hover:bg-green-500/20 text-green-500 transition-all hover:scale-110"
                    title="Compartir en WhatsApp"
                >
                    <WhatsappLogo size={20} weight="duotone" />
                </button>
                <button
                    onClick={shareFacebook}
                    className="p-2 rounded-full bg-dracula-current/50 hover:bg-blue-600/20 text-blue-500 transition-all hover:scale-110"
                    title="Compartir en Facebook"
                >
                    <FacebookLogo size={20} weight="duotone" />
                </button>
                <button
                    onClick={shareTwitter}
                    className="p-2 rounded-full bg-dracula-current/50 hover:bg-sky-400/20 text-sky-400 transition-all hover:scale-110"
                    title="Compartir en X"
                >
                    <TwitterLogo size={20} weight="duotone" />
                </button>
                <button
                    onClick={copyLink}
                    className="p-2 rounded-full bg-dracula-current/50 hover:bg-dracula-purple/20 text-dracula-purple transition-all hover:scale-110 relative"
                    title="Copiar enlace"
                >
                    <Link size={20} weight="duotone" />
                    {copied && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-dracula-green text-dracula-bg px-2 py-1 rounded whitespace-nowrap font-bold">
                            Enlace copiado
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
