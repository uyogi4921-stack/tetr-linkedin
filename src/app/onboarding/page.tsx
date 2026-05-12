"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { ChevronRight } from "lucide-react";

const EXPERIENCE_LEVELS = [
  "No experience",
  "Intern",
  "Part-time role",
  "Project-based",
  "Startup founder",
  "Full-time professional",
  "Faculty / Mentor",
];

const FIELDS = [
  "Consulting",
  "Finance",
  "Technology",
  "Marketing",
  "Operations",
  "Startups",
  "Sustainability",
  "Product Management",
  "Data Science",
  "Design",
  "Healthcare",
  "Education",
];

export default function OnboardingPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [expertise, setExpertise] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [excitedField, setExcitedField] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleFinish = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expertise, experienceLevel, excitedField }),
    });
    if (res.ok) {
      await refresh();
      router.push("/feed");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-tetr-green-bg to-white">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-tetr-dark">
            Welcome, {user.fullName.split(" ")[0]}!
          </h1>
          <p className="text-sm text-tetr-gray mt-1">
            Let&apos;s set up your professional profile.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "w-12 bg-tetr-green" : "w-8 bg-tetr-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card p-6 animate-fade-in">
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                What&apos;s your area of expertise?
              </h2>
              <p className="text-sm text-tetr-gray mb-4">
                Share your skills, experience, or areas of knowledge.
              </p>
              <textarea
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="e.g., Financial modeling, Python, UX Research, Market analysis..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                Select your experience level
              </h2>
              <p className="text-sm text-tetr-gray mb-4">
                No pressure — everyone starts somewhere.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`p-3 rounded-lg text-sm text-left font-medium transition-all ${
                      experienceLevel === level
                        ? "bg-tetr-green text-white shadow-sm"
                        : "border border-tetr-border text-gray-600 hover:bg-tetr-gray-light"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                Which field are you most excited about?
              </h2>
              <p className="text-sm text-tetr-gray mb-4">
                This helps us connect you with relevant people and opportunities.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FIELDS.map((field) => (
                  <button
                    key={field}
                    onClick={() => setExcitedField(field)}
                    className={`p-2.5 rounded-lg text-sm font-medium transition-all ${
                      excitedField === field
                        ? "bg-tetr-green text-white shadow-sm"
                        : "border border-tetr-border text-gray-600 hover:bg-tetr-gray-light"
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? "Finishing up..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
