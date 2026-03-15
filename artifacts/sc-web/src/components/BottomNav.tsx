import React from "react";
import { useLocation } from "wouter";
import { BarChart2, Home, Users, User } from "lucide-react";

const TABS = [
  { path: "/",           label: "Home",      Icon: Home },
  { path: "/progress",   label: "Progress",  Icon: BarChart2 },
  { path: "/community",  label: "Community", Icon: Users },
  { path: "/profile",    label: "Profile",   Icon: User },
];

export function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0,
      backgroundColor: "#fff",
      borderTop: "1px solid #F0EDE8",
      display: "flex",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {TABS.map(({ path, label, Icon }) => {
        const active = location === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "12px 0", background: "none", border: "none",
              cursor: "pointer", gap: 4, position: "relative",
            }}
          >
            <Icon size={22} color={active ? "#2D7A4F" : "#B0B8C8"} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? "#2D7A4F" : "#B0B8C8" }}>
              {label}
            </span>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#2D7A4F", position: "absolute", bottom: 4 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
