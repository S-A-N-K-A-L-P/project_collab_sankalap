"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Building,
  Hash,
  Code,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    universityName: "",
    enrollmentNumber: "",
    techStackPreference: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof typeof formData,
    label: string,
    placeholder: string,
    Icon: React.ElementType,
    type = "text"
  ) => (
    <div className="space-y-2">
      <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type={type}
          name={name}
          required
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full max-w-lg p-10 space-y-8 bg-surface rounded-2xl border border-border-subtle shadow-md"
    >
      <div className="text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-sm mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Register Admin
        </h2>
        <p className="text-muted text-[13px] font-medium">
          Create a new admin account
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-500/10 text-red-500 flex items-center gap-3 border border-red-500/20"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-[11px] font-bold uppercase tracking-tight">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center gap-3 border border-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="text-[11px] font-bold uppercase tracking-tight">
            Admin account created. Redirecting to login...
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("name", "Full Name", "John Doe", User)}
          {field("email", "Email", "admin@syncro.dev", Mail, "email")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("universityName", "Institution", "University Name", Building)}
          {field("enrollmentNumber", "Enrollment No.", "ENR-001", Hash)}
        </div>

        {field("techStackPreference", "Tech Stack", "Next.js, MongoDB, Tailwind", Code)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("password", "Password", "••••••••", Lock, "password")}
          {field("confirmPassword", "Confirm Password", "••••••••", Lock, "password")}
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3.5 px-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-wider text-[11px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create Admin Account"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-[11px] text-muted font-bold uppercase tracking-widest">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-accent hover:underline font-bold ml-2">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
