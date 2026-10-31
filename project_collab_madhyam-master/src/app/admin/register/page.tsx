import AdminRegisterForm from "@/app/admin/components/AdminRegisterForm";

export const metadata = { title: "Admin Register | Syncro" };

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AdminRegisterForm />
    </div>
  );
}
