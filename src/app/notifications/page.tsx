"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Bell, MessageCircle, Calendar, Heart, CheckCheck } from "lucide-react";
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

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-tetr-dark">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-tetr-green hover:underline">
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
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              const content = (
                <div className={`card p-4 flex items-start gap-3 transition-colors ${!notif.isRead ? "bg-tetr-green-bg border-tetr-green-lighter" : ""}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? "bg-tetr-green text-white" : "bg-tetr-gray-light text-tetr-gray"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-medium text-gray-900" : "text-gray-700"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-tetr-gray mt-0.5">{notif.message}</p>
                    <p className="text-[11px] text-tetr-gray mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-tetr-green rounded-full mt-2 shrink-0" />}
                </div>
              );
              return notif.link ? (
                <Link key={notif.id} href={notif.link}>{content}</Link>
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
