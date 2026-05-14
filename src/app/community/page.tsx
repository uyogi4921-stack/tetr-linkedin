"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import {
  MessageCircle,
  Megaphone,
  Globe,
  Users,
  Palette,
  Scale,
  Languages,
  ExternalLink,
  Hash,
} from "lucide-react";

const MAIN_PLATFORMS = [
  {
    name: "Circle of Friends",
    description: "Main community hub for conversations, activities, announcements, challenges, meetups, and access to clubs/groups.",
    url: "https://chat.whatsapp.com/HCNOJpEp6dy0EzmoBI3502",
    icon: MessageCircle,
    color: "bg-green-500",
    tag: "WhatsApp",
  },
  {
    name: "Announcements",
    description: "Official announcements page where updates, important information, activities, and community notices will be posted.",
    url: "https://chat.whatsapp.com/LyRCN9VyTsxKFjJiD1MKzE",
    icon: Megaphone,
    color: "bg-green-600",
    tag: "WhatsApp",
  },
  {
    name: "Instagram Community",
    description: "Fast-paced social space for casual interaction and community engagement.",
    url: "https://ig.me/j/AbY5AprZ_bWlA_hu/",
    icon: Hash,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    tag: "Instagram",
  },
  {
    name: "Discord Server",
    description: "Additional platform with multiple channels, topic discussions, and voice chats.",
    url: "https://discord.gg/ffQjwTDC",
    icon: Globe,
    color: "bg-indigo-500",
    tag: "Discord",
  },
  {
    name: "Snapchat Group",
    description: "Community space for casual updates, interaction, and staying connected.",
    url: "https://snapchat.com/t/fDoTcnw7",
    icon: MessageCircle,
    color: "bg-yellow-400",
    tag: "Snapchat",
  },
];

const CLUBS_GROUPS = [
  {
    name: "Tetr Clubs Hub",
    description: "Central space for all clubs, activities, collaborations, and interest-based communities.",
    url: "https://chat.whatsapp.com/GSeboCJrwWU6DlyScKh9Hv",
    icon: Users,
    color: "bg-tetr-green",
  },
  {
    name: "Arts & Crafts Club",
    description: "For art, DIY projects, digital art, crafts, creative challenges, and sharing projects.",
    url: "https://chat.whatsapp.com/D1LIenoVtpq3bU1YL7banC",
    icon: Palette,
    color: "bg-pink-500",
  },
  {
    name: "Debating Club",
    description: "Debates, courtroom battles, negotiations, crisis simulations, ethical discussions, and strategy-based challenges. Run by Shradhani and Sahasra.",
    url: "https://chat.whatsapp.com/D1LIenoVtpq3bU1YL7banC",
    icon: Scale,
    color: "bg-amber-500",
  },
  {
    name: "German Language Club",
    description: "Learn and practice German with fellow TETR students.",
    url: null,
    icon: Languages,
    color: "bg-red-500",
  },
  {
    name: "Spanish Language Club",
    description: "Learn and practice Spanish with fellow TETR students.",
    url: "https://chat.whatsapp.com/BQKGS175FX70F7IvOO8tEf",
    icon: Languages,
    color: "bg-orange-500",
  },
  {
    name: "Hindi Language Club",
    description: "Learn and practice Hindi with fellow TETR students.",
    url: "https://chat.whatsapp.com/BQKGS175FX70F7IvOO8tEf",
    icon: Languages,
    color: "bg-blue-500",
  },
];

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Community Platforms</h1>
          <p className="text-sm text-tetr-gray mt-1">
            Join our community across multiple platforms. Stay connected with your batch-mates and TETR community.
          </p>
        </div>

        {/* Main Platforms */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-tetr-green" />
            Main Platforms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAIN_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-5 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${platform.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-tetr-green transition-colors">
                          {platform.name}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {platform.tag}
                      </span>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Clubs & Interest Groups */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-tetr-green" />
            Clubs & Interest Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLUBS_GROUPS.map((club) => {
              const Icon = club.icon;
              const Wrapper = club.url ? "a" : "div";
              const linkProps = club.url
                ? { href: club.url, target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper
                  key={club.name}
                  {...(linkProps as any)}
                  className={`card p-5 transition-all ${club.url ? "hover:shadow-lg group cursor-pointer" : "opacity-80"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${club.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-tetr-green transition-colors">
                          {club.name}
                        </h3>
                        {club.url && (
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        {club.description}
                      </p>
                      {!club.url && (
                        <span className="inline-block mt-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Link coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
