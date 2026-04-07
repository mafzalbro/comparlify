"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommentStatusBadge } from "../../comments/_components/comment-status-badge";
import type { ModerationItem } from "../page";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ModerationActions } from "./moderation-actions";

interface CommunityModerationDataTableProps {
  data: ModerationItem[];
}

export function CommunityModerationDataTable({
  data,
}: CommunityModerationDataTableProps) {
  const columns: ColumnDef<ModerationItem>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant={row.original.type === "TOPIC" ? "default" : "secondary"}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <p className="font-semibold line-clamp-1">
              {item.type === "TOPIC" ? item.title : item.content}
            </p>
            {item.type === "POST" && (
              <p className="text-xs text-muted-foreground">
                in topic: "{item.topic.title}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              by {item.author.name} &bull;{" "}
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <CommentStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ModerationActions item={row.original} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
                No content to moderate.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
