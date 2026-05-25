import AdminGuard from "./AdminGuard";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[var(--background-primary)]">
        <AdminSidebar />
        <div className="flex-1 ml-60 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
