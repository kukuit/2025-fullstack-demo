// app/components/admin/table/AdminTablePagination.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface AdminTablePaginationProps {
  /** Trang hiện tại (1-based) */
  page: number;
  /** Số item mỗi trang */
  pageSize: number;
  /** Tổng số item */
  total: number;
  /** Đổi trang */
  onPageChange: (page: number) => void;
  /** Custom class nếu cần */
  className?: string;
}

/**
 * Pagination chuẩn:
 * - "Showing x–y of total"
 * - Prev / Next
 * - Disable khi ở đầu/cuối
 */
export default function AdminTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const clampedPage = Math.min(Math.max(page, 1), totalPages);

  const start = total === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, clampedPage * pageSize);

  const canPrev = clampedPage > 1;
  const canNext = clampedPage < totalPages;

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Summary: Showing x–y of total */}
      <p className="text-sm text-gray-600">
        {total === 0 ? "No records" : `Showing ${start}-${end} of ${total}`}
      </p>

      {/* Nút Prev / Next */}
      <div className="inline-flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(clampedPage - 1)}
          disabled={!canPrev}
          className={clsx(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium",
            canPrev
              ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
          )}
        >
          Prev
        </button>

        <span className="text-sm text-gray-500">
          Page <span className="font-medium">{clampedPage}</span> /{" "}
          <span className="font-medium">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => canNext && onPageChange(clampedPage + 1)}
          disabled={!canNext}
          className={clsx(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium",
            canNext
              ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
