import type { FeedItem } from '../../types/feed';
import FeedFilters from './FeedFilters';
import FeedItemComponent from './FeedItem';
import FeedEmpty from './FeedEmpty';
import { FeedSkeletonGrid } from './FeedSkeleton';
import { useFeed } from './useFeed';

interface FeedContainerProps {
  initialItems?: FeedItem[];
  initialCursor?: string | null;
}

export default function FeedContainer({
  initialItems = [],
  initialCursor = null,
}: FeedContainerProps) {
  const {
    items,
    isLoading,
    isInitialLoading,
    error,
    hasMore,
    activeTypes,
    activeDepartment,
    activeCategories,
    departments,
    hasActiveFilters,
    setActiveTypes,
    setActiveDepartment,
    setActiveCategories,
    handleClearFilters,
    fetchFeed,
    loadMoreRef,
  } = useFeed({ initialItems, initialCursor });

  return (
    <div className="min-h-screen">
      {/* Filters */}
      <FeedFilters
        activeTypes={activeTypes}
        activeDepartment={activeDepartment}
        activeCategories={activeCategories}
        departments={departments}
        onTypesChange={setActiveTypes}
        onDepartmentChange={setActiveDepartment}
        onCategoriesChange={setActiveCategories}
        onClearAll={handleClearFilters}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Error state */}
        {error && (
          <div className="glass mb-8 rounded-xl border border-dracula-red/30 p-6 text-center">
            <p className="mb-4 text-dracula-red">{error}</p>
            <button
              onClick={() => fetchFeed()}
              className="rounded-full border border-dracula-red/50 bg-dracula-red/20 px-4 py-2 text-sm text-white transition-colors hover:bg-dracula-red/30"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Initial loading */}
        {isInitialLoading && <FeedSkeletonGrid count={6} />}

        {/* Empty state */}
        {!isInitialLoading && !isLoading && items.length === 0 && !error && (
          <FeedEmpty hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        )}

        {/* Feed grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <FeedItemComponent key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-20" />

        {/* Loading more indicator */}
        {isLoading && !isInitialLoading && (
          <div className="py-8">
            <FeedSkeletonGrid count={3} />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && items.length > 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-dracula-comment">Has llegado al final del feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
