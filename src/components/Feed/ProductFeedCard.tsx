import { Heart, MapPin, WhatsappLogo } from '@phosphor-icons/react';
import type { ProductFeedItem } from '../../types/feed';
import { formatCOP } from '../../utils/format';

interface ProductFeedCardProps {
  product: ProductFeedItem;
}

export default function ProductFeedCard({ product }: ProductFeedCardProps) {
  const formattedPrice = formatCOP(product.price);

  // Build WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa el producto "${product.name}" que apoya la causa "${product.cause.title}".`,
  );

  return (
    <div className="glass group overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-entrepreneur/10">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-dracula-current/20">
        <a href={`/store/${product.id}`}>
          {product.photo_url ? (
            <img
              src={product.photo_url}
              alt={product.name}
              width={400}
              height={300}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl">🛍️</span>
            </div>
          )}
        </a>
        {/* Type badge */}
        <div className="absolute left-3 top-3 rounded-full bg-entrepreneur/90 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          Producto
        </div>
        {/* Price badge */}
        <div className="absolute right-3 top-3 rounded-full bg-dracula-bg/90 px-3 py-1.5 text-sm font-bold text-dracula-green shadow-lg backdrop-blur">
          {formattedPrice}
        </div>
      </div>

      <div className="p-4">
        {/* Product Info */}
        <a
          href={`/store/${product.id}`}
          className="mb-1 block transition-colors hover:text-dracula-cyan"
        >
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white">
            {product.name}
          </h3>
        </a>

        {/* Seller info */}
        <div className="mb-4 flex items-center gap-2">
          {product.seller?.photo_url ? (
            <img
              src={product.seller.photo_url}
              alt={product.seller.name}
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${product.seller?.type === 'leader' ? 'bg-leader/20' : 'bg-entrepreneur/20'}`}
            >
              <span
                className={`text-xs font-bold ${product.seller?.type === 'leader' ? 'text-leader' : 'text-entrepreneur'}`}
              >
                {(product.seller?.name || product.entrepreneur?.store_name || '?').charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm text-dracula-comment">
            de{' '}
            <span
              className={`font-medium ${product.seller?.type === 'leader' ? 'text-leader' : 'text-entrepreneur'}`}
            >
              {product.seller?.name || product.entrepreneur?.store_name}
            </span>
          </span>
        </div>

        {/* Location */}
        {(product.seller?.city || product.seller?.department) && (
          <p className="mb-3 flex items-center gap-1 text-xs text-dracula-comment">
            <MapPin size={12} />
            {product.seller.city}
            {product.seller.city && product.seller.department ? ', ' : ''}
            {product.seller.department}
          </p>
        )}

        {/* Impact Badge */}
        <div className="mb-4 rounded-xl border border-dracula-purple/20 bg-dracula-bg/60 p-3">
          <div className="flex items-start gap-2">
            <Heart size={16} weight="fill" className="mt-0.5 shrink-0 text-dracula-purple" />
            <div>
              <p className="mb-0.5 text-xs font-bold text-dracula-purple">Impacto Directo</p>
              <p className="text-xs leading-relaxed text-dracula-fg/80">
                {product.contribution_text ||
                  (product.contribution_type === 'percentage'
                    ? `${product.contribution_amount}% de cada compra`
                    : `$${product.contribution_amount?.toLocaleString('es-CO')} por compra`)}{' '}
                para{' '}
                <a
                  href={`/causes/${product.cause.id}`}
                  className="font-medium text-leader hover:underline"
                >
                  {product.cause.title}
                </a>{' '}
                de <span className="font-medium text-white">{product.leader.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={`/store/${product.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-entrepreneur/30 bg-entrepreneur/20 py-2.5 text-sm font-medium text-entrepreneur transition-colors hover:bg-entrepreneur/30"
        >
          Ver producto
        </a>
      </div>
    </div>
  );
}
