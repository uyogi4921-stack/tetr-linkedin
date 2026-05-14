"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-tetr-dark">Reset Password</h1>
          <p className="text-sm text-tetr-gray mt-1">
            {sent
              ? "Check your email for the new password"
              : "Enter your registered email to get a new password"}
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">New password sent!</h3>
              <p className="text-sm text-gray-500 mb-1">
                If an account exists with <strong>{email}</strong>, a new password has been sent to that email.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Check your inbox and spam folder. Use the new password to sign in.
              </p>
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-2 mt-6 px-6 py-2.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@tetr.edu"
                  />
                </div>
                <p className="text-[11px] text-tetr-gray mt-1">
                  A new password will be sent to this email.
                </p>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send New Password"}
              </button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="text-center text-sm text-tetr-gray mt-4">
            <Link href="/login" className="text-tetr-green font-medium hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
