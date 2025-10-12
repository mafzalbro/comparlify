
'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { createQueryString } from '@/lib/utils';
import type { Role } from '@prisma/client';

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

export function UserFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
    const [roleValue, setRoleValue] = useState(searchParams.get('role') || 'all');
    const debouncedSearch = useDebounce(searchValue, 300);

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        startTransition(() => {
            const newQueryString = createQueryString(params, searchParams);
            router.push(`${pathname}?${newQueryString}`, { scroll: false });
        });
    }, [pathname, router, searchParams]);

    useEffect(() => {
        handleFilterChange({
            search: debouncedSearch || null,
            page: 1,
        });
    }, [debouncedSearch, handleFilterChange]);

    useEffect(() => {
        handleFilterChange({
            role: roleValue === 'all' ? null : roleValue,
            page: 1,
        });
    }, [roleValue, handleFilterChange]);
    
    const hasActiveFilters = searchParams.get('search') || searchParams.get('role');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="search"
                        name="search"
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Filter by Role</Label>
                <Select value={roleValue} onValueChange={setRoleValue}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end gap-2">
                {hasActiveFilters && (
                     <Button asChild variant="ghost" className="w-full">
                        <Link href="/admin/users" scroll={false}>
                            <X className="mr-2 h-4 w-4" />Reset
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
