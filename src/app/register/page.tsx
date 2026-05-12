"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

const BATCHES = ["2028", "2029", "2030"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    batch: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
          <h1 className="text-2xl font-bold text-tetr-dark">Join TETR</h1>
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
                required
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
                required
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
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input-field"
                placeholder="Create a strong password"
                required
                minLength={6}
              />
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-tetr-gray mt-4">
          Already on TETR?{" "}
          <Link href="/login" className="text-tetr-green font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
