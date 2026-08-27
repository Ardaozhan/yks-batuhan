"use client";

import React from "react";

/**
 * 1. Living & Breathing Empty Plan Illustration
 * Isometric Study Desk / Plan Card with floating checkmark bubbles and gentle glowing ambient mesh.
 */
export function EmptyPlanIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)] border border-[#d7e8cb] ${className}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Ambient Glow */}
          <radialGradient id="plan-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d7e8cb" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#d7e8cb" stopOpacity="0" />
          </radialGradient>
          {/* Main Card Gradient */}
          <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f8f2" />
          </linearGradient>
          {/* Sage Primary Accent */}
          <linearGradient id="sage-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#526049" />
            <stop offset="100%" stopColor="#3d4936" />
          </linearGradient>
          {/* Gold Accent */}
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f4a261" />
            <stop offset="100%" stopColor="#e76f51" />
          </linearGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#526049" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ambient Pulsing Background Circle */}
        <circle cx="100" cy="100" r="80" fill="url(#plan-glow)" className="animate-pulse" style={{ animationDuration: "4s" }} />

        {/* Outer Floating Ring */}
        <circle
          cx="100"
          cy="100"
          r="68"
          stroke="#c5c8be"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
          className="animate-spin"
          style={{ animationDuration: "36s", transformOrigin: "center" }}
        />

        {/* Isometric Shadow */}
        <ellipse cx="100" cy="155" rx="55" ry="14" fill="#1b1c1a" fillOpacity="0.06" filter="blur(4px)" />

        {/* Main Clipboard / Plan Card */}
        <g filter="url(#soft-shadow)" className="animate-float" style={{ animationDuration: "5s" }}>
          {/* Card Base */}
          <rect x="52" y="44" width="96" height="110" rx="16" fill="url(#card-grad)" stroke="#d7e8cb" strokeWidth="2" />

          {/* Top Clip */}
          <rect x="78" y="38" width="44" height="14" rx="7" fill="url(#sage-grad)" />
          <circle cx="100" cy="45" r="3" fill="#ffffff" />

          {/* Task Row 1 (Checked) */}
          <rect x="64" y="66" width="72" height="14" rx="6" fill="#ffffff" stroke="#e3eedb" strokeWidth="1.5" />
          <circle cx="73" cy="73" r="4" fill="#526049" />
          <path d="M71 73l1.5 1.5 3-3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="82" y1="73" x2="124" y2="73" stroke="#8c9086" strokeWidth="2.5" strokeLinecap="round" />

          {/* Task Row 2 (Checked) */}
          <rect x="64" y="88" width="72" height="14" rx="6" fill="#ffffff" stroke="#e3eedb" strokeWidth="1.5" />
          <circle cx="73" cy="95" r="4" fill="#526049" />
          <path d="M71 95l1.5 1.5 3-3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="82" y1="95" x2="116" y2="95" stroke="#8c9086" strokeWidth="2.5" strokeLinecap="round" />

          {/* Task Row 3 (Active / In Progress) */}
          <rect x="64" y="110" width="72" height="14" rx="6" fill="#fcfbf9" stroke="#d7e8cb" strokeWidth="1.5" />
          <circle cx="73" cy="117" r="4" stroke="#526049" strokeWidth="1.5" fill="none" />
          <line x1="82" y1="117" x2="128" y2="117" stroke="#1b1c1a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Progress Pill */}
          <rect x="64" y="132" width="72" height="6" rx="3" fill="#efeeea" />
          <rect x="64" y="132" width="48" height="6" rx="3" fill="url(#sage-grad)" />
        </g>

        {/* Floating Bubble 1: Checkmark Star */}
        <g className="animate-float-reverse" style={{ animationDuration: "4s", transformOrigin: "center" }}>
          <circle cx="152" cy="56" r="14" fill="#ffffff" stroke="#d7e8cb" strokeWidth="1.5" filter="url(#soft-shadow)" />
          <path d="M147 56l3.5 3.5 7-7" stroke="#526049" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Bubble 2: Sparkle Gold */}
        <g className="animate-float" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>
          <circle cx="46" cy="120" r="12" fill="#ffffff" stroke="#fde047" strokeWidth="1.5" filter="url(#soft-shadow)" />
          <path d="M46 114v12M40 120h12" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Tiny Ambient Sparkles */}
        <circle cx="158" cy="128" r="2.5" fill="#526049" opacity="0.6" className="animate-ping" style={{ animationDuration: "2.5s" }} />
        <circle cx="42" cy="62" r="2" fill="#f4a261" opacity="0.8" className="animate-ping" style={{ animationDuration: "3s" }} />
      </svg>
    </div>
  );
}

/**
 * 2. Living & Breathing Empty Exams Illustration
 * Isometric Exam Paper, Target Compass & Score Stars.
 */
