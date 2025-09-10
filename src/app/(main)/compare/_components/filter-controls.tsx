
'use client';

import Link from 'next/link';
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
    const { search, sort } = searchParams;
    const platformsParam = searchParams.platforms;
    const selectedPlatforms = Array.isArray(platformsParam) ? platformsParam : (platformsParam ? [platformsParam] : []);

  return (
    <form className="mb-12 p-4 rounded-2xl bg-card/60 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search"
                name="search"
                placeholder="Search by keyword (e.g. Teachable...)"
                className="pl-10 h-10"
                defaultValue={search}
              />
            </div>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select name="sort" defaultValue={String(sort ?? 'newest')}>
                <SelectTrigger id="sort" className="h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full h-10"><Columns className="mr-2 h-4 w-4"/> Platforms ({selectedPlatforms.length})</Button>
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

        </div>
        <div className="flex justify-end gap-2 mt-4">
            <Button asChild variant="ghost">
              <Link href="/compare">Reset</Link>
            </Button>
            <Button type="submit">Apply</Button>
        </div>
    </form>
  );
}
