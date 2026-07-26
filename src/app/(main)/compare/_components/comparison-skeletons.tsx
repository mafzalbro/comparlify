import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ComparisonCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full overflow-hidden border border-border/40 bg-card/40 backdrop-blur-md rounded-3xl shadow-sm">
          <div className="h-44 bg-muted/20 relative flex items-center justify-around px-8">
            <Skeleton className="h-14 w-28 rounded-xl" />
            <div className="h-8 w-8 rounded-full bg-border/20 flex items-center justify-center">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-14 w-28 rounded-xl" />
          </div>
          <CardContent className="flex-1 p-6 text-center space-y-4">
            <Skeleton className="h-6 w-3/4 mx-auto rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 mx-auto rounded-md" />
            </div>
            <div className="grid grid-cols-2 bg-background/30 rounded-xl border border-border/30 p-3 gap-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-10 mx-auto rounded-md" />
                <Skeleton className="h-3 w-16 mx-auto rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-10 mx-auto rounded-md" />
                <Skeleton className="h-3 w-16 mx-auto rounded-md" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-center">
            <Skeleton className="h-11 w-4/5 rounded-2xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
