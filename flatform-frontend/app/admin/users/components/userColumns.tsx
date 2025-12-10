import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import React from "react";
import type { User } from "../types";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminTableDropdown from "@/components/admin/table/AdminTableDropdown";

interface UserColumnsConfig {
  onToggleStatus: (user: User) => void;
  loadingIds: string[];
  disabled?: boolean;
  onEdit?: (user: User) => void;
  menuOpenId: string | null;
  setMenuOpenId: React.Dispatch<React.SetStateAction<string | null>>;
  buttonRefs: React.MutableRefObject<{
    [key: string]: HTMLButtonElement | null;
  }>;
}

export const getUserColumns = ({
  onToggleStatus,
  loadingIds,
  disabled,
  onEdit,
  menuOpenId,
  setMenuOpenId,
  buttonRefs,
}: UserColumnsConfig): ColumnDef<User, any>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = String(row.original.id);
      return id ? `${id.slice(0, 6)}...` : "-";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role?.name || "-";
      const label = roleName
        ? roleName.charAt(0).toUpperCase() + roleName.slice(1)
        : "-";
      const pill =
        roleName.toLowerCase() === "admin"
          ? "bg-indigo-50 text-indigo-700"
          : "bg-sky-50 text-sky-700";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${pill}`}
        >
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "active";
      return (
        <span
          className={`inline-block w-[70px] rounded px-2 py-1 text-center text-xs font-semibold
            ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700"
            }`}
        >
          {isActive ? "active" : "disable"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;
      const isLoading = loadingIds.includes(user.id);
      const isActive = user.status === "active";
      const isOpen = menuOpenId === user.id;

      const confirmTitle = isActive
        ? "Vô hiệu hóa người dùng"
        : "Kích hoạt người dùng";
      const confirmMessage = `Bạn có chắc chắn muốn ${
        isActive ? "vô hiệu hóa" : "kích hoạt"
      } user ${user.email}?`;

      const editIcon = (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20h4l10-10-4-4L4 16v4z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

      return (
        <div className="relative flex items-center justify-center">
          <button
            ref={(el) => {
              if (el) buttonRefs.current[user.id] = el;
            }}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => {
              setMenuOpenId((prev) => (prev === user.id ? null : user.id));
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="sr-only">Actions</span>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>

          <AdminTableDropdown
            isOpen={isOpen}
            onClose={() => setMenuOpenId(null)}
            triggerRef={{ current: buttonRefs.current[user.id] || null }}
          >
            {/* Edit */}
            {onEdit ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                  setMenuOpenId(null);
                }}
                className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 whitespace-nowrap"
              >
                {editIcon}
                Edit
              </button>
            ) : (
              <Link
                href={`/admin/users/${user.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(null);
                }}
                className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 whitespace-nowrap"
              >
                {editIcon}
                Edit
              </Link>
            )}

            {/* Toggle Status */}
            {isLoading ? (
              <span className="w-[92px] rounded bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-500">
                Đang xử lý...
              </span>
            ) : (
              <ConfirmModal
                title={confirmTitle}
                message={confirmMessage}
                onConfirm={() => {
                  onToggleStatus(user);
                  setMenuOpenId(null);
                }}
                trigger={
                  <button
                    className={`w-[92px] rounded px-2 py-1 text-center text-xs font-medium transition whitespace-nowrap
                      ${
                        user.status === "active"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                  >
                    {user.status === "active" ? "Disable" : "Kích hoạt"}
                  </button>
                }
              />
            )}
          </AdminTableDropdown>
        </div>
      );
    },
  },
];
