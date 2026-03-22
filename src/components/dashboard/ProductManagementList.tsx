import { useState } from 'react';
import {
  ShoppingBag,
  PencilSimple,
  Power,
  PlusCircle,
  Calendar,
  Tag,
  CircleNotch,
} from '@phosphor-icons/react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  cause_title?: string;
  is_active: boolean;
  created_at: string;
}

interface ProductManagementListProps {
  products: Array<Product>;
  userRole: 'leader' | 'entrepreneur';
}

export default function ProductManagementList({
  products: initialProducts,
  userRole,
}: ProductManagementListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [toggling, setToggling] = useState<number | null>(null);

  const handleToggle = async (product: Product) => {
    setToggling(product.id);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !product.is_active }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)),
        );
      }
    } catch {
      // silently fail
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const dashboardPath = userRole === 'leader' ? 'leader' : 'entrepreneur';
  const accentClass = userRole === 'leader' ? 'leader' : 'entrepreneur';

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4 text-dracula-comment" weight="duotone" />
        <p className="mb-2 text-lg font-bold text-white">Aun no tienes productos.</p>
        <p className="mb-4 text-sm text-dracula-comment">Crea tu primer producto!</p>
        <a
          href={`/dashboard/${dashboardPath}?tab=crear-producto`}
          className={`inline-flex items-center gap-2 rounded-xl bg-${accentClass} px-5 py-2.5 font-bold text-dracula-bg transition-all hover:brightness-110`}
        >
          <PlusCircle size={18} />
          Crear Producto
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={`rounded-xl border bg-dracula-current/30 p-4 transition-all ${
            product.is_active
              ? 'border-dracula-current hover:border-dracula-green/30'
              : 'border-dracula-current/50 opacity-70'
          }`}
        >
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-dracula-current/50">
              {product.photo_url ? (
                <img
                  src={product.photo_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag size={28} className="text-dracula-comment" weight="duotone" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="truncate text-base font-bold text-white">{product.name}</h3>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    product.is_active
                      ? 'bg-dracula-green/20 text-dracula-green'
                      : 'bg-dracula-comment/20 text-dracula-comment'
                  }`}
                >
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Price */}
              <p className="mb-1 text-sm font-bold text-dracula-green">
                ${product.price.toLocaleString('es-CO')}
              </p>

              {product.description && (
                <p className="mb-2 line-clamp-1 text-sm text-dracula-comment">
                  {product.description}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-dracula-comment">
                {product.cause_title && (
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {product.cause_title}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(product.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 border-t border-dracula-current/50 pt-3">
            <button
              type="button"
              onClick={() =>
                (window.location.href = `/dashboard/${dashboardPath}?tab=editar-producto&id=${product.id}`)
              }
              className={`flex items-center gap-1.5 rounded-lg bg-${accentClass}/10 px-3 py-1.5 text-xs font-bold text-${accentClass} transition-all hover:bg-${accentClass}/20`}
            >
              <PencilSimple size={14} />
              Editar
            </button>

            <button
              type="button"
              onClick={() => handleToggle(product)}
              disabled={toggling === product.id}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                product.is_active
                  ? 'bg-dracula-red/10 text-dracula-red hover:bg-dracula-red/20'
                  : 'bg-dracula-green/10 text-dracula-green hover:bg-dracula-green/20'
              }`}
            >
              {toggling === product.id ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <Power size={14} />
              )}
              {product.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
