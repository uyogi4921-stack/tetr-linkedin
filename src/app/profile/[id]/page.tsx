"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import {
  MessageSquare,
  Briefcase,
  GraduationCap,
  Sparkles,
  Calendar,
  MapPin,
  Globe,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Edit3,
  ChevronRight,
  Heart,
  Eye,
  Search,
  BarChart3,
  UserPlus,
  UserCheck,
  Clock,
  FileText,
  ExternalLink,
  X,
  Save,
  Upload,
  Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "activity">("about");
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectLoading, setConnectLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    aboutLine: "",
    expertise: "",
    excitedField: "",
    experienceLevel: "",
    resumeUrl: "",
    phone: "",
    batch: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchProfile();
  }, [user, loading, router, profileId]);

  const fetchProfile = () => {
    setLoadingProfile(true);
    fetch(`/api/users/${profileId}`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setConnectionStatus(d.connectionStatus);
        setConnectionId(d.connectionId);
        setConnectionCount(d.connectionCount || 0);
        setLoadingProfile(false);
      });
  };

  useEffect(() => {
    if (activeTab === "posts" || activeTab === "activity") {
      setLoadingPosts(true);
      fetch("/api/posts")
        .then((r) => r.json())
        .then((d) => {
          const userPosts = (d.posts || []).filter(
            (p: any) => p.author.id === profileId
          );
          setAllPosts(userPosts);
          setLoadingPosts(false);
        });
    }
  }, [activeTab, profileId]);

  const handleConnect = async () => {
    if (connectLoading) return;
    setConnectLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profileId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus("pending_sent");
        setConnectionId(data.connection.id);
      }
    } finally {
      setConnectLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionId || connectLoading) return;
    setConnectLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "accept" }),
      });
      if (res.ok) {
        setConnectionStatus("accepted");
        setConnectionCount((c) => c + 1);
      }
    } finally {
      setConnectLoading(false);
    }
  };

  const handleWithdrawConnection = async () => {
    if (!connectionId || connectLoading) return;
    setConnectLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "withdraw" }),
      });
      if (res.ok) {
        setConnectionStatus(null);
        setConnectionId(null);
      }
    } finally {
      setConnectLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      fullName: profile.fullName || "",
      aboutLine: profile.aboutLine || "",
      expertise: profile.expertise || "",
      excitedField: profile.excitedField || "",
      experienceLevel: profile.experienceLevel || "",
      resumeUrl: profile.resumeUrl || "",
      phone: profile.phone || "",
      batch: profile.batch || "",
    });
    setSaveSuccess(false);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setSaveSuccess(true);
        fetchProfile();
        await refresh();
        setTimeout(() => {
          setShowEditModal(false);
          setSaveSuccess(false);
        }, 1000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || loadingProfile) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="card p-12">
            <GraduationCap className="w-12 h-12 text-tetr-gray mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold text-gray-900">User not found</p>
            <p className="text-sm text-tetr-gray mt-1">
              This profile may have been removed or does not exist.
            </p>
            <button
              onClick={() => router.push("/people")}
              className="btn-primary mt-4"
            >
              Browse People
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.id === profileId;
  const memberSince = format(new Date(profile.createdAt), "MMMM yyyy");
  const clubCount = profile.clubMembers?.length || 0;
  const postCount = profile.posts?.length || 0;

  const experienceMap: Record<string, string> = {
    beginner: "Getting Started",
    intermediate: "Building Experience",
    advanced: "Advanced Practitioner",
    looking_to_learn: "Eager Learner",
  };

  const fieldIconMap: Record<string, string> = {
    marketing: "Marketing & Strategy",
    finance: "Finance & Accounting",
    tech: "Technology & Analytics",
    consulting: "Consulting",
    entrepreneurship: "Entrepreneurship",
    general_management: "General Management",
  };

  const renderConnectButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={openEditModal}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      );
    }

    if (connectionStatus === "accepted") {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-tetr-green-bg text-tetr-green rounded-full font-medium cursor-default"
        >
          <UserCheck className="w-4 h-4" />
          Connected
        </button>
      );
    }

    if (connectionStatus === "pending_sent") {
      return (
        <button
          onClick={handleWithdrawConnection}
          disabled={connectLoading}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <Clock className="w-4 h-4" />
          {connectLoading ? "..." : "Pending"}
        </button>
      );
    }

    if (connectionStatus === "pending_received") {
      return (
        <button
          onClick={handleAcceptConnection}
          disabled={connectLoading}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <UserCheck className="w-4 h-4" />
          {connectLoading ? "..." : "Accept"}
        </button>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={connectLoading}
        className="btn-secondary flex items-center gap-1.5 text-sm"
      >
        <UserPlus className="w-4 h-4" />
        {connectLoading ? "..." : "Connect"}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="card overflow-hidden">
          {/* Cover photo */}
          <div className="h-48 sm:h-56 bg-gradient-to-br from-tetr-dark via-tetr-green to-tetr-green-light relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-12 w-32 h-32 rounded-full border-2 border-white/20" />
              <div className="absolute bottom-4 right-16 w-48 h-48 rounded-full border-2 border-white/20" />
              <div className="absolute top-16 right-32 w-16 h-16 rounded-full border-2 border-white/20" />
            </div>
          </div>

          {/* Profile info */}
          <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="ring-4 ring-white rounded-full shadow-lg">
                <Avatar
                  name={profile.fullName}
                  avatarUrl={profile.avatarUrl}
                  size="xl"
                />
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.fullName}
                    </h1>
                    {profile.aboutLine && (
                      <p className="text-sm text-gray-600 mt-0.5 max-w-md">
                        {profile.aboutLine}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isOwnProfile && (
                      <Link
                        href={`/messages?with=${profile.id}`}
                        className="btn-primary flex items-center gap-1.5 text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Link>
                    )}
                    {renderConnectButton()}
                  </div>
                </div>

                {/* Meta info row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-tetr-gray">
                  {profile.batch && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Batch {profile.batch}
                    </span>
                  )}
                  <span className="flex items-center gap-1 capitalize">
                    <Briefcase className="w-4 h-4" />
                    {profile.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    TETR College of Business
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm">
                    <strong className="text-gray-900">{connectionCount}</strong>{" "}
                    <span className="text-tetr-gray">
                      connection{connectionCount !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="text-sm">
                    <strong className="text-gray-900">{clubCount}</strong>{" "}
                    <span className="text-tetr-gray">
                      club{clubCount !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="text-sm">
                    <strong className="text-gray-900">{postCount}</strong>{" "}
                    <span className="text-tetr-gray">
                      post{postCount !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="text-sm text-tetr-gray">
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Analytics card (own profile) */}
            {isOwnProfile && (
              <div className="card p-5 animate-slide-up">
                <h3 className="section-title text-base mb-4">
                  <BarChart3 className="w-5 h-5 text-tetr-green" />
                  Profile Analytics
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-tetr-gray-light rounded-xl">
                    <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">48</p>
                    <p className="text-[11px] text-tetr-gray">Profile views</p>
                  </div>
                  <div className="text-center p-3 bg-tetr-gray-light rounded-xl">
                    <Users className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{connectionCount}</p>
                    <p className="text-[11px] text-tetr-gray">Connections</p>
                  </div>
                  <div className="text-center p-3 bg-tetr-gray-light rounded-xl">
                    <TrendingUp className="w-5 h-5 text-tetr-green mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{postCount}</p>
                    <p className="text-[11px] text-tetr-gray">Posts</p>
                  </div>
                </div>
              </div>
            )}

            {/* About card */}
            <div className="card p-5 animate-slide-up">
              <h3 className="section-title text-base mb-4">
                <Globe className="w-5 h-5 text-tetr-green" />
                About
              </h3>

              {profile.expertise && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profile.expertise}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {profile.excitedField && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-tetr-green mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-tetr-gray uppercase tracking-wide font-medium">
                        Interested in
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {fieldIconMap[profile.excitedField] || profile.excitedField}
                      </p>
                    </div>
                  </div>
                )}

                {profile.experienceLevel && (
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-tetr-green mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-tetr-gray uppercase tracking-wide font-medium">
                        Experience level
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {experienceMap[profile.experienceLevel] ||
                          profile.experienceLevel}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-tetr-green mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-tetr-gray uppercase tracking-wide font-medium">
                      Joined
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {memberSince}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume card */}
            {(profile.resumeUrl || isOwnProfile) && (
              <div className="card p-5 animate-slide-up">
                <h3 className="section-title text-base mb-4">
                  <FileText className="w-5 h-5 text-tetr-green" />
                  Resume
                </h3>
                {profile.resumeUrl ? (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-tetr-gray-light rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-tetr-green transition-colors">
                        {profile.fullName}&apos;s Resume
                      </p>
                      <p className="text-xs text-tetr-gray truncate">
                        {profile.resumeUrl}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-tetr-gray group-hover:text-tetr-green transition-colors shrink-0" />
                  </a>
                ) : isOwnProfile ? (
                  <div className="text-center py-4">
                    <Upload className="w-8 h-8 text-tetr-gray mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-tetr-gray mb-3">
                      Add your resume link to showcase your experience
                    </p>
                    <button
                      onClick={openEditModal}
                      className="btn-primary text-sm"
                    >
                      Add Resume Link
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Clubs card */}
            {clubCount > 0 && (
              <div className="card p-5 animate-slide-up">
                <h3 className="section-title text-base mb-4">
                  <BookOpen className="w-5 h-5 text-tetr-green" />
                  Clubs & Societies
                </h3>
                <div className="space-y-3">
                  {profile.clubMembers.map((cm: any) => (
                    <Link
                      key={cm.club.id}
                      href={`/clubs/${cm.club.id}`}
                      className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-tetr-gray-light transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tetr-green to-tetr-green-light flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {cm.club.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-tetr-green transition-colors">
                          {cm.club.name}
                        </p>
                        <p className="text-xs text-tetr-gray capitalize">
                          {cm.role} &middot; Member
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-tetr-gray opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column (main content) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tabs */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-tetr-border">
                {(["about", "posts", "activity"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? "text-tetr-green"
                        : "text-tetr-gray hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-tetr-green rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* About Tab */}
              {activeTab === "about" && (
                <div className="p-6 space-y-6 animate-fade-in">
                  {/* Education section */}
                  <div>
                    <h4 className="section-title text-sm mb-3">
                      <GraduationCap className="w-4 h-4 text-tetr-green" />
                      Education
                    </h4>
                    <div className="flex items-start gap-4 p-4 bg-tetr-gray-light rounded-xl">
                      <img src="/tetr-logo.svg" alt="TETR" className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-gray-200 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          TETR College of Business
                        </p>
                        {profile.batch && (
                          <p className="text-sm text-gray-600">
                            Batch {profile.batch}
                          </p>
                        )}
                        <p className="text-sm text-tetr-gray capitalize">
                          {profile.role}
                        </p>
                        <p className="text-xs text-tetr-gray mt-1">
                          Joined {memberSince}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Expertise */}
                  {profile.expertise && (
                    <div>
                      <h4 className="section-title text-sm mb-3">
                        <Award className="w-4 h-4 text-tetr-green" />
                        Skills & Expertise
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed p-4 bg-tetr-gray-light rounded-xl">
                        {profile.expertise}
                      </p>
                    </div>
                  )}

                  {/* Interests & Goals */}
                  {(profile.excitedField || profile.experienceLevel) && (
                    <div>
                      <h4 className="section-title text-sm mb-3">
                        <Sparkles className="w-4 h-4 text-tetr-green" />
                        Interests & Goals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.excitedField && (
                          <span className="badge badge-green text-sm py-1.5 px-4">
                            {fieldIconMap[profile.excitedField] || profile.excitedField}
                          </span>
                        )}
                        {profile.experienceLevel && (
                          <span className="badge badge-gray text-sm py-1.5 px-4">
                            {experienceMap[profile.experienceLevel] || profile.experienceLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resume in About tab */}
                  {profile.resumeUrl && (
                    <div>
                      <h4 className="section-title text-sm mb-3">
                        <FileText className="w-4 h-4 text-tetr-green" />
                        Resume
                      </h4>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-tetr-gray-light rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-tetr-green transition-colors">
                            View Resume
                          </p>
                          <p className="text-xs text-tetr-gray truncate">
                            {profile.resumeUrl}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-tetr-gray group-hover:text-tetr-green transition-colors" />
                      </a>
                    </div>
                  )}

                  {/* Recent activity summary */}
                  {postCount > 0 && (
                    <div>
                      <h4 className="section-title text-sm mb-3">
                        <TrendingUp className="w-4 h-4 text-tetr-green" />
                        Recent Activity
                      </h4>
                      <div className="space-y-2">
                        {profile.posts?.slice(0, 3).map((post: any) => (
                          <div
                            key={post.id}
                            className="p-3 border border-tetr-border rounded-xl hover:bg-tetr-gray-light transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {post.type !== "General" && (
                                <span className="badge badge-green text-[10px]">
                                  {post.type}
                                </span>
                              )}
                              <span className="text-xs text-tetr-gray">
                                {formatDistanceToNow(new Date(post.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            {post.title && (
                              <p className="text-sm font-medium text-gray-900">
                                {post.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {post.body}
                            </p>
                          </div>
                        ))}
                      </div>
                      {postCount > 3 && (
                        <button
                          onClick={() => setActiveTab("posts")}
                          className="mt-3 text-sm text-tetr-green font-medium hover:underline flex items-center gap-1"
                        >
                          View all {postCount} posts
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === "posts" && (
                <div className="p-4 animate-fade-in">
                  {loadingPosts ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : allPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-10 h-10 text-tetr-gray mx-auto mb-3 opacity-40" />
                      <p className="text-sm text-tetr-gray">
                        {isOwnProfile
                          ? "You haven't shared any posts yet."
                          : `${profile.fullName.split(" ")[0]} hasn't shared any posts yet.`}
                      </p>
                      {isOwnProfile && (
                        <Link href="/feed" className="btn-primary inline-block mt-3 text-sm">
                          Create your first post
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allPosts.map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="p-6 animate-fade-in">
                  {loadingPosts ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : allPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-10 h-10 text-tetr-gray mx-auto mb-3 opacity-40" />
                      <p className="text-sm text-tetr-gray">No activity yet.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-2 bottom-2 w-px bg-tetr-border" />
                      <div className="space-y-6">
                        {allPosts.map((post: any) => (
                          <div key={post.id} className="flex gap-4 relative">
                            <div className="w-10 h-10 rounded-full bg-tetr-green-bg border-2 border-tetr-border flex items-center justify-center shrink-0 z-10">
                              <FileText className="w-4 h-4 text-tetr-green" />
                            </div>
                            <div className="flex-1 p-4 border border-tetr-border rounded-xl hover:shadow-sm transition-shadow">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-tetr-gray">
                                  {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                                {post.type !== "General" && (
                                  <span className="badge badge-green text-[10px]">
                                    {post.type}
                                  </span>
                                )}
                              </div>
                              {post.title && (
                                <p className="text-sm font-semibold text-gray-900">
                                  {post.title}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 line-clamp-3 mt-0.5">
                                {post.body}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-xs text-tetr-gray">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {post.likes?.length || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {post.comments?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-tetr-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              {/* About / Headline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={editForm.aboutLine}
                  onChange={(e) => setEditForm({ ...editForm, aboutLine: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Finance Major | Aspiring Consultant"
                />
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch
                </label>
                <select
                  value={editForm.batch}
                  onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select batch</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>

              {/* Skills & Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Skills & Expertise
                </label>
                <textarea
                  value={editForm.expertise}
                  onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="e.g. Financial modeling, Python, Data Analysis"
                  rows={3}
                />
              </div>

              {/* Field of Interest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Field of Interest
                </label>
                <select
                  value={editForm.excitedField}
                  onChange={(e) => setEditForm({ ...editForm, excitedField: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select field</option>
                  <option value="Finance">Finance</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="Operations">Operations</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={editForm.experienceLevel}
                  onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select level</option>
                  <option value="Intern">Intern</option>
                  <option value="Project-based">Project-based</option>
                  <option value="Startup founder">Startup Founder</option>
                  <option value="Full-time professional">Full-time Professional</option>
                  <option value="Faculty / Mentor">Faculty / Mentor</option>
                </select>
              </div>

              {/* Resume URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-tetr-green" />
                    Resume Link
                  </span>
                </label>
                <input
                  type="url"
                  value={editForm.resumeUrl}
                  onChange={(e) => setEditForm({ ...editForm, resumeUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://drive.google.com/your-resume or LinkedIn profile URL"
                />
                <p className="text-xs text-tetr-gray mt-1">
                  Paste a link to your resume (Google Drive, Dropbox, LinkedIn, etc.)
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-tetr-border px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || !editForm.fullName.trim()}
                className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
