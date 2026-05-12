"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentData {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; fullName: string; batch: string | null; avatarUrl: string | null };
  replies?: CommentData[];
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {});
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), postId, parentId: replyTo }),
    });
    if (res.ok) {
      setText("");
      setReplyTo(null);
      const r = await fetch(`/api/comments?postId=${postId}`);
      const d = await r.json();
      setComments(d.comments || []);
    }
    setSubmitting(false);
  };

  const renderComment = (comment: CommentData, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-10" : ""} flex gap-2.5 py-2`}>
      <Avatar name={comment.author.fullName} avatarUrl={comment.author.avatarUrl} size="sm" />
      <div className="flex-1">
        <div className="bg-tetr-gray-light rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-xs text-gray-900">{comment.author.fullName}</span>
            {comment.author.batch && (
              <span className="text-[11px] text-tetr-gray">{comment.author.batch}</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[11px] text-tetr-gray">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-[11px] text-tetr-gray font-medium hover:text-tetr-green"
            >
              Reply
            </button>
          )}
        </div>
        {replyTo === comment.id && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a reply..."
              className="input-field text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-3">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-4 border-t border-tetr-border">
      <div className="mt-2 space-y-1">
        {comments.map((c) => renderComment(c))}
      </div>
      {!replyTo && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="input-field text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-3">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
