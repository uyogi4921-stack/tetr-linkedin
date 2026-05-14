"use client";

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Check,
  Link as LinkIcon,
  Copy,
  Trash2,
  Flag,
  X,
  AlertTriangle,
} from "lucide-react";
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
  onDelete?: () => void;
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Harassment or bullying",
  "Inappropriate content",
  "False information",
  "Other",
];

export default function PostCard({ post, onLikeToggle, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(
    post.likes.some((l) => l.userId === user?.id)
  );
  const [liking, setLiking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Menu & modals
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.author.id;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showMenu]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
        setShowDeleteConfirm(false);
        onDelete?.();
      }
    } catch {
      // ignore
    }
    setDeleteLoading(false);
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportReason("");
        }, 1500);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to report");
      }
    } catch {
      // ignore
    }
    setReportSubmitting(false);
  };

  if (deleted) return null;

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

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed#post-${post.id}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || `Post by ${post.author.fullName}`,
          text: post.body.slice(0, 100) + (post.body.length > 100 ? "..." : ""),
          url: postUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browser fallback
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-tetr-gray hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 animate-fade-in">
                    {isOwner ? (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete post
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowReportModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        Report post
                      </button>
                    )}
                  </div>
                )}
              </div>
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
          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-colors cursor-pointer select-none ${
              copied
                ? "text-tetr-green font-medium"
                : "text-tetr-gray hover:bg-tetr-gray-light"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {showComments && <CommentSection postId={post.id} />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete post?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-fade-in">
            {reportSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Report submitted</h3>
                <p className="text-xs text-gray-500 mt-1">Thank you. We&apos;ll review this post.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Report post</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Why are you reporting this post?</p>
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                        reportReason === reason
                          ? "border-tetr-green bg-tetr-green-bg text-tetr-green font-medium"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleReport}
                  disabled={!reportReason || reportSubmitting}
                  className="w-full py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportSubmitting ? "Submitting..." : "Submit report"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
