import { Skeleton } from '../ui/skeleton';

/** Placeholder de carregamento de um card de aviso. */
export function AvisoCardSkeleton() {
  return (
    <div className="rounded-2xl border border-wave-100 bg-white/70 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-5/6" />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function AvisosListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <AvisoCardSkeleton key={i} />
      ))}
    </div>
  );
}
