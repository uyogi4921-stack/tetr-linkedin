"use client";

import { FileText, Link as LinkIcon, Download, Heart } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useState } from "react";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string | null;
    fileUrl?: string | null;
    type: string;
    club?: { id: string; name: string } | null;
    likes: { userId: string }[];
  };
}

const typeIcons: Record<string, string> = {
  Guide: "bg-blue-50 text-blue-600",
  "Competition deck": "bg-purple-50 text-purple-600",
  "Company list": "bg-green-50 text-green-600",
  Template: "bg-amber-50 text-amber-600",
  Video: "bg-red-50 text-red-600",
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(resource.likes.length);
  const [isLiked, setIsLiked] = useState(resource.likes.some((l) => l.userId === user?.id));

  const colorClass = typeIcons[resource.type] || "bg-gray-50 text-gray-600";

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">{resource.title}</h3>
          <span className="badge badge-gray mt-1">{resource.type}</span>
          {resource.description && (
            <p className="text-sm text-tetr-gray mt-1.5 line-clamp-2">{resource.description}</p>
          )}
          {resource.club && (
            <p className="text-xs text-tetr-gray mt-1">
              From <span className="text-tetr-green font-medium">{resource.club.name}</span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-tetr-border">
        <button
          onClick={async () => {
            const prev = isLiked;
            setIsLiked(!prev);
            setLikeCount((c) => (prev ? c - 1 : c + 1));
          }}
          className={`flex items-center gap-1 text-sm ${
            isLiked ? "text-tetr-green font-medium" : "text-tetr-gray hover:text-tetr-green"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-tetr-green" : ""}`} />
          {likeCount > 0 && likeCount}
        </button>
        {resource.fileUrl && (
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-tetr-green hover:underline"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            View
          </a>
        )}
      </div>
    </div>
  );
}
