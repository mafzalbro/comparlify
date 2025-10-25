
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container text-center py-8 md:py-12 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Compare' },
            ]}
            className="mb-8 justify-center"
          />
          <Skeleton className="h-14 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mt-4" />
          <Skeleton className="h-6 w-1/2 max-w-3xl mx-auto mt-2" />
        </div>
      </section>
      <div className="container py-8 md:py-12 px-4 md:px-6">
        <div className="mb-12 flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-full md:w-[300px]" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <CardHeader className="p-6">
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent className="flex-1 px-6 pb-6 space-y-3 text-center">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
                <div className="flex justify-around pt-3 border-t">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-muted/50">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
