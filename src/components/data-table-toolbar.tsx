
"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import Link from "next/link";

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  searchKey?: string
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "title"
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 300);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  useEffect(() => {
    const newQueryString = createQueryString({
      search: debouncedSearch || null,
      page: 1,
    });
    router.push(`${pathname}?${newQueryString}`, { scroll: false });
  }, [debouncedSearch, router, pathname, createQueryString]);

  // Sync searchValue with URL search params
  useEffect(() => {
    setSearchValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  const hasSearchFilter = !!searchParams.get('search');

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Search by ${searchKey}...`}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {hasSearchFilter && (
            <Button asChild variant="ghost" className="h-8 px-2 lg:px-3">
              <Link href={pathname} scroll={false}>
                  Reset
                  <Cross2Icon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
