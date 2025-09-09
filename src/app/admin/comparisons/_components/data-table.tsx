
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type Comparison, type Platform } from "@prisma/client"
import { columns } from "./columns"

interface ComparisonsDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
}

type ComparisonWithPlatforms = Comparison & { platformA: Platform, platformB: Platform };

async function getComparisons({ search, sort, page, per_page }: ComparisonsDataTableProps) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["createdAt", "desc"];

  let where = {};
  if (search) {
      where = {
          title: {
              contains: search,
          }
      }
  }

  const comparisons: ComparisonWithPlatforms[] = await prisma.comparison.findMany({
    where,
    include: { platformA: true, platformB: true },
    orderBy: { [column]: order },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  })

  const totalComparisons = await prisma.comparison.count({ where });

  return {
    data: comparisons,
    pageCount: Math.ceil(totalComparisons / perPageNumber)
  }
}

export async function ComparisonsDataTable(props: ComparisonsDataTableProps) {
  const { data, pageCount } = await getComparisons(props)

  return (
      <DataTable columns={columns} data={data} pageCount={pageCount} searchKey="title" />
  )
}
