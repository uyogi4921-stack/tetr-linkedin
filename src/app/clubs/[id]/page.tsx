"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";
import EventCard from "@/components/EventCard";
import Avatar from "@/components/Avatar";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClubDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;
  const [club, setClub] = useState<any>(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState<"posts" | "events" | "members">("posts");

  const fetchClub = useCallback(async () => {
    const res = await fetch(`/api/clubs/${clubId}`);
    const data = await res.json();
    setClub(data.club);
    setIsMember(data.club?.members?.some((m: any) => m.userId === user?.id) || false);
    setLoadingClub(false);
  }, [clubId, user?.id]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    fetchClub();
  }, [user, loading, router, fetchClub]);

  const handleJoin = async () => {
    setJoining(true);
    const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
    const data = await res.json();
    setIsMember(data.joined);
    fetchClub();
    setJoining(false);
  };

  if (loading || !user || loadingClub) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-tetr-gray">Club not found.</p>
          <Link href="/clubs" className="text-tetr-green hover:underline text-sm mt-2 inline-block">Back to Clubs</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "posts", label: `Posts (${club.posts?.length || 0})` },
    { key: "events", label: `Events (${club.events?.length || 0})` },
    { key: "members", label: `Members (${club.members?.length || 0})` },
  ] as const;

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/clubs" className="inline-flex items-center gap-1 text-sm text-tetr-gray hover:text-tetr-green mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>

        <div className="card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-tetr-green to-tetr-green-light flex items-end p-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{club.name}</h1>
              <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                <Users className="w-4 h-4" /> {club.members?.length || 0} members
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            {club.description && <p className="text-sm text-tetr-gray flex-1">{club.description}</p>}
            <button onClick={handleJoin} disabled={joining} className={isMember ? "btn-secondary" : "btn-primary"}>
              {joining ? "..." : isMember ? "Leave Club" : "Join Club"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-4 border-b border-tetr-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-tetr-green border-b-2 border-tetr-green"
                  : "text-tetr-gray hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "posts" && (
          <div className="space-y-4">
            {isMember && <CreatePost clubId={clubId} onPostCreated={fetchClub} />}
            {club.posts?.length === 0 ? (
              <div className="card p-8 text-center"><p className="text-tetr-gray">No posts in this club yet.</p></div>
            ) : (
              club.posts?.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {tab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {club.events?.length === 0 ? (
              <div className="card p-8 text-center col-span-full"><p className="text-tetr-gray">No events scheduled.</p></div>
            ) : (
              club.events?.map((event: any) => <EventCard key={event.id} event={{ ...event, attendees: [] }} />)
            )}
          </div>
        )}

        {tab === "members" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.members?.map((m: any) => (
              <Link key={m.user.id} href={`/profile/${m.user.id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <Avatar name={m.user.fullName} avatarUrl={m.user.avatarUrl} />
                <div>
                  <p className="font-medium text-sm text-gray-900">{m.user.fullName}</p>
                  <p className="text-xs text-tetr-gray">{m.user.batch}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
