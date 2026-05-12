"use client";

import { useState } from "react";
import { Calendar, MapPin, Users, Video } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/useAuth";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime?: string | null;
    location?: string | null;
    isOnline: boolean;
    type: string;
    club?: { id: string; name: string } | null;
    attendees: { userId: string; status: string }[];
  };
}

const typeColors: Record<string, string> = {
  "Case competition": "bg-purple-50 text-purple-700 border-purple-200",
  "Tetr Takeover": "bg-orange-50 text-orange-700 border-orange-200",
  "Guest lecture": "bg-blue-50 text-blue-700 border-blue-200",
  "Club meetup": "bg-green-50 text-green-700 border-green-200",
  Workshop: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [myStatus, setMyStatus] = useState<string | null>(
    event.attendees.find((a) => a.userId === user?.id)?.status || null
  );
  const [attendeeCount, setAttendeeCount] = useState(event.attendees.length);

  const handleAttend = async (status: string) => {
    const res = await fetch(`/api/events/${event.id}/attend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.attending === null) {
      setMyStatus(null);
      setAttendeeCount((c) => c - 1);
    } else {
      if (!myStatus) setAttendeeCount((c) => c + 1);
      setMyStatus(data.attending);
    }
  };

  const colorClass = typeColors[event.type] || "bg-gray-50 text-gray-700 border-gray-200";
  const date = new Date(event.startTime);

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className={`px-4 py-2 border-b ${colorClass}`}>
        <span className="text-xs font-medium">{event.type}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-tetr-gray mb-3 line-clamp-2">{event.description}</p>
        )}
        <div className="space-y-1.5 text-sm text-tetr-gray">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{format(date, "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.isOnline ? (
              <>
                <Video className="w-4 h-4 shrink-0" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{event.location || "TBD"}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>{attendeeCount} interested</span>
          </div>
          {event.club && (
            <div className="text-xs">
              Hosted by <span className="font-medium text-tetr-green">{event.club.name}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleAttend("going")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              myStatus === "going"
                ? "bg-tetr-green text-white"
                : "border border-tetr-green text-tetr-green hover:bg-tetr-green-bg"
            }`}
          >
            Going
          </button>
          <button
            onClick={() => handleAttend("interested")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              myStatus === "interested"
                ? "bg-tetr-green-lighter text-tetr-dark"
                : "border border-tetr-border text-tetr-gray hover:bg-tetr-gray-light"
            }`}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
}
