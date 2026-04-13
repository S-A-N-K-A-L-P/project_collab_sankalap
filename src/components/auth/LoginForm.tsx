"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/feed");
        router.refresh();
      }
    } catch (err) {
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
      className="w-full max-w-md p-10 space-y-8 bg-surface rounded-2xl border border-border-subtle shadow-md relative"
    >
      <div className="text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-sm mb-4">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Initialize Sync</h2>
        <p className="text-muted text-[13px] font-medium leading-relaxed">Access the collective protocol layers</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-500/10 text-red-500 flex items-center gap-3 border border-red-500/20"
        >
          <AlertCircle className="w-4 h-4" />
          <p className="text-[11px] font-bold uppercase tracking-tight">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Identity Vector (Email)</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="agent@pixel.os"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Access Phrase (Password)</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded border-border-subtle bg-background text-accent focus:ring-offset-background" />
            <label htmlFor="remember" className="text-[11px] text-muted font-bold uppercase tracking-tight">Stay Synced</label>
          </div>
          <Link href="#" className="text-[11px] text-accent hover:underline font-bold uppercase tracking-tight">Reset Key?</Link>
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
          New Node?{" "}
          <Link href="/register" className="text-accent hover:underline font-bold ml-2">
            Build Identity
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
