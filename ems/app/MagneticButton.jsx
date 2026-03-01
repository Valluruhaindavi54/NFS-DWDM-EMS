"use client";
import React, { useRef } from "react";

const MagneticButton = ({ children, className = "", ...props }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    ref.current.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`transition-transform duration-150 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default MagneticButton;
