
"use client"

import { DataTable } from "@/components/data-table"
import { type User } from "@prisma/client"
import { columns } from "./columns"

interface UsersDataTableProps {
  columns: typeof columns,
  data: User[],
  pageCount: number,
  searchKey: string
}

export function UsersDataTable({
  columns,
  data,
  pageCount,
  searchKey
}: UsersDataTableProps) {
  return (
      <DataTable
        columns={columns}
        data={data}
        pageCount={pageCount}
        searchKey={searchKey}
      />
  )
}
