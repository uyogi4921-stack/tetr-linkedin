"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  Search,
  Filter,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Briefcase,
  Users,
  X,
  UserPlus,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  batch: string | null;
  role: string;
  expertise: string | null;
  excitedField: string | null;
  aboutLine: string | null;
  avatarUrl: string | null;
  experienceLevel: string | null;
}

const ROLES = ["student", "intern", "fresher", "pre-final", "alumnus", "faculty"];
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
];
const BATCHES = ["2028", "2029", "2030"];

export default function PeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-tetr-gray-light flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PeopleContent />
    </Suspense>
  );
}

function PeopleContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [batch, setBatch] = useState("");
  const [role, setRole] = useState("");
  const [field, setField] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Fetch connection statuses
  useEffect(() => {
    if (!user) return;
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => {
        const accepted = new Set<string>();
        const pending = new Set<string>();
        (d.connections || []).forEach((c: any) => {
          accepted.add(c.senderId === user.id ? c.receiverId : c.senderId);
        });
        (d.pendingSent || []).forEach((c: any) => {
          pending.add(c.receiverId);
        });
        setConnectedIds(accepted);
        setPendingIds(pending);
      })
      .catch(() => {});
  }, [user]);

  const handleConnect = async (profileId: string) => {
    if (connectingTo) return;
    setConnectingTo(profileId);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profileId }),
      });
      if (res.ok) {
        setPendingIds((prev) => new Set([...prev, profileId]));
      }
    } finally {
      setConnectingTo(null);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (batch) params.set("batch", batch);
    if (role) params.set("role", role);
    if (field) params.set("field", field);

    setLoadingUsers(true);
    fetch(`/api/users?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoadingUsers(false);
      });
  }, [user, loading, router, search, batch, role, field]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-tetr-gray-light flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeFilterCount = [batch, role, field].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-tetr-green" />
              Community Directory
            </h1>
            <p className="text-sm text-tetr-gray mt-0.5">
              {!loadingUsers && `${users.length} member${users.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-1.5 lg:hidden relative"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-tetr-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block lg:col-span-3`}>
            <div className="card p-5 sticky top-20 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setBatch("");
                      setRole("");
                      setField("");
                    }}
                    className="text-xs text-tetr-green font-medium hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-tetr-gray uppercase tracking-wide mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetr-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, skill, interest..."
                    className="input-field pl-9"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tetr-gray hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tetr-gray uppercase tracking-wide mb-2">
                  Batch
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setBatch("")}
                    className={`badge cursor-pointer transition-all ${
                      !batch ? "bg-tetr-green text-white shadow-sm" : "badge-gray hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {BATCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBatch(batch === b ? "" : b)}
                      className={`badge cursor-pointer transition-all ${
                        batch === b
                          ? "bg-tetr-green text-white shadow-sm"
                          : "badge-gray hover:bg-gray-200"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tetr-gray uppercase tracking-wide mb-2">
                  Role
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(role === r ? "" : r)}
                      className={`badge cursor-pointer capitalize transition-all ${
                        role === r
                          ? "bg-tetr-green text-white shadow-sm"
                          : "badge-gray hover:bg-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tetr-gray uppercase tracking-wide mb-2">
                  Field of Interest
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FIELDS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setField(field === f ? "" : f)}
                      className={`badge cursor-pointer transition-all ${
                        field === f
                          ? "bg-tetr-green text-white shadow-sm"
                          : "badge-gray hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* People grid */}
          <main className="lg:col-span-9">
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="card p-12 text-center">
                <Search className="w-10 h-10 text-tetr-gray mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-900">No people found</p>
                <p className="text-xs text-tetr-gray mt-1">
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map((profile) => (
                  <div
                    key={profile.id}
                    className="card card-hover overflow-hidden transition-all"
                  >
                    {/* Mini cover gradient */}
                    <div className="h-16 bg-gradient-to-r from-tetr-green to-tetr-green-light relative">
                      <div className="absolute -bottom-6 left-4">
                        <div className="ring-3 ring-white rounded-full">
                          <Avatar
                            name={profile.fullName}
                            avatarUrl={profile.avatarUrl}
                            size="lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 px-4 pb-4">
                      <Link
                        href={`/profile/${profile.id}`}
                        className="font-semibold text-sm text-gray-900 hover:text-tetr-green transition-colors"
                      >
                        {profile.fullName}
                      </Link>

                      {profile.aboutLine ? (
                        <p className="text-xs text-tetr-gray mt-0.5 line-clamp-2 leading-relaxed">
                          {profile.aboutLine}
                        </p>
                      ) : (
                        <p className="text-xs text-tetr-gray mt-0.5 capitalize">
                          {profile.role}
                          {profile.batch ? ` · Batch ${profile.batch}` : ""}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {profile.batch && (
                          <span className="inline-flex items-center gap-1 badge badge-green">
                            <GraduationCap className="w-3 h-3" />
                            {profile.batch}
                          </span>
                        )}
                        {profile.excitedField && (
                          <span className="inline-flex items-center gap-1 badge badge-gray">
                            <Sparkles className="w-3 h-3" />
                            {profile.excitedField}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2">
                        {profile.id !== user.id && (
                          connectedIds.has(profile.id) ? (
                            <span className="flex-1 py-2 text-center text-xs font-semibold text-tetr-green bg-tetr-green-bg rounded-full flex items-center justify-center gap-1">
                              <UserPlus className="w-3.5 h-3.5" />
                              Connected
                            </span>
                          ) : pendingIds.has(profile.id) ? (
                            <span className="flex-1 py-2 text-center text-xs font-semibold text-amber-600 bg-amber-50 rounded-full">
                              Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConnect(profile.id)}
                              disabled={connectingTo === profile.id}
                              className="flex-1 py-2 text-center text-xs font-semibold text-white bg-tetr-green rounded-full hover:bg-tetr-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              {connectingTo === profile.id ? "..." : "Connect"}
                            </button>
                          )
                        )}
                        <Link
                          href={`/profile/${profile.id}`}
                          className="flex-1 py-2 text-center text-xs font-semibold text-tetr-green border border-tetr-green rounded-full hover:bg-tetr-green-bg transition-colors"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/messages?with=${profile.id}`}
                          className="p-2 border border-tetr-border rounded-full text-tetr-gray hover:text-tetr-green hover:border-tetr-green transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
