import { useState, useMemo } from "react";

const PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const reset = () => setPage(1);

  return {
    items: paginatedItems,
    page: safePage,
    totalPages,
    total: items.length,
    goTo,
    reset,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}
