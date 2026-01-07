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
  return (
    <div style={{ width: "100%", height: 260,marginBottom:20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="timestamp" hide />
          <YAxis yAxisId="left" fontSize={10} />
          <YAxis yAxisId="right" orientation="right" fontSize={10} />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 11,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#22c55e" dot={false} strokeWidth={2} name="Latency (ms)" />
          <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#ef4444" dot={false} strokeWidth={2} name="Error Rate (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
