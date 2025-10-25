
import prisma from "@/lib/prisma";
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumb';
import { ManagedImage } from '@/components/managed-image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

export const metadata: Metadata = generateSeoMetadata({
  title: 'Image Gallery',
  description: 'A gallery of all uploaded images.',
  path: '/gallery',
});


async function getImages() {
  return prisma.image.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function GalleryPage() {
  const images = await getImages();

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-16 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Gallery' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
              Image Gallery
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              A collection of all media uploaded to the site.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 md:px-6">
        {images.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <h3 className="text-2xl font-headline mb-2">No Images Found</h3>
            <p>The gallery is empty. Upload some images in the admin panel.</p>
          </div>
        ) : (
          <Dialog>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {images.map((image) => (
                <DialogTrigger key={image.id} asChild>
                  <button
                    className="relative aspect-square block w-full rounded-lg overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all group"
                    aria-label={`View larger image for ${image.altText || image.filename}`}
                  >
                    <ManagedImage
                      src={image.url}
                      alt={image.altText || image.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs text-center p-1 truncate">{image.altText || image.filename}</p>
                    </div>
                  </button>
                </DialogTrigger>
              ))}
            </div>
            {/* The DialogContent can be a future enhancement to show a larger view */}
            {/* For now, it's just a placeholder to make the trigger work */}
             <DialogContent className="max-w-4xl h-auto">
                 <p className="text-center p-8">Image preview could be implemented here.</p>
             </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

