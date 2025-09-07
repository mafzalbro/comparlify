import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

async function getComparisonData() {
  const platforms = await prisma.platform.findMany({
    include: {
      features: {
        include: {
          feature: true,
        },
        orderBy: {
          feature: {
            name: 'asc',
          },
        },
      },
    },
  });

  const features = await prisma.feature.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return { platforms, features };
}

export default async function ComparePage() {
  const { platforms, features } = await getComparisonData();

  const platformFeatureMap = new Map(
    platforms.map((p) => [
      p.id,
      new Map(p.features.map((f) => [f.feature.name, f])),
    ])
  );

  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24 px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Platform Comparison
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            We've analyzed the top course creation platforms so you don't have
            to. Find the perfect fit for your business.
          </p>
        </div>

        <TooltipProvider>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-max border-collapse border border-border">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px] p-4 font-headline text-lg text-foreground border-r">
                    Features
                  </TableHead>
                  {platforms.map((platform) => (
                    <TableHead
                      key={platform.id}
                      className="w-[200px] text-center p-4 border-r"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {/* The logo files will be added in a future step */}
                        {/* <Image
                          src={platform.logoUrl}
                          alt={`${platform.name} logo`}
                          width={120}
                          height={30}
                          className="object-contain"
                        /> */}
                        <h3 className="font-bold text-lg text-foreground">{platform.name}</h3>
                        <Button asChild size="sm" variant="outline">
                            <Link href={platform.website} target="_blank">Visit Site</Link>
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => (
                  <TableRow key={feature.id} className="border-t">
                    <TableCell className="font-medium p-4 text-foreground border-r">
                      {feature.name}
                    </TableCell>
                    {platforms.map((platform) => {
                      const platformFeatures = platformFeatureMap.get(
                        platform.id
                      );
                      const platformFeature = platformFeatures?.get(
                        feature.name
                      );

                      return (
                        <TableCell
                          key={platform.id}
                          className="text-center p-4 border-r"
                        >
                          <div className="flex justify-center items-center h-full">
                            {platformFeature?.hasFeature ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-2 cursor-help text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                    {platformFeature.details && (
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{platformFeature.details || 'Feature is supported'}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                               <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className='cursor-help'>
                                    <XCircle className="h-6 w-6 text-red-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Feature is not supported</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
         <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>This is a simplified comparison. For a full list of features, please visit each platform's official website.</p>
        </div>
      </div>
    </div>
  );
}
