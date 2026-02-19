"use client";
import React from "react";

export function GlassCard({ children, style, fullWidth }: { children: React.ReactNode, style?: React.CSSProperties, fullWidth?: boolean }) {
  return (
    <div
      className="glass-card"
      style={{
        background: "#ffffff", // white background
        borderRadius: "12px",
        padding: "12px",
        border: "1px solid rgba(200, 200, 200, 0.3)", // subtle gray border
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "220px",
        maxHeight: "220px",
        color: "#111111", // dark text inside
        ...style,
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      {children}
      <style jsx>{`
        .glass-card:hover {
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.05) 0%,
            rgba(255, 255, 255, 1) 100%
          ) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}

export function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <GlassCard
      style={{
        flex: 1,
        borderLeft: `4px solid ${color}`,
        padding: "6px 10px",
        minHeight: "60px",
        maxHeight: "60px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 700, color }}>{count || 0}</div>
      <div
        style={{
          fontSize: "8px",
          color: "#64748b", // subtle gray
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </GlassCard>
  );
}

export function AlarmChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <GlassCard
      style={{
        flex: 1,
        borderLeft: `3px solid ${color}`,
        padding: "4px 6px",
        minHeight: "40px",
        maxHeight: "40px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "10px", fontWeight: "bold", color }}>{count || 0}</div>
      <div
        style={{
          fontSize: "7px",
          color: "#64748b", // subtle gray for label
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </GlassCard>
  );
}

export function UserMetric({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div
      style={{
        background: "#f9fafb", // very light gray for metric card
        borderRadius: "8px",
        padding: "8px",
        textAlign: "center",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          fontSize: "8px",
          color: "#64748b",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
