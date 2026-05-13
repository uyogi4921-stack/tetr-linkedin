"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
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
    <Suspense fallback={
      <div className="min-h-screen bg-tetr-gray-light flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
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
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeUser, setActiveUser] = useState<{ id: string; fullName: string; avatarUrl: string | null; batch: string | null } | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchThreads = useCallback(() => {
    if (!user) return;
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => {
        setThreads(d.threads || []);
        setLoadingThreads(false);
      })
      .catch(() => setLoadingThreads(false));
  }, [user]);

  const fetchMessages = useCallback(() => {
    if (!chatWith || !user) return;
    fetch(`/api/messages?with=${chatWith}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        setLoadingMessages(false);
      });
  }, [chatWith, user]);

  // Load threads on mount
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    setLoadingThreads(true);
    fetchThreads();
  }, [user, loading, router, fetchThreads]);

  // Load chat messages when chatWith changes
  useEffect(() => {
    if (!chatWith || !user) return;
    setLoadingMessages(true);
    fetchMessages();

    // Find active user from threads or fetch profile
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
  }, [chatWith, user, threads, fetchMessages]);

  // Poll for new messages every 5 seconds when in a chat
  useEffect(() => {
    if (!chatWith || !user) return;
    pollRef.current = setInterval(() => {
      fetchMessages();
      fetchThreads();
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatWith, user, fetchMessages, fetchThreads]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending || !chatWith) return;
    setSending(true);
    const msgText = text.trim();
    setText("");

    // Optimistic: add message immediately
    const optimisticMsg: MessageData = {
      id: `temp-${Date.now()}`,
      text: msgText,
      createdAt: new Date().toISOString(),
      senderId: user!.id,
      receiverId: chatWith,
      isRead: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText, receiverId: chatWith }),
      });
      if (res.ok) {
        // Refresh messages to get real ID and refresh thread list
        fetchMessages();
        fetchThreads();
      }
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setText(msgText);
    }
    setSending(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-tetr-gray-light flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
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
              {loadingThreads ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                </div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-tetr-gray">No conversations yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Visit someone&apos;s profile to send a message.</p>
                </div>
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
                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-tetr-gray">No messages yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Say hi to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
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
                    ))
                  )}
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
                    autoFocus
                  />
                  <button onClick={handleSend} disabled={sending || !text.trim()} className="btn-primary px-3 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-tetr-gray text-sm">Select a conversation to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
