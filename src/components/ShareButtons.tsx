import { WhatsappLogo, FacebookLogo, TwitterLogo, Link, Moon } from '@phosphor-icons/react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  showLabel?: boolean;
  causeId?: number;
}

export default function ShareButtons({
  title,
  text,
  url,
  showLabel = false,
  causeId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return url || window.location.href;
    }
    return '';
  };

  const trackShare = () => {
    if (causeId) fetch(`/api/causes/${causeId}/share`, { method: 'POST' });
  };

  const shareWhatsApp = () => {
    const shareText = `${text} - Descubre más en Comoon ${getUrl()}`;
    const link = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(link, '_blank');
    trackShare();
  };

  const shareFacebook = () => {
    const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}&quote=${encodeURIComponent(text)}`;
    window.open(link, '_blank');
    trackShare();
  };

  const shareTwitter = () => {
    const shareText = `${text} via @comoon_co`;
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`;
    window.open(link, '_blank');
    trackShare();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare();
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="flex items-center gap-1 text-xs text-dracula-comment">
          <Moon size={14} weight="duotone" className="text-dracula-purple" />
          Difusión Lunar
        </span>
      )}
      <div className="flex gap-1">
        <button
          onClick={shareWhatsApp}
          className="rounded-full bg-dracula-current/50 p-2 text-green-500 transition-all hover:scale-110 hover:bg-green-500/20"
          title="Compartir en WhatsApp"
        >
          <WhatsappLogo size={20} weight="duotone" />
        </button>
        <button
          onClick={shareFacebook}
          className="rounded-full bg-dracula-current/50 p-2 text-blue-500 transition-all hover:scale-110 hover:bg-blue-600/20"
          title="Compartir en Facebook"
        >
          <FacebookLogo size={20} weight="duotone" />
        </button>
        <button
          onClick={shareTwitter}
          className="rounded-full bg-dracula-current/50 p-2 text-sky-400 transition-all hover:scale-110 hover:bg-sky-400/20"
          title="Compartir en X"
        >
          <TwitterLogo size={20} weight="duotone" />
        </button>
        <button
          onClick={copyLink}
          className="relative rounded-full bg-dracula-current/50 p-2 text-dracula-purple transition-all hover:scale-110 hover:bg-dracula-purple/20"
          title="Copiar enlace"
        >
          <Link size={20} weight="duotone" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-dracula-green px-2 py-1 text-xs font-bold text-dracula-bg">
              Enlace copiado
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
