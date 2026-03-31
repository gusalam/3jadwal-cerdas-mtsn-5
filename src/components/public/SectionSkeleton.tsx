import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => (
  <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px]">
    <Skeleton className="w-full h-full rounded-none" />
    <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 gap-4">
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="h-10 w-80 max-w-full" />
      <Skeleton className="h-4 w-64" />
      <div className="flex gap-3 mt-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CardsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-24 rounded-xl" />
    ))}
  </div>
);

export const GallerySkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="aspect-square rounded-xl" />
    ))}
  </div>
);

export const NewsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export const AnnouncementsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-20 rounded-xl" />
    ))}
  </div>
);

export const VideoSkeleton = () => (
  <div className="space-y-4">
    <div className="text-center space-y-2">
      <Skeleton className="h-6 w-32 mx-auto rounded-full" />
      <Skeleton className="h-8 w-48 mx-auto" />
    </div>
    <Skeleton className="aspect-video w-full rounded-2xl" />
  </div>
);
