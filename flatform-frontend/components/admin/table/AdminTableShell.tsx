import React from "react";

interface AdminTableShellProps {
  children: React.ReactNode;
}

export default function AdminTableShell({ children }: AdminTableShellProps) {
  return <div className="bg-white">{children}</div>;
}
