"use client";

import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import AdminTableHeader from "./AdminTableHeader";
import AdminTableShell from "./AdminTableShell";

interface AdminTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  mobileRender?: (item: T) => React.ReactNode;
}

export default function AdminTable<T>({
  data,
  columns,
  mobileRender,
}: AdminTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <AdminTableShell>
      {/* ===== Mobile/List (sm) ===== */}
      {mobileRender && (
        <div className="md:hidden space-y-3">
          {data.map((item, index) => (
            <React.Fragment key={index}>{mobileRender(item)}</React.Fragment>
          ))}
        </div>
      )}

      {/* ===== Desktop/Table (md+) ===== */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full table-fixed divide-y divide-gray-100 text-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <AdminTableHeader
              key={headerGroup.id}
              headers={headerGroup.headers}
            />
          ))}
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`whitespace-nowrap px-4 py-3 text-gray-800
                      ${
                        cell.column.id === "actions"
                          ? "text-center w-[140px]"
                          : "w-1/4"
                      }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableShell>
  );
}
