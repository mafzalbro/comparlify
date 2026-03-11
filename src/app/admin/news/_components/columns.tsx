"use client";

import Link from "next/link";
import { type NewsArticle, type User, type Platform } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { DeleteNewsArticleButton } from "./delete-article-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ArticleWithRelations = NewsArticle & {
  author: User;
  platforms: Platform[];
};

export const columns: ColumnDef<ArticleWithRelations>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1">
          <span className="max-w-[500px] truncate font-black uppercase tracking-tight">
            <Link
              href={`/admin/news/edit/${row.original.id}`}
              className="hover:text-primary transition-colors"
            >
              {row.getValue("title")}
            </Link>
          </span>
          <div className="flex flex-wrap gap-1">
            {row.original.platforms.map((p) => (
              <Badge
                key={p.id}
                variant="outline"
                className="text-[8px] px-2 py-0 h-4 bg-primary/5 border-primary/10"
              >
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-bold text-xs">{row.original.author.name}</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isPublished: boolean = row.getValue("published");
      return (
        <Badge
          className={
            isPublished
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          }
          variant="outline"
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.createdAt), "PP")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={`/admin/news/edit/${row.original.id}`}>Edit</Link>
        </Button>
        <DeleteNewsArticleButton id={row.original.id} />
      </div>
    ),
  },
];
