import LoginForm from "@/components/auth/LoginForm";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function LoginPage() {
  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
    </>
  );
}
