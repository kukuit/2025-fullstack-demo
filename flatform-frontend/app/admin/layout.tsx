import { RoleGuardLayout } from "@/components/RoleGuardLayout";
import RouteProgress from "@/components/common/RouteProgress";
import AdminLayout from "@/components/layouts/admin/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuardLayout allowedRoles={["admin"]}>
      <AdminLayout>
        <RouteProgress scope="admin" />
        {children}
      </AdminLayout>
    </RoleGuardLayout>
  );
}
