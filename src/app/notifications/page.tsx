"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Bell, MessageCircle, Calendar, Heart, CheckCheck, UserPlus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotifData {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  comment: MessageCircle,
  like: Heart,
  event: Calendar,
  announcement: Bell,
  connection: UserPlus,
  message: MessageSquare,
};

const typeColors: Record<string, string> = {
  connection: "bg-tetr-green text-white",
  message: "bg-blue-500 text-white",
  like: "bg-pink-500 text-white",
  comment: "bg-amber-500 text-white",
  event: "bg-purple-500 text-white",
  announcement: "bg-gray-500 text-white",
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotifData[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    fetch("/api/notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoadingNotifs(false); });
  }, [user, loading, router]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const markOneRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-tetr-gray-light"><Header /><div className="flex-1 flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div></div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-tetr-dark">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-tetr-gray mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-tetr-green hover:underline font-medium">
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        {loadingNotifs ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell className="w-8 h-8 text-tetr-gray mx-auto mb-2" />
            <p className="text-tetr-gray">No notifications yet.</p>
            <p className="text-xs text-tetr-gray mt-1">When someone connects with you or messages you, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              const colorClass = !notif.isRead
                ? (typeColors[notif.type] || "bg-tetr-green text-white")
                : "bg-tetr-gray-light text-tetr-gray";

              const handleClick = () => {
                if (!notif.isRead) markOneRead(notif.id);
              };

              const content = (
                <div
                  className={`card p-4 flex items-start gap-3 transition-all hover:shadow-sm cursor-pointer ${
                    !notif.isRead ? "bg-tetr-green-bg/50 border-l-4 border-l-tetr-green" : "border-l-4 border-l-transparent"
                  }`}
                  onClick={handleClick}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-[11px] text-tetr-gray mt-1.5">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.isRead && <div className="w-2.5 h-2.5 bg-tetr-green rounded-full mt-2 shrink-0 animate-pulse" />}
                </div>
              );

              return notif.link ? (
                <Link key={notif.id} href={notif.link} onClick={handleClick}>{content}</Link>
              ) : (
                <div key={notif.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
