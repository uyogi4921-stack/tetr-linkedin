"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { Users, FileText, Calendar, ChevronRight } from "lucide-react";

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  members: { userId: string }[];
  _count: { posts: number; events: number; members: number };
}

export default function ClubsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    fetch("/api/clubs").then(r => r.json()).then(d => { setClubs(d.clubs || []); setLoadingClubs(false); });
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-tetr-dark">Clubs & Societies</h1>
            <p className="text-sm text-tetr-gray mt-0.5">Join clubs to connect with like-minded peers and access exclusive resources.</p>
          </div>
        </div>

        {loadingClubs ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>
        ) : clubs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-tetr-gray">No clubs available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => {
              const isMember = club.members.some(m => m.userId === user.id);
              return (
                <Link key={club.id} href={`/clubs/${club.id}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-24 bg-gradient-to-r from-tetr-green to-tetr-green-light flex items-end p-4">
                    <h3 className="text-lg font-bold text-white">{club.name}</h3>
                  </div>
                  <div className="p-4">
                    {club.description && (
                      <p className="text-sm text-tetr-gray line-clamp-2 mb-3">{club.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-tetr-gray">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {club._count.members} members</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {club._count.posts} posts</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {club._count.events} events</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {isMember ? (
                        <span className="badge badge-green">Member</span>
                      ) : (
                        <span className="badge badge-gray">Not joined</span>
                      )}
                      <span className="text-sm text-tetr-green font-medium flex items-center gap-0.5 group-hover:underline">
                        View Club <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
