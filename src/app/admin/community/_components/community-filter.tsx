
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ForumPostStatus } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

const filters: (ForumPostStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export function CommunityFilter({ currentFilter }: { currentFilter: ForumPostStatus | 'ALL' }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const activeFilter = currentFilter || 'PENDING';
    const hasActiveFilters = !!searchParams.get('status');

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {filters.map(filter => (
                <Button
                    key={filter}
                    asChild
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                >
                    <Link href={`/admin/community?status=${filter}`} scroll={false}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase()}
                    </Link>
                </Button>
            ))}
             {hasActiveFilters && (
                 <Button asChild variant="ghost" size="sm" >
                    <Link href={pathname} scroll={false}><X className="mr-2 h-4 w-4"/>Reset</Link>
                </Button>
            )}
        </div>
    )
}
