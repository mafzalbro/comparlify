
'use client';

import * as React from "react"
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CommentStatusBadge } from './comment-status-badge';
import type { Comment, Post, User } from '@prisma/client';
import { CommentActions } from './comment-actions';
import { bulkUpdateCommentStatusAction } from '@/app/actions/comments';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type CommentWithRelations = Comment & { author: User, post: Post };

interface CommentsDataTableProps {
  data: CommentWithRelations[];
}

function BulkActions({ selectedRowCount }: { selectedRowCount: number }) {
    const { pending } = useFormStatus();

    return (
        <div className="flex items-center gap-2">
            <Button name="status" value="APPROVED" size="sm" disabled={pending || selectedRowCount === 0}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Approve ({selectedRowCount})
            </Button>
            <Button name="status" value="REJECTED" size="sm" variant="destructive" disabled={pending || selectedRowCount === 0}>
                 {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reject ({selectedRowCount})
            </Button>
        </div>
    )
}

export function CommentsDataTable({ data }: CommentsDataTableProps) {
  const { toast } = useToast();
  const [rowSelection, setRowSelection] = React.useState({})
  const [state, formAction] = useActionState(bulkUpdateCommentStatusAction, { error: null, success: null });

  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.success,
      });
      table.resetRowSelection();
    }
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const columns: ColumnDef<CommentWithRelations>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
          name="commentIds"
          value={row.original.id}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'content',
      header: 'Comment',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-muted-foreground line-clamp-3">{row.original.content}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{new Date(row.original.createdAt).toLocaleString()}</p>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => <div className="font-medium">{row.original.author.name}</div>,
    },
    {
      accessorKey: 'post',
      header: 'In Response To',
      cell: ({ row }) => (
        <Link href={`/blog/${row.original.post.slug}`} className="text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
          {row.original.post.title}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <CommentStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <CommentActions comment={row.original} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: true,
    state: {
      rowSelection,
    },
  });

  return (
    <form action={formAction}>
      <div className="flex items-center justify-between py-4">
        <BulkActions selectedRowCount={table.getFilteredSelectedRowModel().rows.length} />
        <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No comments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex-1 text-sm text-muted-foreground pt-4">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
    </form>
  )
}
