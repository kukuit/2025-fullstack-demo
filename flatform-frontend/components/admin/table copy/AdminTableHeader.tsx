// app/components/admin/table/AdminTableHeader.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface AdminTableHeaderProps {
  /** Tiêu đề chính (Users, Templates, Products, ...) */
  title?: string;
  /** Mô tả ngắn dưới title (optional) */
  description?: string;
  /** Bên trái: bạn có thể truyền filter nhỏ, badge, ... */
  leftExtra?: React.ReactNode;
  /** Bên phải: thường là ô search, nút Add, filter nâng cao, ... */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Header linh hoạt cho phần bảng admin.
 * Dùng được cho nhiều module: Users, Templates, Products,...
 */
export default function AdminTableHeader({
  title,
  description,
  leftExtra,
  right,
  className,
}: AdminTableHeaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {title && (
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        )}
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {leftExtra && <div>{leftExtra}</div>}
      </div>

      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
