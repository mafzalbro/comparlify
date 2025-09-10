
"use client"

import { type ContactMessage } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns';
import { cn } from "@/lib/utils"

import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox";
import { MessageActions } from "./message-actions";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<ContactMessage>[] = [
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
        name="messageIds"
        value={row.original.id}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From" />
    ),
    cell: ({ row }) => {
      return (
        <div className={cn(!row.original.read && "font-bold")}>
            <p>{row.original.name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-xl">
            <p className={cn("truncate", !row.original.read && "font-bold")}>{row.original.message}</p>
        </div>
      )
    },
  },
   {
    accessorKey: "read",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isRead = row.getValue("read")
      return (
        <Badge variant={isRead ? 'secondary' : 'default'} className={cn(!isRead && 'bg-blue-500 hover:bg-blue-600')}>
          {isRead ? 'Read' : 'Unread'}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Received" />
    ),
    cell: ({ row }) => format(new Date(row.original.createdAt), 'Pp'),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <MessageActions message={row.original} />
      </div>
    ),
  },
]
