import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Heart,
  Newspaper,
  ChatText,
  MapPin,
  Tag,
  X,
  CaretDown,
  FunnelSimple,
} from '@phosphor-icons/react';
import { COLOMBIAN_DEPARTMENTS } from '../../types/feed';

export type FeedType = 'product' | 'cause' | 'cause_update' | 'post';

interface FeedFiltersProps {
  activeTypes: FeedType[];
  activeDepartment: string | null;
  activeCategories: string[];
  departments: string[];
  onTypesChange: (types: FeedType[]) => void;
  onDepartmentChange: (department: string | null) => void;
  onCategoriesChange: (categories: string[]) => void;
  onClearAll: () => void;
}

const TYPE_COLOR_MAP: Record<string, string> = {
  entrepreneur: 'bg-entrepreneur/20 border-entrepreneur text-entrepreneur',
  leader: 'bg-leader/20 border-leader text-leader',
  'dracula-cyan': 'bg-dracula-cyan/20 border-dracula-cyan text-dracula-cyan',
  'dracula-purple': 'bg-dracula-purple/20 border-dracula-purple text-dracula-purple',
};

const TYPE_CONFIG = {
  product: { label: 'Productos', Icon: ShoppingBag, color: 'entrepreneur' },
  cause: { label: 'Causas', Icon: Heart, color: 'leader' },
  cause_update: { label: 'Actualizaciones', Icon: Newspaper, color: 'dracula-cyan' },
  post: { label: 'Publicaciones', Icon: ChatText, color: 'dracula-purple' },
};

const CATEGORIES = [
  { id: 'ambiental', label: 'Ambiental' },
  { id: 'social', label: 'Social' },
  { id: 'animales', label: 'Animales' },
  { id: 'educacion', label: 'Educacion' },
  { id: 'salud', label: 'Salud' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'comunidad', label: 'Comunidad' },
  { id: 'alimentacion', label: 'Alimentacion' },
];

export default function FeedFilters({
  activeTypes,
  activeDepartment,
  activeCategories,
  departments,
  onTypesChange,
  onDepartmentChange,
  onCategoriesChange,
  onClearAll,
}: FeedFiltersProps) {
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const hasActiveFilters =
    activeTypes.length < 4 || activeDepartment || activeCategories.length > 0;

  const closeAllDropdowns = useCallback(() => {
    setShowDepartmentDropdown(false);
    setShowCategoryDropdown(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAllDropdowns]);

  const toggleType = (type: FeedType) => {
    if (activeTypes.includes(type)) {
      // Don't allow removing the last type
      if (activeTypes.length > 1) {
        onTypesChange(activeTypes.filter((t) => t !== type));
      }
    } else {
      onTypesChange([...activeTypes, type]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (activeCategories.includes(categoryId)) {
      onCategoriesChange(activeCategories.filter((c) => c !== categoryId));
    } else {
      onCategoriesChange([...activeCategories, categoryId]);
    }
  };

  return (
    <div className="sticky top-16 z-30 border-b border-white/5 bg-dracula-bg/95 py-4 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        {/* Type toggles */}
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(TYPE_CONFIG) as FeedType[]).map((type) => {
            const { label, Icon, color } = TYPE_CONFIG[type];
            const isActive = activeTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? TYPE_COLOR_MAP[color] || ''
                    : 'border-dracula-current bg-dracula-current/30 text-dracula-fg/60 hover:border-white/30'
                }`}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Department dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDepartmentDropdown(!showDepartmentDropdown);
                setShowCategoryDropdown(false);
              }}
              aria-expanded={showDepartmentDropdown}
              aria-haspopup="listbox"
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                activeDepartment
                  ? 'border-dracula-purple bg-dracula-purple/20 text-dracula-purple'
                  : 'border-dracula-current bg-dracula-current/30 text-dracula-fg/80 hover:border-white/30'
              }`}
            >
              <MapPin size={16} />
              {activeDepartment || 'Departamento'}
              <CaretDown
                size={14}
                className={`transition-transform ${showDepartmentDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDepartmentDropdown && (
              <div
                role="listbox"
                aria-label="Departamentos"
                className="glass absolute left-0 top-full z-50 mt-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-white/10 shadow-xl"
              >
                <button
                  role="option"
                  aria-selected={!activeDepartment}
                  onClick={() => {
                    onDepartmentChange(null);
                    setShowDepartmentDropdown(false);
                  }}
                  className="w-full border-b border-white/5 px-4 py-2 text-left text-sm text-dracula-comment hover:bg-white/5"
                >
                  Todos los departamentos
                </button>
                {(departments.length > 0 ? departments : COLOMBIAN_DEPARTMENTS).map((dept) => (
                  <button
                    key={dept}
                    role="option"
                    aria-selected={activeDepartment === dept}
                    onClick={() => {
                      onDepartmentChange(dept);
                      setShowDepartmentDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      activeDepartment === dept
                        ? 'bg-dracula-purple/20 text-dracula-purple'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowDepartmentDropdown(false);
              }}
              aria-expanded={showCategoryDropdown}
              aria-haspopup="listbox"
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                activeCategories.length > 0
                  ? 'border-leader bg-leader/20 text-leader'
                  : 'border-dracula-current bg-dracula-current/30 text-dracula-fg/80 hover:border-white/30'
              }`}
            >
              <Tag size={16} />
              {activeCategories.length > 0 ? `${activeCategories.length} categorias` : 'Categoria'}
              <CaretDown
                size={14}
                className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showCategoryDropdown && (
              <div
                role="listbox"
                aria-label="Categorias"
                aria-multiselectable="true"
                className="glass absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 shadow-xl"
              >
                <div className="p-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      role="option"
                      aria-selected={activeCategories.includes(cat.id)}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeCategories.includes(cat.id)
                          ? 'bg-leader/20 text-leader'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-xs ${
                          activeCategories.includes(cat.id)
                            ? 'border-leader bg-leader text-white'
                            : 'border-dracula-comment'
                        }`}
                      >
                        {activeCategories.includes(cat.id) && '✓'}
                      </span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-2 text-sm text-dracula-red transition-colors hover:text-white"
            >
              <X size={16} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showDepartmentDropdown || showCategoryDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDepartmentDropdown(false);
            setShowCategoryDropdown(false);
          }}
        />
      )}
    </div>
  );
}
