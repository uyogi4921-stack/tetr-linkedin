"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";

export default function EventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    setLoadingEvents(true);
    fetch(`/api/events?tab=${tab}`)
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoadingEvents(false); });
  }, [user, loading, router, tab]);

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-tetr-dark mb-1">Events</h1>
        <p className="text-sm text-tetr-gray mb-6">Discover workshops, competitions, guest lectures, and Tetr Takeovers.</p>

        <div className="flex gap-1 mb-6 border-b border-tetr-border">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "text-tetr-green border-b-2 border-tetr-green"
                  : "text-tetr-gray hover:text-gray-700"
              }`}
            >
              {t} Events
            </button>
          ))}
        </div>

        {loadingEvents ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>
        ) : events.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-tetr-gray">
              {tab === "upcoming" ? "No upcoming events at the moment." : "No past events to show."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
