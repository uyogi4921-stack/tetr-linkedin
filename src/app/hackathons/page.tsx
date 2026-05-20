"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react";

interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  maxTeamSize: number;
  teamCount: number;
  totalParticipants: number;
  creator: { id: string; fullName: string };
}

export default function HackathonsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/hackathons")
      .then((r) => r.json())
      .then((d) => setHackathons(d.hackathons || []))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const now = new Date();

  const active = hackathons.filter((h) => new Date(h.endDate) >= now);
  const past = hackathons.filter((h) => new Date(h.endDate) < now);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatus(h: Hackathon) {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
    if (now <= end) return { label: "Live Now", color: "bg-green-100 text-green-700" };
    return { label: "Ended", color: "bg-gray-100 text-gray-500" };
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-tetr-green" />
              Hackathon Hub
            </h1>
            <p className="text-sm text-tetr-gray mt-1">
              Join hackathons, build teams, and compete with your batch-mates.
            </p>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hackathons.length === 0 ? (
          <div className="card p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1">No hackathons yet</h3>
            <p className="text-sm text-gray-500">Hackathons will appear here when admins create them.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-tetr-green" />
                  Active & Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map((h) => {
                    const status = getStatus(h);
                    return (
                      <Link
                        key={h.id}
                        href={`/hackathons/${h.id}`}
                        className="card p-5 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-tetr-green transition-colors">
                              {h.title}
                            </h3>
                            <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                        </div>
                        {h.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{h.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(h.startDate)} — {formatDate(h.endDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {h.teamCount} team{h.teamCount !== 1 ? "s" : ""} &middot; Max {h.maxTeamSize}/team
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Past Hackathons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map((h) => (
                    <Link
                      key={h.id}
                      href={`/hackathons/${h.id}`}
                      className="card p-5 hover:shadow-lg transition-all group opacity-75"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-700 group-hover:text-tetr-green transition-colors">
                          {h.title}
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          Ended
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatDate(h.startDate)} — {formatDate(h.endDate)}</span>
                        <span>{h.teamCount} teams &middot; {h.totalParticipants} participants</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
