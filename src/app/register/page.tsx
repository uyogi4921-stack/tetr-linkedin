"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";

const BATCHES = ["2028", "2029", "2030"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    batch: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const passwordChecks = {
    length: form.password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber;
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!passwordValid) {
      setError("Password must be at least 6 characters with at least one letter and one number.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        batch: form.batch,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      setLoading(false);
      return;
    }

    await refresh();
    router.push("/onboarding");
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-tetr-green-bg to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-tetr-green rounded-xl flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
          </div>
          <h1 className="text-2xl font-bold text-tetr-dark">Join TETR-Connect</h1>
          <p className="text-sm text-tetr-gray mt-1">
            Connect with your batch-mates at Tetr College of Business
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="input-field"
                placeholder="Your real, full name"
              />
              <p className="text-[11px] text-tetr-gray mt-1">Real names only — this is a professional community.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input-field"
                placeholder="you@tetr.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input-field"
                placeholder="For verification (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="input-field pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.length ? "text-green-600" : "text-gray-400"}`}>
                    {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.hasLetter ? "text-green-600" : "text-gray-400"}`}>
                    {passwordChecks.hasLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Contains a letter
                  </div>
                  <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.hasNumber ? "text-green-600" : "text-gray-400"}`}>
                    {passwordChecks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Contains a number
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className={`input-field pr-10 ${form.confirmPassword.length > 0 ? (passwordsMatch ? "border-green-400 focus:border-green-500" : "border-red-300 focus:border-red-400") : ""}`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Passing-out year)</label>
              <div className="flex gap-2">
                {BATCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update("batch", b)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.batch === b
                        ? "bg-tetr-green text-white"
                        : "border border-tetr-border text-gray-600 hover:bg-tetr-gray-light"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordsMatch}
              className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-tetr-gray mt-4">
          Already on TETR-Connect?{" "}
          <Link href="/login" className="text-tetr-green font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
