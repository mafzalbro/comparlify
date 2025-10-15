
'use client';

import { useState, useEffect, useCallback } from 'react';

interface RateLimiterOptions {
  limit: number;
  window: number; // in milliseconds
}

const getStoredTimestamps = (key: string): number[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return [];
    const timestamps = JSON.parse(item);
    return Array.isArray(timestamps) ? timestamps : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

const setStoredTimestamps = (key: string, timestamps: number[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(timestamps));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};

export function useRateLimiter({ limit, window: timeWindow }: RateLimiterOptions) {
  const localStorageKey = `rate-limit-queries`;
  const [timestamps, setTimestamps] = useState<number[]>([]);

  useEffect(() => {
    setTimestamps(getStoredTimestamps(localStorageKey));
  }, [localStorageKey]);

  const getValidTimestamps = useCallback((currentTimestamps: number[]) => {
    const now = Date.now();
    return currentTimestamps.filter(ts => now - ts < timeWindow);
  }, [timeWindow]);

  const isAllowed = useCallback((): boolean => {
    const validTimestamps = getValidTimestamps(timestamps);
    return validTimestamps.length < limit;
  }, [timestamps, limit, getValidTimestamps]);
  
  const recordQuery = useCallback(() => {
    const now = Date.now();
    const currentTimestamps = getStoredTimestamps(localStorageKey);
    const validTimestamps = getValidTimestamps(currentTimestamps);
    const newTimestamps = [...validTimestamps, now];
    
    setStoredTimestamps(localStorageKey, newTimestamps);
    setTimestamps(newTimestamps);
  }, [localStorageKey, getValidTimestamps]);

  const timeUntilNextQuery = useCallback((): number => {
    const validTimestamps = getValidTimestamps(timestamps);
    if (validTimestamps.length < limit) {
      return 0;
    }
    const oldestTimestamp = validTimestamps[0];
    const timePassed = Date.now() - oldestTimestamp;
    return timeWindow - timePassed;
  }, [timestamps, limit, timeWindow, getValidTimestamps]);

  return { isAllowed, recordQuery, timeUntilNextQuery };
}
