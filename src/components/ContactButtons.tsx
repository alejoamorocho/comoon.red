import {
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  Globe,
  XLogo,
  TiktokLogo,
  ThreadsLogo,
} from '@phosphor-icons/react';

interface ContactInfo {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  threads?: string;
  tiktok?: string;
  website?: string;
}

interface ContactButtonsProps {
  contactInfo: ContactInfo;
  productName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ContactButtons({
  contactInfo,
  productName,
  size = 'md',
}: ContactButtonsProps) {
  const hasAny =
    contactInfo.whatsapp ||
    contactInfo.instagram ||
    contactInfo.facebook ||
    contactInfo.x ||
    contactInfo.threads ||
    contactInfo.tiktok ||
    contactInfo.website;
  if (!hasAny) return null;

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const padding =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
        ? 'px-6 py-3 text-base'
        : 'px-4 py-2 text-sm';

  const whatsappMessage = productName
    ? encodeURIComponent(`Hola! Me interesa "${productName}" que vi en Comoon.`)
    : encodeURIComponent('Hola! Te encontre en Comoon.');

  const whatsappNumber = contactInfo.whatsapp?.replace(/[^0-9]/g, '');

  return (
    <div className="flex flex-wrap gap-2">
      {contactInfo.whatsapp && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full bg-[#25D366] font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:brightness-110`}
        >
          <WhatsappLogo size={iconSize} weight="fill" />
          WhatsApp
        </a>
      )}
      {contactInfo.instagram && (
        <a
          href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] font-bold text-white transition-all hover:brightness-110`}
        >
          <InstagramLogo size={iconSize} weight="fill" />
          Instagram
        </a>
      )}
      {contactInfo.facebook && (
        <a
          href={
            contactInfo.facebook.startsWith('http')
              ? contactInfo.facebook
              : `https://facebook.com/${contactInfo.facebook}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full bg-[#1877F2] font-bold text-white transition-all hover:brightness-110`}
        >
          <FacebookLogo size={iconSize} weight="fill" />
          Facebook
        </a>
      )}
      {contactInfo.x && (
        <a
          href={`https://x.com/${contactInfo.x.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full border border-white/20 bg-black font-bold text-white transition-all hover:brightness-110`}
        >
          <XLogo size={iconSize} weight="fill" />X
        </a>
      )}
      {contactInfo.tiktok && (
        <a
          href={`https://tiktok.com/@${contactInfo.tiktok.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full border border-white/20 bg-black font-bold text-white transition-all hover:brightness-110`}
        >
          <TiktokLogo size={iconSize} weight="fill" />
          TikTok
        </a>
      )}
      {contactInfo.threads && (
        <a
          href={`https://threads.net/@${contactInfo.threads.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full border border-white/20 bg-black font-bold text-white transition-all hover:brightness-110`}
        >
          <ThreadsLogo size={iconSize} weight="fill" />
          Threads
        </a>
      )}
      {contactInfo.website && (
        <a
          href={
            contactInfo.website.startsWith('http')
              ? contactInfo.website
              : `https://${contactInfo.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${padding} rounded-full border border-white/10 bg-dracula-current font-bold text-white transition-all hover:bg-dracula-comment`}
        >
          <Globe size={iconSize} />
          Web
        </a>
      )}
    </div>
  );
}
