"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "@/lib/useAuth";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";
import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    title?: string | null;
    body: string;
    imageUrl?: string | null;
    type: string;
    isPinned: boolean;
    createdAt: string;
    author: {
      id: string;
      fullName: string;
      batch: string | null;
      role: string;
      avatarUrl: string | null;
    };
    comments: { id: string }[];
    likes: { userId: string }[];
  };
  onLikeToggle?: () => void;
}

export default function PostCard({ post, onLikeToggle }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(
    post.likes.some((l) => l.userId === user?.id)
  );
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    // Optimistic update — flip immediately
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      // Reconcile with server response
      setIsLiked(data.liked);
      setLikeCount((c) => {
        // If server disagrees with our optimistic update, fix it
        if (data.liked && wasLiked) return c + 1; // we decremented but server says still liked
        if (!data.liked && !wasLiked) return c - 1; // we incremented but server says not liked
        return c;
      });
    } catch {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
    setLiking(false);
  };

  const typeColors: Record<string, string> = {
    General: "badge-gray",
    Opportunity: "bg-blue-50 text-blue-700",
    "Help me": "bg-amber-50 text-amber-700",
    Reflection: "bg-purple-50 text-purple-700",
    "Event announcement": "bg-green-50 text-green-700",
    Resource: "bg-teal-50 text-teal-700",
  };

  return (
    <div className="card animate-fade-in">
      <div className="p-4">
        {post.isPinned && (
          <div className="text-xs text-tetr-gray mb-2 flex items-center gap-1">
            <span className="text-tetr-green font-medium">Pinned</span>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Link href={`/profile/${post.author.id}`} className="shrink-0">
            <Avatar
              name={post.author.fullName}
              avatarUrl={post.author.avatarUrl}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-semibold text-sm text-gray-900 hover:text-tetr-green hover:underline transition-colors"
                >
                  {post.author.fullName}
                </Link>
                {post.author.batch && (
                  <span className="text-xs text-tetr-gray ml-1.5">
                    &middot; {post.author.batch}
                  </span>
                )}
              </div>
              <button className="text-tetr-gray hover:text-gray-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-tetr-gray capitalize">
              {post.author.role}
            </p>
            <p className="text-[11px] text-tetr-gray">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="mt-3">
          {post.type !== "General" && (
            <span
              className={`badge ${typeColors[post.type] || "badge-gray"} mb-2`}
            >
              {post.type}
            </span>
          )}
          {post.title && (
            <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
          )}
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.body}
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 rounded-lg w-full max-h-96 object-cover"
            />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-tetr-gray pt-2 border-t border-tetr-border">
          <span>
            {likeCount > 0 &&
              `${likeCount} like${likeCount !== 1 ? "s" : ""}`}
          </span>
          <span>
            {post.comments.length > 0 &&
              `${post.comments.length} comment${post.comments.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 pt-1 border-t border-tetr-border">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-colors cursor-pointer select-none ${
              isLiked
                ? "text-tetr-green font-medium"
                : "text-tetr-gray hover:bg-tetr-gray-light"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-tetr-green" : ""}`}
            />
            Like
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm text-tetr-gray hover:bg-tetr-gray-light transition-colors cursor-pointer select-none"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm text-tetr-gray hover:bg-tetr-gray-light transition-colors cursor-pointer select-none">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}
