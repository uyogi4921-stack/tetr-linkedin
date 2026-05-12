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
  FileText,
  ExternalLink,
  X,
  Save,
  Upload,
  Check,
  UserPlus,
  UserCheck,
  Clock,
  Camera,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "activity">(
    "about"
  );
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
            <p className="text-lg font-semibold text-gray-900">
              User not found
            </p>
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

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
        {/* ═══════════════════ PROFILE CARD (LinkedIn-style) ═══════════════════ */}
        <div className="card overflow-hidden">
          {/* Cover photo - just the gradient, no text on it */}
          <div className="h-[200px] bg-gradient-to-br from-tetr-dark via-tetr-green to-tetr-green-light relative">
            <div className="absolute inset-0 opacity-[0.07]">
              <div className="absolute top-6 left-10 w-28 h-28 rounded-full border-2 border-white" />
              <div className="absolute bottom-2 right-12 w-40 h-40 rounded-full border-2 border-white" />
              <div className="absolute top-14 right-28 w-14 h-14 rounded-full border-2 border-white" />
            </div>
            {isOwnProfile && (
              <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors" title="Change cover photo (coming soon)">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Profile info section - WHITE BACKGROUND */}
          <div className="relative px-6 sm:px-8 pb-6 bg-white">
            {/* Avatar - overlapping cover/white boundary */}
            <div className="-mt-[60px] mb-3 flex items-end justify-between">
              <div className="relative">
                <div className="ring-4 ring-white rounded-full shadow-lg bg-white">
                  <Avatar
                    name={profile.fullName}
                    avatarUrl={profile.avatarUrl}
                    size="xl"
                  />
                </div>
                {isOwnProfile && (
                  <button
                    className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    title="Change photo (coming soon)"
                  >
                    <Camera className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                )}
              </div>
              {/* Edit button positioned at top right of info section on desktop */}
              <div className="hidden sm:flex items-center gap-2 pt-2">
                {isOwnProfile && (
                  <button
                    onClick={openEditModal}
                    className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    title="Edit profile"
                  >
                    <Edit3 className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Name & headline - on WHITE background, fully readable */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {profile.fullName}
            </h1>
            {profile.aboutLine && (
              <p className="text-base text-gray-600 mt-1">{profile.aboutLine}</p>
            )}

            {/* Location & education line */}
            <div className="flex flex-wrap items-center gap-x-1 mt-2 text-sm text-gray-500">
              {profile.batch && (
                <span>Batch {profile.batch}</span>
              )}
              {profile.batch && <span>&middot;</span>}
              <span className="capitalize">{profile.role}</span>
              <span>&middot;</span>
              <span>TETR College of Business</span>
            </div>

            {/* Connections count - clickable like LinkedIn */}
            <div className="mt-2">
              <span className="text-sm font-semibold text-tetr-green hover:underline cursor-pointer">
                {connectionCount} connection{connectionCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Action buttons row */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={openEditModal}
                    className="px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors"
                  >
                    Edit Profile
                  </button>
                  <Link
                    href="/feed"
                    className="px-5 py-1.5 border border-tetr-green text-tetr-green text-sm font-semibold rounded-full hover:bg-tetr-green-bg transition-colors"
                  >
                    Add Post
                  </Link>
                </>
              ) : (
                <>
                  {/* Connect / Pending / Connected button */}
                  {connectionStatus === "accepted" ? (
                    <span className="px-5 py-1.5 bg-tetr-green-bg text-tetr-green text-sm font-semibold rounded-full flex items-center gap-1.5 cursor-default">
                      <UserCheck className="w-4 h-4" />
                      Connected
                    </span>
                  ) : connectionStatus === "pending_sent" ? (
                    <button
                      onClick={handleWithdrawConnection}
                      disabled={connectLoading}
                      className="px-5 py-1.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      {connectLoading ? "..." : "Pending"}
                    </button>
                  ) : connectionStatus === "pending_received" ? (
                    <button
                      onClick={handleAcceptConnection}
                      disabled={connectLoading}
                      className="px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      {connectLoading ? "..." : "Accept Request"}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connectLoading}
                      className="px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      {connectLoading ? "..." : "Connect"}
                    </button>
                  )}

                  {/* Message button */}
                  <Link
                    href={`/messages?with=${profile.id}`}
                    className="px-5 py-1.5 border border-tetr-green text-tetr-green text-sm font-semibold rounded-full hover:bg-tetr-green-bg transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
        {profile.aboutLine && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {profile.expertise || profile.aboutLine}
            </p>
          </div>
        )}

        {/* ═══════════════════ ACTIVITY SECTION ═══════════════════ */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Activity</h2>
              <p className="text-sm text-tetr-gray">
                {postCount} post{postCount !== 1 ? "s" : ""}
              </p>
            </div>
            {isOwnProfile && (
              <Link
                href="/feed"
                className="px-4 py-1.5 border border-tetr-green text-tetr-green text-sm font-semibold rounded-full hover:bg-tetr-green-bg transition-colors"
              >
                Create a post
              </Link>
            )}
          </div>

          {/* Tabs inside Activity */}
          <div className="flex border-b border-tetr-border mb-4">
            {(["posts", "about", "activity"] as const).map((tab) => {
              const labels: Record<string, string> = {
                posts: "Posts",
                about: "Details",
                activity: "Timeline",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                    activeTab === tab
                      ? "text-tetr-green"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {labels[tab]}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-tetr-green rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="animate-fade-in">
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {isOwnProfile
                      ? "You haven't shared any posts yet."
                      : `${profile.fullName.split(" ")[0]} hasn't shared any posts yet.`}
                  </p>
                  {isOwnProfile && (
                    <Link
                      href="/feed"
                      className="inline-block mt-3 px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors"
                    >
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

          {/* Details Tab (previously About) */}
          {activeTab === "about" && (
            <div className="space-y-5 animate-fade-in">
              {/* Education */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                <img
                  src="/tetr-logo.svg"
                  alt="TETR"
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-gray-100 shrink-0"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    TETR College of Business
                  </p>
                  <p className="text-sm text-gray-600">
                    {profile.program || "Management & Technology"}
                  </p>
                  {profile.batch && (
                    <p className="text-sm text-gray-500">
                      Batch {profile.batch}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {memberSince}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {profile.expertise && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.split(",").map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {(profile.excitedField || profile.experienceLevel) && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.excitedField && (
                      <span className="px-3 py-1.5 bg-tetr-green-bg text-tetr-green text-sm font-medium rounded-full">
                        {fieldIconMap[profile.excitedField] ||
                          profile.excitedField}
                      </span>
                    )}
                    {profile.experienceLevel && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {experienceMap[profile.experienceLevel] ||
                          profile.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Resume */}
              {profile.resumeUrl && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Resume
                  </h3>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-tetr-green transition-colors">
                        View Resume
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[250px]">
                        {profile.resumeUrl}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-tetr-green ml-2 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "activity" && (
            <div className="animate-fade-in">
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-10">
                  <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No activity yet.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
                  <div className="space-y-5">
                    {allPosts.map((post: any) => (
                      <div key={post.id} className="flex gap-4 relative">
                        <div className="w-10 h-10 rounded-full bg-tetr-green-bg border-2 border-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <FileText className="w-4 h-4 text-tetr-green" />
                        </div>
                        <div className="flex-1 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">
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
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
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

        {/* ═══════════════════ SIDEBAR SECTIONS (on wider screens they stack below) ═══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Resume card (own profile, if no resume yet) */}
          {isOwnProfile && !profile.resumeUrl && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Resume</h2>
              <div className="text-center py-4">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  Add your resume link to showcase your experience
                </p>
                <button
                  onClick={openEditModal}
                  className="px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors"
                >
                  Add Resume Link
                </button>
              </div>
            </div>
          )}

          {/* Clubs card */}
          {clubCount > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Clubs & Societies
              </h2>
              <div className="space-y-3">
                {profile.clubMembers.map((cm: any) => (
                  <Link
                    key={cm.club.id}
                    href={`/clubs/${cm.club.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tetr-green to-tetr-green-light flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {cm.club.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-tetr-green transition-colors">
                        {cm.club.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {cm.role}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ EDIT PROFILE MODAL ═══════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={editForm.aboutLine}
                  onChange={(e) =>
                    setEditForm({ ...editForm, aboutLine: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g. Finance Major | Aspiring Consultant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch
                </label>
                <select
                  value={editForm.batch}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select batch</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Skills & Expertise
                </label>
                <textarea
                  value={editForm.expertise}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expertise: e.target.value })
                  }
                  className="input-field min-h-[80px] resize-none"
                  placeholder="e.g. Financial modeling, Python, Data Analysis"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Field of Interest
                </label>
                <select
                  value={editForm.excitedField}
                  onChange={(e) =>
                    setEditForm({ ...editForm, excitedField: e.target.value })
                  }
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={editForm.experienceLevel}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      experienceLevel: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="">Select level</option>
                  <option value="Intern">Intern</option>
                  <option value="Project-based">Project-based</option>
                  <option value="Startup founder">Startup Founder</option>
                  <option value="Full-time professional">
                    Full-time Professional
                  </option>
                  <option value="Faculty / Mentor">Faculty / Mentor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Resume Link
                </label>
                <input
                  type="url"
                  value={editForm.resumeUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, resumeUrl: e.target.value })
                  }
                  className="input-field"
                  placeholder="https://drive.google.com/your-resume"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste a link to your resume (Google Drive, Dropbox, LinkedIn)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="input-field"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-1.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || !editForm.fullName.trim()}
                className="px-5 py-1.5 bg-tetr-green text-white text-sm font-semibold rounded-full hover:bg-tetr-dark transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
                    Save
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
