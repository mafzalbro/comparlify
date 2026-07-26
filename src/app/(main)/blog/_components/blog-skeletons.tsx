import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full overflow-hidden border border-border/40 bg-card/40 backdrop-blur-md rounded-3xl shadow-sm">
          <div className="relative aspect-16/11 w-full bg-muted/20">
            <Skeleton className="absolute inset-0 w-full h-full" />
          </div>
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-3 w-12 rounded-full" />
              <div className="w-1 h-1 rounded-full bg-border/40" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-5/6 rounded-md mb-2" />
            <Skeleton className="h-6 w-2/3 rounded-md" />
          </CardHeader>
          <CardContent className="px-6 py-2 flex-1">
            <Skeleton className="h-4 w-full rounded-md mb-2" />
            <Skeleton className="h-4 w-11/12 rounded-md mb-2" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function BlogFeaturedSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/20 shadow-sm h-full lg:min-h-[380px] animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-7 bg-muted/20 relative h-[250px] lg:h-full">
          <Skeleton className="absolute inset-0 w-full h-full" />
        </div>
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-11/12 rounded-md" />
          <Skeleton className="h-8 w-3/4 rounded-md" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
          <Skeleton className="h-4 w-28 rounded-md pt-4" />
        </div>
      </div>
    </div>
  );
}
