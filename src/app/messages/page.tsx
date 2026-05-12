"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import { Send, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Thread {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  sender: { id: string; fullName: string; avatarUrl: string | null; batch: string | null };
  receiver: { id: string; fullName: string; avatarUrl: string | null; batch: string | null };
}

interface MessageData {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("with");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [activeUser, setActiveUser] = useState<{ id: string; fullName: string; avatarUrl: string | null; batch: string | null } | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    fetch("/api/messages").then(r => r.json()).then(d => setThreads(d.threads || []));
  }, [user, loading, router]);

  useEffect(() => {
    if (!chatWith || !user) return;
    fetch(`/api/messages?with=${chatWith}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []));

    const thread = threads.find(t => {
      const other = t.senderId === user.id ? t.receiver : t.sender;
      return other.id === chatWith;
    });
    if (thread) {
      setActiveUser(thread.senderId === user.id ? thread.receiver : thread.sender);
    } else {
      fetch(`/api/users/${chatWith}`).then(r => r.json()).then(d => {
        if (d.profile) setActiveUser({ id: d.profile.id, fullName: d.profile.fullName, avatarUrl: d.profile.avatarUrl, batch: d.profile.batch });
      });
    }
  }, [chatWith, user, threads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending || !chatWith) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), receiverId: chatWith }),
    });
    if (res.ok) {
      setText("");
      const r = await fetch(`/api/messages?with=${chatWith}`);
      const d = await r.json();
      setMessages(d.messages || []);
    }
    setSending(false);
  };

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="card flex h-[calc(100vh-8rem)] overflow-hidden">
          {/* Thread list */}
          <div className={`w-full md:w-80 border-r border-tetr-border flex flex-col ${chatWith ? "hidden md:flex" : ""}`}>
            <div className="p-4 border-b border-tetr-border">
              <h2 className="font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-sm text-tetr-gray">No conversations yet.</div>
              ) : (
                threads.map((thread) => {
                  const other = thread.senderId === user.id ? thread.receiver : thread.sender;
                  const isActive = chatWith === other.id;
                  const unread = !thread.isRead && thread.receiverId === user.id;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => router.push(`/messages?with=${other.id}`)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-tetr-gray-light transition-colors ${
                        isActive ? "bg-tetr-green-bg" : ""
                      }`}
                    >
                      <Avatar name={other.fullName} avatarUrl={other.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${unread ? "font-semibold" : "font-medium"} text-gray-900 truncate`}>
                            {other.fullName}
                          </span>
                          <span className="text-[11px] text-tetr-gray shrink-0">
                            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: false })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${unread ? "text-gray-800 font-medium" : "text-tetr-gray"}`}>
                          {thread.text}
                        </p>
                      </div>
                      {unread && <div className="w-2 h-2 bg-tetr-green rounded-full shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!chatWith ? "hidden md:flex" : ""}`}>
            {chatWith && activeUser ? (
              <>
                <div className="p-4 border-b border-tetr-border flex items-center gap-3">
                  <button onClick={() => router.push("/messages")} className="md:hidden text-tetr-gray">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar name={activeUser.fullName} avatarUrl={activeUser.avatarUrl} size="sm" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{activeUser.fullName}</p>
                    {activeUser.batch && <p className="text-xs text-tetr-gray">Batch {activeUser.batch}</p>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                        msg.senderId === user.id
                          ? "bg-tetr-green text-white rounded-br-md"
                          : "bg-tetr-gray-light text-gray-800 rounded-bl-md"
                      }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-0.5 ${msg.senderId === user.id ? "text-white/70" : "text-tetr-gray"}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="p-4 border-t border-tetr-border flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="input-field"
                  />
                  <button onClick={handleSend} disabled={sending || !text.trim()} className="btn-primary px-3 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-tetr-gray text-sm">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
