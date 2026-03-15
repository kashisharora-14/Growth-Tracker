import React, { useState } from "react";
import { Heart, MessageCircle, PlusCircle, X } from "lucide-react";

const SAMPLE_POSTS = [
  { id: "1", author: "AnonymousEagle", avatar: "E", group: "Alcohol Recovery", content: "Day 30! Never thought I'd make it here. The cravings were brutal last night but I called my sponsor and made it through. One day at a time.", likes: 47, replies: 12, timestamp: "2h ago", isLiked: false, daysSober: 30 },
  { id: "2", author: "QuietPhoenix",   avatar: "P", group: "Night Craving Support", content: "3AM and the urge is strong. Using the breathing exercise right now. It actually works. Thank you all for being here.", likes: 23, replies: 8, timestamp: "4h ago", isLiked: false },
  { id: "3", author: "RisingMorning",  avatar: "R", group: "30-Day Challenge", content: "Week 2 complete. Seeing those leaves fill in on my streak tracker keeps me going every single day.", likes: 61, replies: 19, timestamp: "6h ago", isLiked: false, daysSober: 14 },
  { id: "4", author: "SilentMountain", avatar: "S", group: "Nicotine Quitters", content: "100 days smoke-free today! Saved over $400. Lungs feel better. If you're on day 1, I promise it gets easier.", likes: 134, replies: 43, timestamp: "8h ago", isLiked: false, daysSober: 100 },
  { id: "5", author: "WaveSurfer",     avatar: "W", group: "Drug Recovery", content: "Had a rough day at work. Old me would have used. New me went for a walk, called my sister, and journaled. The coping tools saved me today.", likes: 89, replies: 27, timestamp: "12h ago", isLiked: false, daysSober: 67 },
];

type Post = typeof SAMPLE_POSTS[0];

function PostCard({ post, onLike }: { post: Post; onLike: () => void }) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#2D7A4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{post.avatar}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{post.author}</div>
          <div style={{ fontSize: 11, color: "#8E9BB5" }}>{post.group} · {post.timestamp}</div>
        </div>
        {post.daysSober && (
          <div style={{ marginLeft: "auto", backgroundColor: "#2D7A4F18", padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#2D7A4F" }}>Day {post.daysSober}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 14, color: "#3A3A4E", lineHeight: 1.6, margin: 0 }}>{post.content}</p>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={onLike} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: post.isLiked ? "#E53935" : "#8E9BB5", fontSize: 13, fontWeight: 500, padding: 0 }}>
          <Heart size={16} fill={post.isLiked ? "#E53935" : "none"} color={post.isLiked ? "#E53935" : "#8E9BB5"} />
          {post.likes}
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#8E9BB5", fontSize: 13, fontWeight: 500, padding: 0 }}>
          <MessageCircle size={16} />
          {post.replies}
        </button>
      </div>
    </div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState("");

  const handleLike = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handlePost = () => {
    if (!draft.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "Y",
      group: "General Support",
      content: draft.trim(),
      likes: 0,
      replies: 0,
      timestamp: "just now",
      isLiked: false,
    };
    setPosts([newPost, ...posts]);
    setDraft("");
    setShowCompose(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2D7A4F, #4CAF78, #7DD4A8)", margin: "0 -20px", padding: "20px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Community</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>You are not alone</div>
      </div>

      {/* Compose */}
      {showCompose ? (
        <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: "#1A1A2E" }}>Share with the community</span>
            <button onClick={() => setShowCompose(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={20} color="#8E9BB5" />
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share your experience, progress, or support..."
            rows={4}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid #E8E4E0", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}
          />
          <button onClick={handlePost} disabled={!draft.trim()} style={{
            marginTop: 10, width: "100%", backgroundColor: "#2D7A4F", color: "#fff",
            border: "none", borderRadius: 14, padding: "13px 0", fontSize: 15, fontWeight: 600,
            cursor: draft.trim() ? "pointer" : "not-allowed", opacity: draft.trim() ? 1 : 0.5,
          }}>
            Post
          </button>
        </div>
      ) : (
        <button onClick={() => setShowCompose(true)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
          backgroundColor: "#fff", borderRadius: 18, border: "2px dashed #DDE8DD",
          cursor: "pointer", color: "#2D7A4F", fontWeight: 500, fontSize: 14,
        }}>
          <PlusCircle size={20} color="#2D7A4F" />
          Share something with the community...
        </button>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
      ))}
    </div>
  );
}
