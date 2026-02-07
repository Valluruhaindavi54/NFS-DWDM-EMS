"use client";

import React, { useRef, useState } from "react";

const ThreeDModal = ({
  show,
  title,
  width = "w-96",
  children,
  onClose,
  variant = "default", // default | danger
  draggable = true,
  zIndex = "z-[60]",
}) => {
  const modalRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  if (!show) return null;

  /* ---------- 3D Tilt ---------- */
  const handleMouseMove = (e) => {
    const rect = modalRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  /* ---------- Drag ---------- */
  const onDragStart = (e) => {
    if (!draggable) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX - drag.x,
      y: e.clientY - drag.y,
    };
  };

  const onDragMove = (e) => {
    if (!dragging) return;
    setDrag({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onDragEnd = () => setDragging(false);

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center`}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onClick={(e) => {
        // Close only this modal when clicking on backdrop
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `
            translate(${drag.x}px, ${drag.y}px)
            perspective(1200px)
            rotateX(${tilt.y}deg)
            rotateY(${tilt.x}deg)
            scale(1)
          `,
        }}
        className={`
          ${width}
          transition-transform duration-200
          rounded-2xl
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-xl
          shadow-2xl
          border
          relative z-10
          ${
            variant === "danger"
              ? "border-red-400 shadow-red-500/40 animate-[pulse_0.6s]"
              : "border-white/40"
          }
        `}
      >
        {/* Header */}
        <div
          onMouseDown={onDragStart}
          className={`
            flex justify-between items-center px-4 py-3
            rounded-t-2xl cursor-${draggable ? "move" : "default"}
            ${
              variant === "danger"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white"
            }
          `}
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:scale-110 transition"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default ThreeDModal;
