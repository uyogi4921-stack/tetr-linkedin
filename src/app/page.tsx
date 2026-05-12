"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(user.onboardingComplete ? "/feed" : "/onboarding");
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
