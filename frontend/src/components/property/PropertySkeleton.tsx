import { motion } from 'framer-motion';

export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
      {/* Image skeleton */}
      <div className="aspect-[4/3] skeleton" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 skeleton rounded-lg" />
        
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 skeleton rounded" />
          <div className="h-4 w-12 skeleton rounded" />
          <div className="h-4 w-16 skeleton rounded" />
        </div>
        
        <div className="h-12 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
