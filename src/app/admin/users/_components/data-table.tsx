
"use server"

import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import { type User, type Role } from "@prisma/client"
import { columns } from "./columns"

interface UsersDataTableProps {
  search: string
  sort: string
  page: string
  per_page: string
  role?: Role | 'all'
}

async function getUsers({ search, sort, page, per_page, role }: UsersDataTableProps) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  const [column, order] = sort?.split(".") ?? ["createdAt", "desc"];

  let where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role && role !== 'all') {
    where.role = role;
  }
  
  const users: User[] = await prisma.user.findMany({
    where,
    orderBy: { [column]: order },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  })

  const totalUsers = await prisma.user.count({ where });

  return {
    data: users,
    pageCount: Math.ceil(totalUsers / perPageNumber)
  }
}

export async function UsersDataTable(props: UsersDataTableProps) {
  const { data, pageCount } = await getUsers(props)

  return (
      <DataTable columns={columns} data={data} pageCount={pageCount} searchKey="name" />
  )
}
