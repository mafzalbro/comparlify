
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <article>
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 flex items-center justify-center text-center overflow-hidden h-[80vh]">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        <div className="relative container max-w-4xl z-10">
          <Skeleton className="h-5 w-48 mx-auto mb-6" />
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-16 w-3/4 mx-auto mt-4" />
          <Skeleton className="h-7 w-full max-w-2xl mx-auto mt-4" />
          <div className="mt-8 flex items-center justify-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-6xl py-12 md:py-16">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-32 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Skeleton>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <div className="py-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-full mt-4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-1/2 mt-2" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
