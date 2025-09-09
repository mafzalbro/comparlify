
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type Platform } from "@prisma/client"
import { columns } from "./columns"

interface PlatformsDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
}

async function getPlatforms({ search, sort, page, per_page }: PlatformsDataTableProps) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["name", "asc"];

  let where = {};
  if (search) {
      where = {
          name: {
              contains: search,
              mode: 'insensitive'
          }
      }
  }

  const platforms: Platform[] = await prisma.platform.findMany({
    where,
    orderBy: { [column]: order },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  })

  const totalPlatforms = await prisma.platform.count({ where });

  return {
    data: platforms,
    pageCount: Math.ceil(totalPlatforms / perPageNumber)
  }
}

export async function PlatformsDataTable(props: PlatformsDataTableProps) {
  const { data, pageCount } = await getPlatforms(props)

  return (
      <DataTable columns={columns} data={data} pageCount={pageCount} searchKey="name" />
  )
}
