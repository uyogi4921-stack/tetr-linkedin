"use client";

import { useState, useRef, useCallback } from "react";
import {
  Image,
  FileText,
  Send,
  X,
  Upload,
  Camera,
  Smile,
  Hash,
  Globe,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import Avatar from "./Avatar";

const POST_TYPES = [
  { label: "General", icon: Globe, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Opportunity", icon: FileText, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Help me", icon: Smile, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Reflection", icon: Hash, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Event announcement", icon: Camera, color: "bg-green-50 text-green-700 border-green-200" },
  { label: "Resource", icon: FileText, color: "bg-teal-50 text-teal-700 border-teal-200" },
];

interface CreatePostProps {
  batchId?: string;
  clubId?: string;
  onPostCreated: () => void;
}

export default function CreatePost({ batchId, clubId, onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const openModal = () => {
    setModalOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setModalOpen(false);
    setBody("");
    setTitle("");
    setType("General");
    setModError(null);
    setShowTypeSelector(false);
    setShowUpload(false);
    setPreviewImage(null);
    setDragOver(false);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setShowUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setModError(null);

    const modCheck = await fetch("/api/moderation/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${title} ${body}` }),
    });
    const modData = await modCheck.json();
    if (!modData.approved) {
      setModError(modData.violations?.join(" ") || "Content may violate community rules.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        body: body.trim(),
        type,
        batchId,
        clubId,
        imageUrl: previewImage || undefined,
      }),
    });

    if (res.ok) {
      closeModal();
      onPostCreated();
    }
    setSubmitting(false);
  };

  const selectedType = POST_TYPES.find((t) => t.label === type) || POST_TYPES[0];
  const charCount = body.length;

  return (
    <>
      {/* Trigger card */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} avatarUrl={user.avatarUrl} />
          <button
            onClick={openModal}
            className="flex-1 text-left px-4 py-2.5 bg-tetr-gray-light rounded-full text-sm text-tetr-gray hover:bg-gray-200 transition-colors"
          >
            Share something with your community...
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-tetr-border">
          <button onClick={openModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-tetr-gray hover:bg-tetr-gray-light transition-colors">
            <Image className="w-5 h-5 text-blue-500" />
            <span className="hidden sm:inline">Photo</span>
          </button>
          <button onClick={openModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-tetr-gray hover:bg-tetr-gray-light transition-colors">
            <FileText className="w-5 h-5 text-amber-500" />
            <span className="hidden sm:inline">Article</span>
          </button>
          <button onClick={openModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-tetr-gray hover:bg-tetr-gray-light transition-colors">
            <Camera className="w-5 h-5 text-red-500" />
            <span className="hidden sm:inline">Event</span>
          </button>
        </div>
      </div>

      {/* Modal overlay */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-tetr-border">
              <div className="flex items-center gap-3">
                <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{user.fullName}</h3>
                  <button
                    onClick={() => setShowTypeSelector(!showTypeSelector)}
                    className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${selectedType.color}`}
                  >
                    <selectedType.icon className="w-3 h-3" />
                    {selectedType.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-tetr-gray-light transition-colors text-tetr-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector dropdown */}
            {showTypeSelector && (
              <div className="px-6 py-3 border-b border-tetr-border bg-gray-50 animate-fade-in">
                <p className="text-xs font-medium text-tetr-gray mb-2 uppercase tracking-wide">Post type</p>
                <div className="grid grid-cols-2 gap-2">
                  {POST_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.label}
                        onClick={() => {
                          setType(t.label);
                          setShowTypeSelector(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          type === t.label
                            ? "ring-2 ring-tetr-green ring-offset-1 " + t.color
                            : "bg-white border-tetr-border text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal body */}
            <div className="px-6 py-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a headline (optional)"
                className="w-full text-lg font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent mb-2"
              />
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What would you like to share with the TETR community?"
                rows={6}
                className="w-full text-sm text-gray-700 placeholder-gray-400 border-none outline-none bg-transparent resize-none leading-relaxed"
              />

              {/* Character count */}
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${charCount > 2000 ? "text-red-500" : "text-tetr-gray"}`}>
                  {charCount > 0 ? `${charCount} / 3000` : ""}
                </span>
              </div>

              {/* Image preview */}
              {previewImage && (
                <div className="mt-3 relative group rounded-xl overflow-hidden border border-tetr-border">
                  <img
                    src={previewImage}
                    alt="Upload preview"
                    className="w-full max-h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-red-500 hover:bg-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload zone popup */}
              {showUpload && !previewImage && (
                <div className="mt-3 animate-fade-in">
                  <div
                    className={`upload-zone ${dragOver ? "dragover" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-tetr-green mx-auto mb-3 opacity-60" />
                    <p className="text-sm font-medium text-gray-700">
                      Drag & drop an image, or{" "}
                      <span className="text-tetr-green font-semibold">browse</span>
                    </p>
                    <p className="text-xs text-tetr-gray mt-1">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                  />
                </div>
              )}

              {/* Moderation error */}
              {modError && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 animate-fade-in">
                  <p className="font-medium">Content flagged</p>
                  <p className="mt-0.5">{modError} Please revise your post.</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-tetr-border flex items-center justify-between bg-gray-50 rounded-b-xl">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowUpload(!showUpload);
                    setShowTypeSelector(false);
                  }}
                  className={`p-2.5 rounded-full transition-colors ${
                    showUpload || previewImage
                      ? "bg-tetr-green-bg text-tetr-green"
                      : "hover:bg-tetr-gray-light text-tetr-gray"
                  }`}
                  title="Add photo"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  className="p-2.5 rounded-full hover:bg-tetr-gray-light text-tetr-gray transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  className="p-2.5 rounded-full hover:bg-tetr-gray-light text-tetr-gray transition-colors"
                  title="Add hashtag"
                >
                  <Hash className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!body.trim() || submitting || charCount > 3000}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
