"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { TrendingUp, Calendar, Users, BookOpen } from "lucide-react";

interface PostData {
  id: string;
  title?: string | null;
  body: string;
  imageUrl?: string | null;
  type: string;
  isPinned: boolean;
  createdAt: string;
  author: { id: string; fullName: string; batch: string | null; role: string; avatarUrl: string | null };
  comments: { id: string }[];
  likes: { userId: string }[];
}

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [events, setEvents] = useState<{ id: string; title: string; startTime: string; type: string }[]>([]);
  const [clubs, setClubs] = useState<{ id: string; name: string; _count: { members: number } }[]>([]);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!user.onboardingComplete) { router.replace("/onboarding"); return; }
    fetchPosts();
    fetch("/api/events?tab=upcoming").then(r => r.json()).then(d => setEvents((d.events || []).slice(0, 3)));
    fetch("/api/clubs").then(r => r.json()).then(d => setClubs((d.clubs || []).slice(0, 5)));
  }, [user, loading, router, fetchPosts]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TRENDING = ["#TETRCommunity", "#Batch2030Welcome", "#FacultyConnect", "#StaffNetworking", "#CaseCompetition"];

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="card p-4 sticky top-20">
              <Link href={`/profile/${user.id}`} className="block text-center group cursor-pointer">
                <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="lg" />
                <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-tetr-green transition-colors">{user.fullName}</h3>
                <p className="text-xs text-tetr-gray">
                  {user.batch && `Batch ${user.batch}`} &middot; {user.role}
                </p>
                {user.aboutLine && (
                  <p className="text-xs text-tetr-gray mt-1">{user.aboutLine}</p>
                )}
              </Link>
              <div className="mt-4 pt-3 border-t border-tetr-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-tetr-gray">Profile strength</span>
                  <span className="text-tetr-green font-medium">85%</span>
                </div>
                <div className="mt-1 h-1.5 bg-tetr-gray-light rounded-full overflow-hidden">
                  <div className="h-full bg-tetr-green rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <nav className="mt-4 pt-3 border-t border-tetr-border space-y-1">
                <Link href="/people" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md">
                  <Users className="w-4 h-4" /> My Network
                </Link>
                <Link href="/clubs" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md">
                  <BookOpen className="w-4 h-4" /> Clubs
                </Link>
                <Link href="/events" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md">
                  <Calendar className="w-4 h-4" /> Events
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main feed */}
          <main className="lg:col-span-6 space-y-4">
            <CreatePost onPostCreated={fetchPosts} />

            {loadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-tetr-gray">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onLikeToggle={fetchPosts} />
              ))
            )}
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-4 h-4 text-tetr-green" />
                Trending at TETR
              </h3>
              <div className="space-y-2">
                {TRENDING.map((tag) => (
                  <div key={tag} className="text-sm text-tetr-green font-medium hover:underline cursor-pointer">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {events.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5 mb-3">
                  <Calendar className="w-4 h-4 text-tetr-green" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <Link key={event.id} href="/events" className="block hover:bg-tetr-gray-light rounded-md p-1.5 -mx-1.5 transition-colors">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{event.title}</p>
                      <p className="text-xs text-tetr-gray">{new Date(event.startTime).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/events" className="block text-xs text-tetr-green font-medium mt-3 hover:underline">
                  View all events
                </Link>
              </div>
            )}

            {clubs.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-4 h-4 text-tetr-green" />
                  Suggested Clubs
                </h3>
                <div className="space-y-2">
                  {clubs.map((club) => (
                    <Link key={club.id} href={`/clubs/${club.id}`} className="flex items-center justify-between hover:bg-tetr-gray-light rounded-md p-1.5 -mx-1.5 transition-colors">
                      <span className="text-sm text-gray-700">{club.name}</span>
                      <span className="text-xs text-tetr-gray">{club._count.members} members</span>
                    </Link>
                  ))}
                </div>
                <Link href="/clubs" className="block text-xs text-tetr-green font-medium mt-3 hover:underline">
                  Explore all clubs
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
