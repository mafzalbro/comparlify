
"use client"

import Link from "next/link"
import { type Comparison, type Platform } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DeleteComparisonButton } from "./delete-comparison-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ComparisonWithPlatforms = Comparison & { platformA: Platform, platformB: Platform };


export const columns: ColumnDef<ComparisonWithPlatforms>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Link href={`/admin/comparisons/edit/${row.original.id}`} className="hover:underline">
                {row.getValue("title")}
            </Link>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "platforms",
    header: "Platforms",
    cell: ({ row }) => {
        return <span>{row.original.platformA.name} vs {row.original.platformB.name}</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: "published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isPublished: boolean = row.getValue("published")
      return (
        <Badge variant={isPublished ? 'default' : 'secondary'}>
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
         <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/comparisons/edit/${row.original.id}`}>Edit</Link>
        </Button>
        <DeleteComparisonButton id={row.original.id} />
      </div>
    ),
  },
]
