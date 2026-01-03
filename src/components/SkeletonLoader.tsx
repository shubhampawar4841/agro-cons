'use client';

/**
 * Skeleton Loader Component
 * Displays shimmer animation while content is loading
 * Respects prefers-reduced-motion
 */
interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'card' | 'image' | 'button' | 'circle';
}

export default function SkeletonLoader({ className = '', variant = 'text' }: SkeletonLoaderProps) {
  const baseClasses = 'animate-shimmer bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-64 w-full',
    image: 'h-48 w-full aspect-square',
    button: 'h-10 w-24',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Loading..."
      role="status"
    />
  );
}

/**
 * Product Card Skeleton
 * Full skeleton for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Image skeleton */}
      <SkeletonLoader variant="image" className="w-full h-56 rounded-t-xl" />
      
      <div className="p-5 space-y-3">
        {/* Title skeleton */}
        <SkeletonLoader variant="text" className="h-6" />
        <SkeletonLoader variant="text" className="h-4 w-3/4" />
        
        {/* Weight skeleton */}
        <SkeletonLoader variant="text" className="h-3 w-1/2" />
        
        {/* Rating skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} variant="circle" className="h-4 w-4" />
          ))}
        </div>
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <SkeletonLoader variant="text" className="h-6 w-20" />
          <SkeletonLoader variant="button" />
        </div>
      </div>
    </div>
  );
}











