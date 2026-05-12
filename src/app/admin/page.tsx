"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { format } from "date-fns";
import {
  Shield,
  Users,
  FileText,
  Calendar,
  BookOpen,
  MessageSquare,
  BarChart3,
  Trash2,
  Pin,
  PinOff,
  ShieldCheck,
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Eye,
  Search,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

type Tab = "overview" | "users" | "posts" | "events" | "clubs" | "moderation";

interface StatsData {
  stats: {
    totalUsers: number;
    totalPosts: number;
    totalEvents: number;
    totalClubs: number;
    totalComments: number;
    totalMessages: number;
  };
  recentUsers: any[];
  roleCounts: { role: string; count: number }[];
  batchCounts: { batch: string; count: number }[];
  postTypeCounts: { type: string; count: number }[];
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) {
      const data = await res.json();
      setStatsData(data);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setAllUsers(data.users || []);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (res.ok) {
      const data = await res.json();
      setAllPosts(data.posts || []);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setAllEvents(data.events || []);
    }
  }, []);

  const fetchClubs = useCallback(async () => {
    const res = await fetch("/api/admin/clubs");
    if (res.ok) {
      const data = await res.json();
      setAllClubs(data.clubs || []);
    }
  }, []);

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/admin/moderation");
    if (res.ok) {
      const data = await res.json();
      setRules(data.rules || []);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.isAdmin) {
      router.replace("/feed");
      return;
    }
    setLoadingData(true);
    Promise.all([fetchStats(), fetchUsers(), fetchPosts(), fetchEvents(), fetchClubs(), fetchRules()]).then(() =>
      setLoadingData(false)
    );
  }, [user, loading, router, fetchStats, fetchUsers, fetchPosts, fetchEvents, fetchClubs, fetchRules]);

  const handleUserAction = async (userId: string, action: string, extra?: any) => {
    setActionLoading(userId + action);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, ...extra }),
    });
    await fetchUsers();
    await fetchStats();
    setActionLoading(null);
  };

  const handlePostAction = async (postId: string, action: string) => {
    setActionLoading(postId + action);
    await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action }),
    });
    await fetchPosts();
    await fetchStats();
    setActionLoading(null);
  };

  const handleEventAction = async (eventId: string, action: string) => {
    setActionLoading(eventId + action);
    await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, action }),
    });
    await fetchEvents();
    await fetchStats();
    setActionLoading(null);
  };

  const handleClubAction = async (clubId: string, action: string) => {
    setActionLoading(clubId + action);
    await fetch("/api/admin/clubs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, action }),
    });
    await fetchClubs();
    await fetchStats();
    setActionLoading(null);
  };

  const handleAddRule = async () => {
    if (!newRule.trim()) return;
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newRule.trim() }),
    });
    setNewRule("");
    await fetchRules();
  };

  const handleRuleAction = async (ruleId: string, action: string) => {
    setActionLoading(ruleId + action);
    await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, action }),
    });
    await fetchRules();
    setActionLoading(null);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-tetr-gray-light flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-tetr-gray mt-2">You do not have admin privileges.</p>
          <Link href="/feed" className="btn-primary inline-block mt-4">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const s = statsData?.stats;

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users, count: s?.totalUsers },
    { id: "posts", label: "Posts", icon: FileText, count: s?.totalPosts },
    { id: "events", label: "Events", icon: Calendar, count: s?.totalEvents },
    { id: "clubs", label: "Clubs", icon: BookOpen, count: s?.totalClubs },
    { id: "moderation", label: "Moderation", icon: Shield, count: rules.length },
  ];

  const filteredUsers = allUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = allPosts.filter(
    (p: any) =>
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />

      {/* Admin banner */}
      <div className="bg-gradient-to-r from-tetr-dark via-tetr-green to-tetr-green-light">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/70">Manage TETR platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="card p-2 sticky top-20">
              <nav className="space-y-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchTerm("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-tetr-green text-white"
                          : "text-gray-700 hover:bg-tetr-gray-light"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            activeTab === tab.id
                              ? "bg-white/20 text-white"
                              : "bg-tetr-gray-light text-tetr-gray"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 space-y-4">
            {loadingData ? (
              <div className="card p-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ═══ OVERVIEW ═══ */}
                {activeTab === "overview" && s && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: "Users", value: s.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Posts", value: s.totalPosts, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Events", value: s.totalEvents, icon: Calendar, color: "text-violet-500", bg: "bg-violet-50" },
                        { label: "Clubs", value: s.totalClubs, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
                        { label: "Comments", value: s.totalComments, icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-50" },
                        { label: "Messages", value: s.totalMessages, icon: TrendingUp, color: "text-teal-500", bg: "bg-teal-50" },
                      ].map((stat) => (
                        <div key={stat.label} className="card p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              <p className="text-xs text-tetr-gray">{stat.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Distribution cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Roles */}
                      <div className="card p-5">
                        <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-tetr-green" />
                          User Roles
                        </h3>
                        <div className="space-y-2">
                          {statsData?.roleCounts.map((r) => (
                            <div key={r.role} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 capitalize">{r.role}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-tetr-gray-light rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-tetr-green rounded-full"
                                    style={{
                                      width: `${(r.count / s.totalUsers) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-tetr-gray w-6 text-right">{r.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Batches */}
                      <div className="card p-5">
                        <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-tetr-green" />
                          Batch Distribution
                        </h3>
                        <div className="space-y-2">
                          {statsData?.batchCounts.map((b) => (
                            <div key={b.batch} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{b.batch}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-tetr-gray-light rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                      width: `${(b.count / s.totalUsers) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-tetr-gray w-6 text-right">{b.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Post types */}
                      <div className="card p-5">
                        <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-tetr-green" />
                          Post Types
                        </h3>
                        <div className="space-y-2">
                          {statsData?.postTypeCounts.map((p) => (
                            <div key={p.type} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{p.type}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-tetr-gray-light rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-violet-500 rounded-full"
                                    style={{
                                      width: `${(p.count / Math.max(s.totalPosts, 1)) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-tetr-gray w-6 text-right">{p.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent users */}
                    <div className="card p-5">
                      <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-tetr-green" />
                        Recent Signups
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-tetr-border">
                              <th className="text-left py-2 text-xs text-tetr-gray uppercase font-medium">Name</th>
                              <th className="text-left py-2 text-xs text-tetr-gray uppercase font-medium">Email</th>
                              <th className="text-left py-2 text-xs text-tetr-gray uppercase font-medium">Role</th>
                              <th className="text-left py-2 text-xs text-tetr-gray uppercase font-medium">Joined</th>
                              <th className="text-left py-2 text-xs text-tetr-gray uppercase font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statsData?.recentUsers.map((u) => (
                              <tr key={u.id} className="border-b border-tetr-border last:border-none">
                                <td className="py-2.5 font-medium text-gray-900">{u.fullName}</td>
                                <td className="py-2.5 text-tetr-gray">{u.email}</td>
                                <td className="py-2.5 capitalize">{u.role}</td>
                                <td className="py-2.5 text-tetr-gray">{format(new Date(u.createdAt), "MMM d")}</td>
                                <td className="py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    {u.isAdmin && (
                                      <span className="badge bg-amber-50 text-amber-700 text-[10px]">Admin</span>
                                    )}
                                    {u.isVerified ? (
                                      <span className="badge bg-green-50 text-green-700 text-[10px]">Verified</span>
                                    ) : (
                                      <span className="badge bg-gray-100 text-gray-500 text-[10px]">Unverified</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ USERS ═══ */}
                {activeTab === "users" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="card p-4 flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetr-gray" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>
                      <button onClick={() => { fetchUsers(); fetchStats(); }} className="btn-ghost flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4" /> Refresh
                      </button>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">User</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Role / Batch</th>
                              <th className="text-center px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Posts</th>
                              <th className="text-center px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Clubs</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Status</th>
                              <th className="text-right px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((u) => (
                              <tr key={u.id} className="border-t border-tetr-border hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <Link href={`/profile/${u.id}`} className="hover:text-tetr-green">
                                    <p className="font-medium text-gray-900">{u.fullName}</p>
                                    <p className="text-xs text-tetr-gray">{u.email}</p>
                                  </Link>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="capitalize text-gray-700">{u.role}</span>
                                  {u.batch && (
                                    <span className="text-xs text-tetr-gray ml-1">&middot; {u.batch}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-700">{u._count.posts}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{u._count.clubMembers}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {u.isAdmin && (
                                      <span className="badge bg-amber-50 text-amber-700 text-[10px]">Admin</span>
                                    )}
                                    {u.isVerified ? (
                                      <span className="badge bg-green-50 text-green-700 text-[10px]">Verified</span>
                                    ) : (
                                      <span className="badge bg-gray-100 text-gray-500 text-[10px]">Unverified</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleUserAction(u.id, "toggleVerify")}
                                      disabled={actionLoading === u.id + "toggleVerify"}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        u.isVerified
                                          ? "text-green-600 hover:bg-green-50"
                                          : "text-gray-400 hover:bg-gray-100"
                                      }`}
                                      title={u.isVerified ? "Unverify" : "Verify"}
                                    >
                                      {u.isVerified ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : (
                                        <XCircle className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleUserAction(u.id, "toggleAdmin")}
                                      disabled={actionLoading === u.id + "toggleAdmin" || u.id === user.id}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        u.isAdmin
                                          ? "text-amber-600 hover:bg-amber-50"
                                          : "text-gray-400 hover:bg-gray-100"
                                      } disabled:opacity-30`}
                                      title={u.isAdmin ? "Remove admin" : "Make admin"}
                                    >
                                      {u.isAdmin ? (
                                        <ShieldCheck className="w-4 h-4" />
                                      ) : (
                                        <ShieldOff className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete user ${u.fullName}?`)) {
                                          handleUserAction(u.id, "delete");
                                        }
                                      }}
                                      disabled={u.id === user.id}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
                                      title="Delete user"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-sm text-tetr-gray">No users found.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ POSTS ═══ */}
                {activeTab === "posts" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="card p-4 flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetr-gray" />
                        <input
                          type="text"
                          placeholder="Search posts by title, body, or author..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Post</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Author</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Type</th>
                              <th className="text-center px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Likes</th>
                              <th className="text-center px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Comments</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Date</th>
                              <th className="text-right px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPosts.map((p: any) => (
                              <tr key={p.id} className="border-t border-tetr-border hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 max-w-xs">
                                  <div className="flex items-center gap-2">
                                    {p.isPinned && <Pin className="w-3.5 h-3.5 text-tetr-green shrink-0" />}
                                    <div className="min-w-0">
                                      {p.title && (
                                        <p className="font-medium text-gray-900 truncate">{p.title}</p>
                                      )}
                                      <p className="text-xs text-tetr-gray truncate">{p.body}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{p.author.fullName}</td>
                                <td className="px-4 py-3">
                                  <span className="badge badge-gray text-[10px]">{p.type}</span>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-700">{p._count.likes}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{p._count.comments}</td>
                                <td className="px-4 py-3 text-xs text-tetr-gray whitespace-nowrap">
                                  {format(new Date(p.createdAt), "MMM d, yyyy")}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handlePostAction(p.id, "togglePin")}
                                      disabled={actionLoading === p.id + "togglePin"}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        p.isPinned
                                          ? "text-tetr-green hover:bg-green-50"
                                          : "text-gray-400 hover:bg-gray-100"
                                      }`}
                                      title={p.isPinned ? "Unpin" : "Pin post"}
                                    >
                                      {p.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Delete this post?")) {
                                          handlePostAction(p.id, "delete");
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                      title="Delete post"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredPosts.length === 0 && (
                        <div className="p-8 text-center text-sm text-tetr-gray">No posts found.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ EVENTS ═══ */}
                {activeTab === "events" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Event</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Type</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Date</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Location</th>
                              <th className="text-center px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Attendees</th>
                              <th className="text-left px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Club</th>
                              <th className="text-right px-4 py-3 text-xs text-tetr-gray uppercase font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allEvents.map((e: any) => {
                              const isPast = new Date(e.startTime) < new Date();
                              return (
                                <tr
                                  key={e.id}
                                  className={`border-t border-tetr-border hover:bg-gray-50 transition-colors ${
                                    isPast ? "opacity-60" : ""
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{e.title}</p>
                                    {e.description && (
                                      <p className="text-xs text-tetr-gray line-clamp-1">{e.description}</p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="badge badge-gray text-[10px]">{e.type}</span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                                    {format(new Date(e.startTime), "MMM d, yyyy h:mm a")}
                                    {isPast && <span className="ml-1 text-red-400">(past)</span>}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-700">
                                    {e.isOnline ? "Online" : e.location || "TBD"}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-700">{e._count.attendees}</td>
                                  <td className="px-4 py-3 text-xs text-gray-700">{e.club?.name || "—"}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end">
                                      <button
                                        onClick={() => {
                                          if (confirm(`Delete event "${e.title}"?`)) {
                                            handleEventAction(e.id, "delete");
                                          }
                                        }}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        title="Delete event"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {allEvents.length === 0 && (
                        <div className="p-8 text-center text-sm text-tetr-gray">No events found.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ CLUBS ═══ */}
                {activeTab === "clubs" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allClubs.map((c: any) => (
                        <div key={c.id} className="card p-5 card-hover">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tetr-green to-tetr-green-light flex items-center justify-center text-white font-bold text-lg">
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                                {c.description && (
                                  <p className="text-xs text-tetr-gray line-clamp-1 mt-0.5">{c.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`Delete club "${c.name}"? Members will be removed.`)) {
                                  handleClubAction(c.id, "delete");
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete club"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {[
                              { label: "Members", count: c._count.members },
                              { label: "Posts", count: c._count.posts },
                              { label: "Events", count: c._count.events },
                              { label: "Resources", count: c._count.resources },
                            ].map((item) => (
                              <div key={item.label} className="text-center p-2 bg-tetr-gray-light rounded-lg">
                                <p className="text-lg font-bold text-gray-900">{item.count}</p>
                                <p className="text-[10px] text-tetr-gray">{item.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {allClubs.length === 0 && (
                      <div className="card p-8 text-center text-sm text-tetr-gray">No clubs found.</div>
                    )}
                  </div>
                )}

                {/* ═══ MODERATION ═══ */}
                {activeTab === "moderation" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="card p-5">
                      <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Content Moderation Rules
                      </h3>
                      <p className="text-xs text-tetr-gray mb-4">
                        Posts and comments are checked against these patterns. Matching content is blocked.
                      </p>

                      {/* Add rule */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Add a blocked word or regex pattern..."
                          value={newRule}
                          onChange={(e) => setNewRule(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
                          className="input-field flex-1"
                        />
                        <button
                          onClick={handleAddRule}
                          disabled={!newRule.trim()}
                          className="btn-primary flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                          Add Rule
                        </button>
                      </div>

                      {/* Rules list */}
                      <div className="space-y-2">
                        {rules.map((rule: any) => (
                          <div
                            key={rule.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              rule.isActive
                                ? "border-tetr-border bg-white"
                                : "border-gray-200 bg-gray-50 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <code className="text-sm font-mono text-gray-800 bg-tetr-gray-light px-2 py-0.5 rounded">
                                {rule.text}
                              </code>
                              {rule.isActive ? (
                                <span className="badge bg-green-50 text-green-700 text-[10px]">Active</span>
                              ) : (
                                <span className="badge bg-gray-100 text-gray-500 text-[10px]">Disabled</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRuleAction(rule.id, "toggle")}
                                disabled={actionLoading === rule.id + "toggle"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  rule.isActive
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-gray-400 hover:bg-gray-100"
                                }`}
                                title={rule.isActive ? "Disable" : "Enable"}
                              >
                                {rule.isActive ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this rule?")) {
                                    handleRuleAction(rule.id, "delete");
                                  }
                                }}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {rules.length === 0 && (
                        <div className="p-6 text-center text-sm text-tetr-gray border border-dashed border-tetr-border rounded-xl">
                          No moderation rules yet. Add one above.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
