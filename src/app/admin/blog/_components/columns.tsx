
"use client"

import Link from "next/link"
import { type Post, type User } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, X } from "lucide-react"
import { format } from 'date-fns';

import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DeletePostButton } from "./delete-post-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type PostWithAuthor = Post & { author: User };

export const columns: ColumnDef<PostWithAuthor>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Link href={`/admin/blog/edit/${row.original.id}`} className="hover:underline">
                {row.getValue("title")}
            </Link>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
        return <span>{row.original.author.name}</span>
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
    cell: ({ row }) => format(new Date(row.original.createdAt), 'P'),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
         <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/blog/edit/${row.original.id}`}>Edit</Link>
        </Button>
        <DeletePostButton id={row.original.id} />
      </div>
    ),
  },
]