export function EmptyExamsIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <radialGradient id="exam-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="exam-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fdfcf8" />
          </linearGradient>
          <linearGradient id="exam-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <filter id="exam-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#d97706" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="75" fill="url(#exam-glow)" className="animate-pulse" style={{ animationDuration: "3.5s" }} />

        {/* Shadow */}
        <ellipse cx="100" cy="155" rx="50" ry="12" fill="#1b1c1a" fillOpacity="0.06" filter="blur(4px)" />

        {/* Main Exam Booklet Card */}
        <g filter="url(#exam-shadow)" className="animate-float" style={{ animationDuration: "4.8s" }}>
          <rect x="55" y="46" width="90" height="106" rx="14" fill="url(#exam-card-grad)" stroke="#fed7aa" strokeWidth="2" />

          {/* Booklet Header Badge */}
          <rect x="68" y="58" width="64" height="16" rx="8" fill="#fff7ed" stroke="#fcd34d" strokeWidth="1.5" />
          <circle cx="78" cy="66" r="3.5" fill="#f59e0b" />
          <line x1="86" y1="66" x2="122" y2="66" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

          {/* Question Bubbles Matrix */}
          <g transform="translate(68, 86)">
            {/* Q1 */}
            <circle cx="6" cy="6" r="4.5" fill="#d97706" />
            <circle cx="19" cy="6" r="4.5" fill="#efeeea" />
            <circle cx="32" cy="6" r="4.5" fill="#efeeea" />
            <circle cx="45" cy="6" r="4.5" fill="#efeeea" />
            {/* Q2 */}
            <circle cx="6" cy="20" r="4.5" fill="#efeeea" />
            <circle cx="19" cy="20" r="4.5" fill="#d97706" />
            <circle cx="32" cy="20" r="4.5" fill="#efeeea" />
            <circle cx="45" cy="20" r="4.5" fill="#efeeea" />
            {/* Q3 */}
            <circle cx="6" cy="34" r="4.5" fill="#efeeea" />
            <circle cx="19" cy="34" r="4.5" fill="#efeeea" />
            <circle cx="32" cy="34" r="4.5" fill="#d97706" />
            <circle cx="45" cy="34" r="4.5" fill="#efeeea" />
          </g>

          {/* Bottom Net Score Tag */}
          <rect x="68" y="132" width="64" height="10" rx="5" fill="#fef3c7" />
          <line x1="78" y1="137" x2="118" y2="137" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Target Compass Bubble */}
        <g className="animate-float-reverse" style={{ animationDuration: "4.2s" }}>
          <circle cx="150" cy="65" r="16" fill="#ffffff" stroke="#fcd34d" strokeWidth="1.5" filter="url(#exam-shadow)" />
          <circle cx="150" cy="65" r="8" stroke="#d97706" strokeWidth="1.5" fill="none" />
          <circle cx="150" cy="65" r="3" fill="#d97706" />
        </g>

        {/* Floating Trophy Star */}
        <g className="animate-float" style={{ animationDuration: "3.8s", animationDelay: "0.8s" }}>
          <circle cx="48" cy="115" r="13" fill="#ffffff" stroke="#fed7aa" strokeWidth="1.5" filter="url(#exam-shadow)" />
          <path
            d="M48 107l2 4 4.5.5-3.2 3 1 4.5-4.3-2.5-4.3 2.5 1-4.5-3.2-3 4.5-.5z"
            fill="#f59e0b"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3. Living & Breathing Empty Mistakes Illustration
 * Smart Open Notebook, Light Rays & Analysis Magnifier.
 */
export function EmptyMistakesIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <radialGradient id="mistake-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
          </radialGradient>
          <filter id="mistake-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4338ca" floodOpacity="0.12" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r="75" fill="url(#mistake-glow)" className="animate-pulse" style={{ animationDuration: "4s" }} />
        <ellipse cx="100" cy="155" rx="55" ry="12" fill="#1b1c1a" fillOpacity="0.06" filter="blur(4px)" />

        {/* Open Notebook */}
        <g filter="url(#mistake-shadow)" className="animate-float" style={{ animationDuration: "5s" }}>
          {/* Left Page */}
          <path d="M52 60c18-6 40-4 46 2v68c-8-5-28-7-46-2V60z" fill="#ffffff" stroke="#c7d2fe" strokeWidth="2" />
          {/* Right Page */}
          <path d="M148 60c-18-6-40-4-46 2v68c8-5 28-7 46-2V60z" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="2" />

          {/* Left Page Lines */}
          <line x1="62" y1="78" x2="88" y2="76" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="90" x2="88" y2="88" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="102" x2="84" y2="100" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

          {/* Right Page Lines */}
          <line x1="112" y1="76" x2="138" y2="78" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          <line x1="112" y1="88" x2="138" y2="90" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="112" y1="100" x2="134" y2="102" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Magnifier Bubble */}
        <g className="animate-float-reverse" style={{ animationDuration: "4s" }}>
          <circle cx="146" cy="62" r="16" fill="#ffffff" stroke="#a5b4fc" strokeWidth="1.5" filter="url(#mistake-shadow)" />
          <circle cx="144" cy="60" r="6" stroke="#4f46e5" strokeWidth="2" fill="none" />
          <line x1="149" y1="65" x2="154" y2="70" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
