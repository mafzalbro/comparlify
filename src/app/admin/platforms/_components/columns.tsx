
"use client"

import Link from "next/link"
import { type Platform } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"
import { Star } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DeletePlatformButton } from "./delete-platform-button"
import { Button } from "@/components/ui/button"
import { ManagedImage } from "@/components/managed-image"

export const columns: ColumnDef<Platform>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Platform" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
             <ManagedImage src={row.original.logoUrl} alt={row.original.name} width={80} height={20} className="object-contain" />
            <Link href={`/admin/platforms/edit/${row.original.id}`} className="hover:underline font-semibold">{row.original.name}</Link>
        </div>
      )
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
        return (
             <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                {row.original.rating?.toFixed(1) ?? 'N/A'}
            </div>
        )
    },
  },
  {
    accessorKey: "website",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      return (
        <a href={row.original.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm">
            {row.original.website}
        </a>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
         <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/platforms/edit/${row.original.id}`}>Edit</Link>
        </Button>
        <DeletePlatformButton id={row.original.id} />
      </div>
    ),
  },
]
