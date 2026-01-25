import { WhatsappLogo } from '@phosphor-icons/react';

interface WhatsAppButtonProps {
    productName: string;
    leaderName: string;
    entrepreneurPhone?: string; // WhatsApp number of entrepreneur
    variant?: 'full' | 'compact';
}

export default function WhatsAppButton({
    productName,
    leaderName,
    entrepreneurPhone,
    variant = 'full'
}: WhatsAppButtonProps) {
    // Message as specified in the business logic
    const message = `Hola, me interesa el producto ${productName} y quiero apoyar la causa de ${leaderName} via Comoon`;
    const encodedMessage = encodeURIComponent(message);

    // If entrepreneur phone is provided, use it. Otherwise, open WhatsApp with just the message
    const phoneNumber = entrepreneurPhone?.replace(/[^0-9]/g, '') || '';
    const whatsappUrl = phoneNumber
        ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;

    const handleConnect = () => {
        window.open(whatsappUrl, '_blank');
    };

    if (variant === 'compact') {
        return (
            <button
                onClick={handleConnect}
                className="p-2 rounded-full bg-dracula-green/20 text-dracula-green hover:bg-dracula-green hover:text-dracula-bg transition-all"
                title="Conectar por WhatsApp"
            >
                <WhatsappLogo size={20} weight="fill" />
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            className="w-full flex items-center justify-center gap-2 bg-dracula-green text-dracula-bg font-bold py-3 rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(80,250,123,0.3)]"
        >
            <WhatsappLogo size={22} weight="fill" />
            Conectar por WhatsApp
        </button>
    );
}
