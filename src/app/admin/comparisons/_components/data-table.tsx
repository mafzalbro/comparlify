
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type Comparison, type Platform } from "@prisma/client"
import { columns } from "./columns"
import { auth } from "@/lib/auth";

interface ComparisonsDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
}

type ComparisonWithPlatforms = Comparison & { platformA: Platform, platformB: Platform };

async function getComparisons({ search, sort, page, per_page }: ComparisonsDataTableProps) {
  const session = await auth();
  if (!session) {
      return { data: [], pageCount: 0 };
  }
  
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["createdAt", "desc"];

  let where: any = {};
  if (search) {
      where.OR = [
        { title: { contains: search } },
        { platformA: { name: { contains: search } } },
        { platformB: { name: { contains: search } } },
      ]
  }
  
  // Note: Comparisons don't have an author field, so we can't filter by author.
  // Authors will see all comparisons, but can only create/edit.
  // This logic could be extended if an authorId is added to the Comparison model.

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
