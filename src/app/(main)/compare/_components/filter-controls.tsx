
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Columns } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Platform } from '@prisma/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchParams } from '@/types/next';

interface FilterControlsProps {
    allPlatforms: Platform[];
    searchParams: SearchParams;
}

export function FilterControls({ allPlatforms, searchParams }: FilterControlsProps) {
    const router = useRouter();

    const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams();

        const search = formData.get('search') as string;
        if (search) params.set('search', search);

        const sort = formData.get('sort') as string;
        if (sort) params.set('sort', sort);

        const platforms = formData.getAll('platforms') as string[];
        platforms.forEach(p => params.append('platforms', p));
        
        router.push(`/compare?${params.toString()}`, { scroll: false });
    };
    
    const { search, sort } = searchParams;
    const platformsParam = searchParams.platforms;
    const selectedPlatforms = Array.isArray(platformsParam) ? platformsParam : (platformsParam ? [platformsParam] : []);

  return (
    <form className="mb-12 p-4 rounded-lg bg-card/60 border" onChange={handleFormChange}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              name="search"
              placeholder="Search by keyword (e.g. Teachable...)"
              className="pl-10 h-10"
              defaultValue={search}
            />
          </div>

           <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="gap-2 h-10"><ListFilter className="h-4 w-4"/> Sort</Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
                <div className="space-y-2">
                    <Label htmlFor="sort">Sort By</Label>
                     <Select name="sort" defaultValue={String(sort ?? 'newest')}>
                      <SelectTrigger id="sort">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="gap-2 h-10"><Columns className="h-4 w-4"/> Platforms</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Filter by Platform</h4>
                   <ScrollArea className="h-48">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-1">
                        {allPlatforms.map(platform => (
                          <div key={platform.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`platform-${platform.id}`}
                              name="platforms"
                              value={platform.id}
                              defaultChecked={selectedPlatforms.includes(platform.id)}
                            />
                            <Label htmlFor={`platform-${platform.id}`} className="font-normal text-sm cursor-pointer">{platform.name}</Label>
                          </div>
                        ))}
                      </div>
                  </ScrollArea>
                </div>
            </PopoverContent>
          </Popover>

          <Button asChild variant="ghost" className="h-10">
            <Link href="/compare">Reset</Link>
          </Button>
        </div>
    </form>
  );
}
