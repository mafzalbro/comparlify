
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star } from "lucide-react";

export default function Loading() {
    return (
        <div className="bg-background">
            <section className="bg-secondary/30 border-b py-16 md:py-24">
                <div className="container">
                    <Skeleton className="h-5 w-48 mb-8" />
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                            <Skeleton className="h-16 w-40" />
                            <span className="text-3xl md:text-5xl font-light text-muted-foreground">vs</span>
                            <Skeleton className="h-16 w-40" />
                        </div>
                        <Skeleton className="h-12 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-full max-w-3xl mx-auto mt-4" />
                    </div>
                </div>
            </section>
            <div className="container max-w-5xl py-16 md:py-24">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </div>
                <section className="my-12 md:my-20 space-y-8">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-64 w-full" />
                </section>
                <section className="my-12 md:my-20 space-y-8">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-80 w-full" />
                </section>
                <section className="my-12 md:my-20 space-y-8">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-96 w-full" />
                </section>
            </div>
        </div>
    )
}
