import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReadonlyURLSearchParams } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createQueryString = (
  params: Record<string, string | number | string[] | null>,
  currentSearchParams: ReadonlyURLSearchParams | URLSearchParams,
): string => {
  const newSearchParams = new URLSearchParams(currentSearchParams.toString());

  for (const [key, value] of Object.entries(params)) {
    if (
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      newSearchParams.delete(key);
    } else if (Array.isArray(value)) {
      // For arrays, we clear the existing key and append new values
      newSearchParams.delete(key);
      value.forEach((v) => newSearchParams.append(key, v));
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
};
