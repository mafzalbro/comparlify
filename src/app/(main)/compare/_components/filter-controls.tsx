
'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Columns } from 'lucide-react';
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
import { createQueryString } from '@/lib/utils';


function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface FilterControlsProps {
    allPlatforms: Platform[];
    searchParams: SearchParams;
}

export function FilterControls({ allPlatforms, searchParams }: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(String(searchParams.search || ''));
    const debouncedSearch = useDebounce(searchValue, 300);

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        startTransition(() => {
            const currentSearchParams = new URLSearchParams(window.location.search);
            const newQueryString = createQueryString(params, currentSearchParams);
            router.push(`${pathname}?${newQueryString}`, { scroll: false });
        });
    }, [pathname, router]);


    useEffect(() => {
        handleFilterChange({
            search: debouncedSearch || null, // Pass null to remove from URL if empty
            page: 1,
        });
    }, [debouncedSearch]);
    
    const sortValue = String(searchParams.sort || 'newest');
    const platformsParam = searchParams.platforms;
    const selectedPlatforms = Array.isArray(platformsParam) ? platformsParam : (platformsParam ? [platformsParam] : []);

    const handleSortChange = (value: string) => {
        handleFilterChange({ sort: value, page: 1 });
    };

    const handlePlatformChange = (platformId: string, checked: boolean) => {
        const newSelectedPlatforms = checked
            ? [...selectedPlatforms, platformId]
            : selectedPlatforms.filter((id) => id !== platformId);
        
        handleFilterChange({ platforms: newSelectedPlatforms.length > 0 ? newSelectedPlatforms : null, page: 1 });
    };

    return (
        <div className="mb-12 p-6 rounded-2xl bg-card border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="search"
                            name="search"
                            placeholder="Search by keyword..."
                            className="pl-10 h-10"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="sort">Sort By</Label>
                    <Select value={sortValue} onValueChange={handleSortChange} disabled={isPending}>
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
                
                <div className="space-y-2">
                    <Label>Platforms</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="w-full h-10" disabled={isPending}>
                                <Columns className="mr-2 h-4 w-4"/> 
                                Platforms ({selectedPlatforms.length})
                            </Button>
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
                                                checked={selectedPlatforms.includes(platform.id)}
                                                onCheckedChange={(checked) => handlePlatformChange(platform.id, !!checked)}
                                                disabled={isPending}
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

                <div className="flex items-end gap-2">
                    <Button asChild variant="outline" className="w-full h-10">
                        <Link href="/compare" scroll={false}>Reset All</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
