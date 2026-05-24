import AdminLoginForm from "@/app/admin/components/AdminLoginForm";

export const metadata = { title: "Admin Login | Pixel Platform" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AdminLoginForm />
    </div>
  );
}
