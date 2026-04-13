"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Building, Hash, Code, Briefcase, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    universityName: "",
    enrollmentNumber: "",
    techStackPreference: "",
    password: "",
    confirmPassword: "",
    role: "normal_user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Something went wrong");
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
      className="w-full max-w-lg p-10 space-y-8 bg-surface rounded-2xl border border-border-subtle shadow-md relative"
    >
      <div className="text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-sm mb-4">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Build Identity</h2>
        <p className="text-muted text-[13px] font-medium leading-relaxed">Join the collective protocol network</p>
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

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center gap-3 border border-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <p className="text-[11px] font-bold uppercase tracking-tight">Identity Initialized. Redirecting to auth center...</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Agent Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Network Vector (Email)</label>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Institution</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                name="universityName"
                required
                value={formData.universityName}
                onChange={handleChange}
                placeholder="Oxford HQ"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Enrollment Key</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                name="enrollmentNumber"
                required
                value={formData.enrollmentNumber}
                onChange={handleChange}
                placeholder="ENR-092X"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Tech Stack Telemetry</label>
          <div className="relative">
            <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="techStackPreference"
              required
              value={formData.techStackPreference}
              onChange={handleChange}
              placeholder="Next.js, Tailwind, MongoDB"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Assigned Layer</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] font-black uppercase appearance-none cursor-pointer"
            >
              <option value="normal_user">USER / NODE</option>
              <option value="pixel_member">PIXEL MEMBER / CORE</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Access Key</label>
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

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest ml-1">Confirm Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border-subtle rounded-xl focus:border-accent/50 outline-none transition-all text-foreground text-[13px] placeholder:text-muted"
              />
            </div>
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
            "Initialize Node"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-[11px] text-muted font-bold uppercase tracking-widest">
          Existing Identity?{" "}
          <Link href="/login" className="text-accent hover:underline font-bold ml-2">
            Authenticate
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
