// app/components/admin/table/AdminTableShell.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface AdminTableShellProps {
  /** Header phía trên (thường dùng AdminTableHeader) */
  header?: React.ReactNode;
  /** Chính là table hoặc list (UsersTable, TemplatesTable, ...) */
  children: React.ReactNode;
  /** Khu vực pagination / actions phía dưới */
  footer?: React.ReactNode;
  /** Thêm className nếu cần custom */
  className?: string;
}

/**
 * Khung chuẩn cho mọi bảng admin:
 * - Bo góc, border, nền trắng
 * - Header ở trên
 * - Table nằm trong vùng scroll ngang (overflow-x-auto)
 * - Footer (pagination) ở dưới, không bị ảnh hưởng bởi overflow
 */
export default function AdminTableShell({
  header,
  children,
  footer,
  className,
}: AdminTableShellProps) {
  return (
    <section
      className={clsx(
        "bg-white rounded-lg border border-gray-200 shadow-sm p-4",
        className
      )}
    >
      {header && <div className="mb-3">{header}</div>}

      {/* Vùng table scroll ngang */}
      <div className="overflow-x-auto">{children}</div>

      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}
