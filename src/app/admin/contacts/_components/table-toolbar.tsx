
"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table-view-options"
import { statuses } from "../data/data"
import { DataTableFacetedFilter } from "./table-faceted-filter"
import { bulkDeleteContactMessages } from "@/app/actions/contact"
import { useToast } from "@/hooks/use-toast"
import { useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function ContactsTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDeleteSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const messageIds = selectedRows.map(row => (row.original as any).id);

    startTransition(async () => {
        const result = await bulkDeleteContactMessages(messageIds);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: `${messageIds.length} message(s) deleted.` });
            table.resetRowSelection();
        }
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter messages..."
          value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("message")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("read") && (
          <DataTableFacetedFilter
            column={table.getColumn("read")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
