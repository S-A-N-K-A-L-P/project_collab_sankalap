"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full max-w-md p-10 space-y-8 bg-surface rounded-2xl border border-border-subtle shadow-md"
    >
      <div className="text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-sm mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Access
        </h2>
        <p className="text-muted text-[13px] font-medium">
          Authenticate to access the control panel
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pixel.os"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-wider text-[11px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Authenticate"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-[11px] text-muted font-bold uppercase tracking-widest">
          New admin?{" "}
          <Link
            href="/admin/register"
            className="text-accent hover:underline font-bold ml-2"
          >
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
