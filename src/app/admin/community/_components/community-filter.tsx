'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ForumPostStatus } from "@prisma/client";

const filters: (ForumPostStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export function CommunityFilter({ currentFilter }: { currentFilter?: ForumPostStatus | 'ALL' }) {
    const activeFilter = currentFilter || 'PENDING';

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
                <Button
                    key={filter}
                    asChild
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                >
                    <Link href={`/admin/community?status=${filter}`}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase()}
                    </Link>
                </Button>
            ))}
        </div>
    )
}
