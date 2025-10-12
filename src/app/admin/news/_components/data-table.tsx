
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type NewsArticle, type User } from "@prisma/client"
import { columns } from "./columns"

interface NewsArticlesDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
}

type ArticleWithAuthor = NewsArticle & { author: User };

async function getArticles({ search, sort, page, per_page }: NewsArticlesDataTableProps) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["createdAt", "desc"];

  let where = {};
  if (search) {
      where = {
          title: {
              contains: search,
              mode: 'insensitive'
          }
      }
  }

  const articles: ArticleWithAuthor[] = await prisma.newsArticle.findMany({
    where,
    include: { author: true },
    orderBy: { [column]: order },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  })

  const totalArticles = await prisma.newsArticle.count({ where });

  return {
    data: articles,
    pageCount: Math.ceil(totalArticles / perPageNumber)
  }
}

export async function NewsArticlesDataTable(props: NewsArticlesDataTableProps) {
  const { data, pageCount } = await getArticles(props)

  return (
      <DataTable columns={columns} data={data} pageCount={pageCount} searchKey="title" />
  )
}
