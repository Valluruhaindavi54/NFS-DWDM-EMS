"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceData {
  nodeId: number;
  timestamp: string;
  latency: number;
  errorRate: number;
}

interface Props {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: Props) {
  if (!data.length) return <div style={{ width: "100%", height: 200, marginBottom: 20 }} />;

  const axisStyle = { stroke: "#6b7280", fontSize: 10 }; // dark gray for light background
  const gridStyle = { stroke: "#e5e7eb", strokeDasharray: "3 3" }; // light gray grid
  const tooltipStyle = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 11 };
  const tooltipLabelStyle = { color: "#111111", fontSize: 11 };

  return (
    <div style={{ width: "100%", height: 200, marginBottom: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke={gridStyle.stroke} strokeDasharray={gridStyle.strokeDasharray} />
          <XAxis dataKey="timestamp" stroke={axisStyle.stroke} style={{ fontSize: axisStyle.fontSize }} />
          <YAxis yAxisId="left" stroke={axisStyle.stroke} style={{ fontSize: axisStyle.fontSize }} />
          <YAxis yAxisId="right" orientation="right" stroke={axisStyle.stroke} style={{ fontSize: axisStyle.fontSize }} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipLabelStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#374151" }} />
          <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#22c55e" dot={false} strokeWidth={2} name="Latency (ms)" />
          <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#ef4444" dot={false} strokeWidth={2} name="Error Rate (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
