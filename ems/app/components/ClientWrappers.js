"use client";
import React from "react";

export function GlassCard({ children, style, fullWidth }) {
  return (
    <div
      className="glass-card"
      style={{
        background: "rgba(30, 41, 59, 0.4)",
        borderRadius: "12px",
        padding: "12px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "220px",
        maxHeight: "220px",
        ...style,
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      {children}
      <style jsx>{`
        .glass-card:hover {
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.12) 0%,
            rgba(30, 41, 59, 0.8) 100%
          ) !important;
          border-color: rgba(125, 211, 252, 0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export function StatCard({ label, count, color }) {
  return (
    <GlassCard
      style={{
        flex: 1,
        borderLeft: `4px solid ${color}`,
        padding: "6px 10px",
        minHeight: "60px",
        maxHeight: "60px",
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: "700", color }}>
        {count || 0}
      </div>
      <div
        style={{
          fontSize: "8px",
          color: "#94a3b8",
          fontWeight: "700",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </GlassCard>
  );
}

export function AlarmChip({ label, count, color }) {
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
      <div style={{ fontSize: "10px", fontWeight: "bold", color }}>
        {count || 0}
      </div>
      <div
        style={{
          fontSize: "7px",
          color: "#94a3b8",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </GlassCard>
  );
}

export function UserMetric({ label, value, color }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.35)",
        borderRadius: "8px",
        padding: "8px",
        textAlign: "center",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: "700", color }}>{value}</div>
      <div
        style={{
          fontSize: "#64748b",
          textTransform: "uppercase",
          fontSize: "8px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
