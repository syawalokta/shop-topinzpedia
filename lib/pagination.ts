/** Utilitas pagination bersama untuk seluruh list admin & user. */

export const DEFAULT_PER_PAGE = 10;

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

export function parsePage(value: string | undefined): number {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : 1;
}

export function buildPaged<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number = DEFAULT_PER_PAGE
): Paged<T> {
  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    perPage,
  };
}

/** Hitung skip untuk query Mongo. */
export function pageSkip(page: number, perPage: number = DEFAULT_PER_PAGE) {
  return (page - 1) * perPage;
}
