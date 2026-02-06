"use client";
import React from 'react';

const Arrow = ({ isOpen }) => {
  return (
    <svg
      className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
};

export default Arrow;
