
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type Post, type User } from "@prisma/client"
import { columns } from "./columns"

interface BlogPostsDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
}

type PostWithAuthor = Post & { author: User };

async function getPosts({ search, sort, page, per_page }: BlogPostsDataTableProps) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["createdAt", "desc"];

  let where = {};
  if (search) {
      where = {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { name: { contains: search, mode: 'insensitive' } } },
          ]
      }
  }

  const posts: PostWithAuthor[] = await prisma.post.findMany({
    where,
    include: { author: true },
    orderBy: { [column]: order },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  })

  const totalPosts = await prisma.post.count({ where });

  return {
    data: posts,
    pageCount: Math.ceil(totalPosts / perPageNumber)
  }
}

export async function BlogPostsDataTable(props: BlogPostsDataTableProps) {
  const { data, pageCount } = await getPosts(props)

  return (
      <DataTable columns={columns} data={data} pageCount={pageCount} searchKey="title" />
  )
}
