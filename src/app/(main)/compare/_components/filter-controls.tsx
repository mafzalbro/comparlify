
'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Columns, ListFilter, X } from 'lucide-react';
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
import type { Platform, ComparisonCategory } from '@prisma/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchParams } from '@/types/next';
import { createQueryString } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


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
    categories: ComparisonCategory[];
    searchParams: SearchParams;
}

export function FilterControls({ allPlatforms, categories, searchParams }: FilterControlsProps) {
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
            search: debouncedSearch || null,
            page: 1,
        });
    }, [debouncedSearch, handleFilterChange]);

    useEffect(() => {
        setSearchValue(String(searchParams.search || ''));
    }, [searchParams.search]);
    
    const sortValue = String(searchParams.sort || 'newest');
    const categoryValue = String(searchParams.category || 'all');
    const platformsParam = searchParams.platforms;
    const selectedPlatforms = Array.isArray(platformsParam) ? platformsParam : (platformsParam ? [platformsParam] : []);

    const handleSortChange = (value: string) => {
        handleFilterChange({ sort: value, page: 1 });
    };
    
    const handleCategoryChange = (value: string) => {
        handleFilterChange({ category: value, page: 1 });
    };

    const handlePlatformChange = (platformId: string, checked: boolean) => {
        const newSelectedPlatforms = checked
            ? [...selectedPlatforms, platformId]
            : selectedPlatforms.filter((id) => id !== platformId);
        
        handleFilterChange({ platforms: newSelectedPlatforms.length > 0 ? newSelectedPlatforms : null, page: 1 });
    };
    
    const hasActiveFilters = !!searchParams.search || searchParams.sort !== 'newest' || selectedPlatforms.length > 0 || categoryValue !== 'all';

    return (
        <div className="mb-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
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

            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="h-10" disabled={isPending}>
                        <ListFilter className="mr-2 h-4 w-4"/> 
                        Filters
                         {(!!searchParams.sort || !!searchParams.platforms || !!searchParams.category) && <span className="ml-2 h-2 w-2 rounded-full bg-primary" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
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
                        <Separator />
                        <div className="space-y-2">
                             <Label htmlFor="category">Category</Label>
                            <Select value={categoryValue} onValueChange={handleCategoryChange} disabled={isPending}>
                                <SelectTrigger id="category" className="h-10">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                         <div className="space-y-2">
                             <Label>Filter by Platform</Label>
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
                    </div>
                </PopoverContent>
            </Popover>

            {hasActiveFilters && (
                 <Button asChild variant="ghost" className="h-10" >
                    <Link href="/compare" scroll={false}><X className="mr-2 h-4 w-4"/>Reset</Link>
                </Button>
            )}
        </div>
    );
}
