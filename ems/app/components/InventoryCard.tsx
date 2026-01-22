"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";




export default function InventoryCard() {
  

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "#ffffff" }}>
        Inventory 
      </h2>

    

      {/* Alarm Table */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
      <p>Inventory</p>
      </div>
    </GlassCard>
  );
}
