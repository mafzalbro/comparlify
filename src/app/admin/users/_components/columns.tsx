
"use client"

import { type User } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, X } from "lucide-react"
import { format } from 'date-fns';

import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleSwitcher } from "./role-switcher"
import { useSession } from "next-auth/react"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={row.original.image ?? undefined} alt={row.original.name ?? ''} />
                <AvatarFallback>{row.original.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium">{row.original.name}</p>
                <p className="text-sm text-muted-foreground">{row.original.email}</p>
            </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const { data: session } = useSession();
      return (
        <RoleSwitcher user={row.original} currentUserId={session?.user.id} />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "newsletter",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subscribed" />
    ),
    cell: ({ row }) => {
      return row.original.newsletter ? (
          <Check className="h-5 w-5 text-green-500" />
      ) : (
          <X className="h-5 w-5 text-muted-foreground" />
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => format(new Date(row.original.createdAt), 'P'),
  },
]
