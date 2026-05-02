import RegisterForm from "@/components/auth/RegisterForm";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function RegisterPage() {
  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <RegisterForm />
      </div>
    </>
  );
}
