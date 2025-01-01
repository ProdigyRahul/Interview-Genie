export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-muted rounded-lg animate-pulse space-y-2"
          >
            <div className="h-4 w-1/2 bg-muted-foreground/15 rounded" />
            <div className="h-8 w-3/4 bg-muted-foreground/15 rounded" />
          </div>
        ))}
      </div>

      {/* Feature nav skeleton */}
      <div className="py-4">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 bg-muted rounded-lg animate-pulse space-y-2"
            >
              <div className="h-4 w-1/3 bg-muted-foreground/15 rounded" />
              <div className="h-4 w-2/3 bg-muted-foreground/15 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions and activity skeleton */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-muted rounded-lg animate-pulse space-y-2"
            >
              <div className="h-4 w-1/4 bg-muted-foreground/15 rounded" />
              <div className="h-4 w-1/2 bg-muted-foreground/15 rounded" />
            </div>
          ))}
        </div>
        <div className="md:col-span-3 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-muted rounded-lg animate-pulse space-y-2"
            >
              <div className="h-4 w-1/3 bg-muted-foreground/15 rounded" />
              <div className="h-4 w-2/3 bg-muted-foreground/15 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 