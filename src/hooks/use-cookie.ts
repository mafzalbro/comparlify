"use client"

import { useState, useEffect } from "react"

export function useCookie(key: string, defaultValue: string) {
  const [cookie, setCookie] = useState(defaultValue)

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1]
    
    if (value) {
      setCookie(value)
    }
  }, [key])

  const updateCookie = (value: string, options?: any) => {
    let cookieValue = `${key}=${value}; path=/;`;

    if (options) {
      if (options.expires) {
        cookieValue += ` expires=${options.expires};`
      }
      if (options.maxAge) {
        cookieValue += ` max-age=${options.maxAge};`
      }
    } else {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        cookieValue += ` expires=${expiryDate.toUTCString()};`;
    }

    cookieValue += ` SameSite=Lax; Secure`;
    
    document.cookie = cookieValue
    setCookie(value)
  }

  return [cookie, updateCookie] as const
}
