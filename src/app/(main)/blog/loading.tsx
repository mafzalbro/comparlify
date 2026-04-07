
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-16 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Blog' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-full mt-4" />
            <Skeleton className="h-6 w-2/3 mt-2" />
          </div>
        </div>
      </section>
      <div className="container py-8 md:py-12 px-4 md:px-6">
        <div className="mb-12 flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-full md:w-[300px]" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <Skeleton className="aspect-16/10 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter className="bg-muted/50 py-3 px-6">
                 <Skeleton className="h-6 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
