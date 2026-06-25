"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "exobe_compare";
const MAX_COMPARE = 4;

function readCompareList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external system, on mount
    setIds(readCompareList());
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId].slice(-MAX_COMPARE);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isComparing = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, isComparing };
}
