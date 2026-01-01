// components/GlassCard.tsx
export default function GlassCard({
  children,
  fullWidth = false,
  height,       // optional
  minHeight,    // optional
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  height?: string | number;
  minHeight?: string | number;
}) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.45)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "12px",
        height: height || "auto",       
        minHeight: minHeight || 0,      
        display: "flex",
        flexDirection: "column",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      {children}
    </div>
  );
}
