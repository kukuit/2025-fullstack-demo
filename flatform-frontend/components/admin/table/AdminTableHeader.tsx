import React from "react";
import { flexRender, Header } from "@tanstack/react-table";

interface AdminTableHeaderProps<T> {
  headers: Header<T, unknown>[];
}

export default function AdminTableHeader<T>({
  headers,
}: AdminTableHeaderProps<T>) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, idx, arr) => (
          <th
            key={header.id}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700
              ${
                header.id === "actions"
                  ? "w-[140px] text-center"
                  : "w-1/4 text-left"
              }
              ${idx === arr.length - 1 ? "text-center" : ""}
            `}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    </thead>
  );
}
