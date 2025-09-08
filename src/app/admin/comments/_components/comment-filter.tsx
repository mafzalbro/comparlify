'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommentStatus } from "@prisma/client";

const filters: (CommentStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export function CommentFilter({ currentFilter }: { currentFilter?: CommentStatus | 'ALL' }) {
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
                    <Link href={`/admin/comments?status=${filter}`}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase()}
                    </Link>
                </Button>
            ))}
        </div>
    )
}
