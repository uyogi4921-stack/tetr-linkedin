"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  Home,
  Users,
  Calendar,
  BookOpen,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showMobile, setShowMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        const unread = d.notifications?.filter((n: { isRead: boolean }) => !n.isRead).length || 0;
        setUnreadNotifs(unread);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/people?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  if (!user) return null;

  const navItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/people", icon: Users, label: "People" },
    { href: "/clubs", icon: BookOpen, label: "Clubs" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/resources", icon: BookOpen, label: "Resources" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-tetr-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <img src="/tetr-logo.svg" alt="TETR" className="h-9 w-auto" />
          </Link>
          <form onSubmit={handleSearch} className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tetr-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search people, clubs, interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-tetr-gray-light rounded-md text-sm w-64 outline-none focus:ring-2 focus:ring-tetr-green/20 focus:bg-white border border-transparent focus:border-tetr-green/30"
            />
          </form>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center px-3 py-1 text-tetr-gray hover:text-tetr-green transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          ))}
          <Link
            href="/messages"
            className="flex flex-col items-center px-3 py-1 text-tetr-gray hover:text-tetr-green transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Messages</span>
          </Link>
          <Link
            href="/notifications"
            className="flex flex-col items-center px-3 py-1 text-tetr-gray hover:text-tetr-green transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
            <span className="text-[11px] mt-0.5">Alerts</span>
          </Link>

          <div ref={profileRef} className="relative ml-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full bg-tetr-green-lighter text-tetr-dark font-semibold text-sm flex items-center justify-center hover:ring-2 hover:ring-tetr-green/30 transition-all"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 card p-2 animate-fade-in">
                <div className="px-3 py-2 border-b border-tetr-border mb-1">
                  <p className="font-medium text-sm text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-tetr-gray">{user.batch} &middot; {user.role}</p>
                </div>
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="w-4 h-4" /> View Profile
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-md"
                    onClick={() => setShowProfile(false)}
                  >
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>

        <button
          className="md:hidden p-2 text-tetr-gray"
          onClick={() => setShowMobile(!showMobile)}
        >
          {showMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {showMobile && (
        <div className="md:hidden bg-white border-t border-tetr-border animate-fade-in">
          <form onSubmit={handleSearch} className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tetr-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </form>
          <nav className="px-2 pb-2 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobile(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md"
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            ))}
            <Link
              href="/messages"
              onClick={() => setShowMobile(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md"
            >
              <MessageSquare className="w-5 h-5" /> Messages
            </Link>
            <Link
              href="/notifications"
              onClick={() => setShowMobile(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-tetr-gray-light rounded-md"
            >
              <Bell className="w-5 h-5" /> Notifications
              {unreadNotifs > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{unreadNotifs}</span>
              )}
            </Link>
            <hr className="my-1 border-tetr-border" />
            {user.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setShowMobile(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-amber-700 hover:bg-amber-50 rounded-md"
              >
                <Shield className="w-5 h-5" /> Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
