export function FeedCardSkeleton() {
  return (
    <div
      className="glass animate-pulse overflow-hidden rounded-2xl border border-white/5"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {/* Image skeleton */}
      <div className="h-52 bg-dracula-current/30" />

      <div className="space-y-4 p-5">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-dracula-current/40" />
          <div className="h-4 w-1/2 rounded bg-dracula-current/30" />
        </div>

        {/* Badge skeleton */}
        <div className="h-16 rounded-xl bg-dracula-current/20" />

        {/* Button skeleton */}
        <div className="h-10 rounded-full bg-dracula-current/30" />
      </div>
    </div>
  );
}

export function FeedSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeedSkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass animate-pulse rounded-xl border border-white/5 p-4"
          aria-busy="true"
          aria-label="Cargando contenido"
        >
          <div className="flex gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-dracula-current/30" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-dracula-current/40" />
              <div className="h-5 w-3/4 rounded bg-dracula-current/30" />
              <div className="h-4 w-full rounded bg-dracula-current/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedSkeletonGrid;
