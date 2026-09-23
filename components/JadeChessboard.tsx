'use client';

import React from 'react';

/**
 * JadeChessboard: Authentic Imperial Jade (Phỉ Thúy) Xiangqi Board with Walnut Wood Frame.
 * Faithfully crafted to match the user's provided board design (IMG_6633):
 * - Polished walnut wood outer frame with beveled mitered corners
 * - Deep emerald imperial jade stone texture with organic mineral veins
 * - Dark starry cosmic river (Sở Hà - Hán Giới / 楚河 漢界) with brushed gold calligraphy
 * - Refined pale-gold grid lines with palace diagonals
 * - Authentic cross-hatch intersection markers (dấu chữ thập) for all Cannons and Soldiers
 * - Classical Xianxia ornate corner flourishes and celestial diamond star watermark
 */

interface JadeChessboardProps {
  className?: string;
}

const JadeChessboard = React.memo(function JadeChessboard({ className = '' }: JadeChessboardProps) {
  // 9 Columns (c = 0..8): center at (c + 0.5) * (800 / 9)
  const colWidth = 800 / 9; // 88.8888...
  const colX = (c: number) => (c + 0.5) * colWidth;

  // 10 Rows (r = 0..9): center at (r + 0.5) * 90
  const rowHeight = 90;
  const rowY = (r: number) => (r + 0.5) * rowHeight;

  // Cannon intersection coordinates
  const cannonPositions = [
    { r: 2, c: 1 },
    { r: 2, c: 7 },
    { r: 7, c: 1 },
    { r: 7, c: 7 },
  ];

  // Soldier/Pawn intersection coordinates
  const soldierPositions = [
    { r: 3, c: 0, edge: 'left' as const },
    { r: 3, c: 2, edge: 'none' as const },
    { r: 3, c: 4, edge: 'none' as const },
    { r: 3, c: 6, edge: 'none' as const },
    { r: 3, c: 8, edge: 'right' as const },
    { r: 6, c: 0, edge: 'left' as const },
    { r: 6, c: 2, edge: 'none' as const },
    { r: 6, c: 4, edge: 'none' as const },
    { r: 6, c: 6, edge: 'none' as const },
    { r: 6, c: 8, edge: 'right' as const },
  ];

  // Helper to render authentic cross-hatch angle brackets
  const renderCrossHatch = (
    cx: number,
    cy: number,
    edge: 'none' | 'left' | 'right' = 'none',
    key: string
  ) => {
    const gap = 4;
    const len = 9;
    const brackets: React.ReactNode[] = [];

    // Top-Left bracket (if not left edge)
    if (edge !== 'left') {
      brackets.push(
        <path
          key="tl"
          d={`M ${cx - gap - len} ${cy - gap} L ${cx - gap} ${cy - gap} L ${cx - gap} ${cy - gap - len}`}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
      );
    }
    // Bottom-Left bracket (if not left edge)
    if (edge !== 'left') {
      brackets.push(
        <path
          key="bl"
          d={`M ${cx - gap - len} ${cy + gap} L ${cx - gap} ${cy + gap} L ${cx - gap} ${cy + gap + len}`}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
      );
    }
    // Top-Right bracket (if not right edge)
    if (edge !== 'right') {
      brackets.push(
        <path
          key="tr"
          d={`M ${cx + gap + len} ${cy - gap} L ${cx + gap} ${cy - gap} L ${cx + gap} ${cy - gap - len}`}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
      );
    }
    // Bottom-Right bracket (if not right edge)
    if (edge !== 'right') {
      brackets.push(
        <path
          key="br"
          d={`M ${cx + gap + len} ${cy + gap} L ${cx + gap} ${cy + gap} L ${cx + gap} ${cy + gap + len}`}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
      );
    }

    return <g key={key}>{brackets}</g>;
  };

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      viewBox="0 0 800 900"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Wood Frame Gradients */}
        <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f4a2d" />
          <stop offset="25%" stopColor="#55361e" />
          <stop offset="70%" stopColor="#442a16" />
          <stop offset="100%" stopColor="#2e1a0b" />
        </linearGradient>
        <linearGradient id="woodBottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6f4a2d" />
          <stop offset="25%" stopColor="#55361e" />
          <stop offset="70%" stopColor="#442a16" />
          <stop offset="100%" stopColor="#2e1a0b" />
        </linearGradient>
        <linearGradient id="woodLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6f4a2d" />
          <stop offset="25%" stopColor="#55361e" />
          <stop offset="70%" stopColor="#442a16" />
          <stop offset="100%" stopColor="#2e1a0b" />
        </linearGradient>
        <linearGradient id="woodRight" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#6f4a2d" />
          <stop offset="25%" stopColor="#55361e" />
          <stop offset="70%" stopColor="#442a16" />
          <stop offset="100%" stopColor="#2e1a0b" />
        </linearGradient>

        {/* Jade Stone Surface Radial Gradient */}
        <radialGradient id="jadeBase" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#144d3b" />
          <stop offset="35%" stopColor="#0d3b2c" />
          <stop offset="65%" stopColor="#082b20" />
          <stop offset="90%" stopColor="#051f16" />
          <stop offset="100%" stopColor="#03160f" />
        </radialGradient>

        {/* Jade Stone Marble Mineral Texture Filter */}
        <filter id="jadeVeinsFilter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.015"
            numOctaves="4"
            seed="23"
            result="turbulence"
          />
          <feColorMatrix
            type="matrix"
            values="
              0.10 0.00 0.00 0 0.04
              0.00 0.48 0.00 0 0.22
              0.00 0.00 0.35 0 0.16
              0.00 0.00 0.00 0.45 0"
            in="turbulence"
            result="coloredVeins"
          />
          <feBlend mode="overlay" in="SourceGraphic" in2="coloredVeins" />
        </filter>

        {/* Starry Nebula River Gradient */}
        <linearGradient id="riverCosmicBg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#02140e" />
          <stop offset="20%" stopColor="#042017" />
          <stop offset="50%" stopColor="#021711" />
          <stop offset="80%" stopColor="#042017" />
          <stop offset="100%" stopColor="#02140e" />
        </linearGradient>

        {/* Gold Inscription Gradient */}
        <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="25%" stopColor="#f5da89" />
          <stop offset="60%" stopColor="#d8ab43" />
          <stop offset="100%" stopColor="#a3761c" />
        </linearGradient>

        {/* Crisp Golden Lines Stroke Gradient */}
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3de9a" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="85%" stopColor="#c59e2f" />
          <stop offset="100%" stopColor="#9a761c" />
        </linearGradient>

        {/* Subtle glow for calligraphy */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. OUTSIDE WOOD FRAME (Beveled, mitered natural walnut timber) */}
      <g id="wood-frame">
        {/* Top wood plank */}
        <polygon points="0,0 800,0 772,28 28,28" fill="url(#woodTop)" />
        {/* Bottom wood plank */}
        <polygon points="0,900 800,900 772,872 28,872" fill="url(#woodBottom)" />
        {/* Left wood plank */}
        <polygon points="0,0 28,28 28,872 0,900" fill="url(#woodLeft)" />
        {/* Right wood plank */}
        <polygon points="800,0 772,28 772,872 800,900" fill="url(#woodRight)" />

        {/* Outer wood edge highlight & bevel line */}
        <rect
          x="1.5"
          y="1.5"
          width="797"
          height="897"
          fill="none"
          stroke="#855734"
          strokeWidth="1.5"
          opacity="0.8"
        />
        {/* Outer frame perimeter shadow */}
        <rect
          x="0"
          y="0"
          width="800"
          height="900"
          fill="none"
          stroke="#1c0f06"
          strokeWidth="1"
        />

        {/* 45-degree corner miter seam lines */}
        <line x1="0" y1="0" x2="28" y2="28" stroke="#221107" strokeWidth="1.5" />
        <line x1="800" y1="0" x2="772" y2="28" stroke="#221107" strokeWidth="1.5" />
        <line x1="0" y1="900" x2="28" y2="872" stroke="#221107" strokeWidth="1.5" />
        <line x1="800" y1="900" x2="772" y2="872" stroke="#221107" strokeWidth="1.5" />

        {/* Inner frame bevel shadow right around the jade stone */}
        <rect
          x="28"
          y="28"
          width="744"
          height="844"
          fill="none"
          stroke="#180b04"
          strokeWidth="3"
        />
        <rect
          x="29"
          y="29"
          width="742"
          height="842"
          fill="none"
          stroke="#5c381e"
          strokeWidth="1"
          opacity="0.4"
        />
      </g>

      {/* 2. JADE STONE SURFACE (Imperial Jade / Phỉ Thúy Marble) */}
      <g id="jade-surface">
        {/* Base stone fill with radial luminescence */}
        <rect
          x="30"
          y="30"
          width="740"
          height="840"
          fill="url(#jadeBase)"
        />

        {/* Layer of procedural marble clouding & veins */}
        <rect
          x="30"
          y="30"
          width="740"
          height="840"
          fill="url(#jadeBase)"
          filter="url(#jadeVeinsFilter)"
          opacity="0.9"
        />

        {/* Ambient organic depth swirls (darker translucent patches) */}
        <circle cx="260" cy="220" r="180" fill="#041810" opacity="0.35" />
        <circle cx="560" cy="300" r="210" fill="#062318" opacity="0.3" />
        <circle cx="380" cy="680" r="220" fill="#03150e" opacity="0.4" />
        <circle cx="650" cy="740" r="170" fill="#07271b" opacity="0.3" />
        <circle cx="180" cy="720" r="190" fill="#051f15" opacity="0.35" />
        {/* Center luminous jade glow */}
        <ellipse cx="400" cy="450" rx="320" ry="240" fill="#155541" opacity="0.16" />

        {/* Inner shadow along the edge of the stone */}
        <rect
          x="30"
          y="30"
          width="740"
          height="840"
          fill="none"
          stroke="#020d09"
          strokeWidth="4"
          opacity="0.8"
        />
      </g>

      {/* 3. OUTER GOLD BORDER WITH CORNER FLOURISHES */}
      <g id="outer-gold-border">
        {/* Outer border rectangle */}
        <rect
          x={colX(0)}
          y={rowY(0)}
          width={colX(8) - colX(0)}
          height={rowY(9) - rowY(0)}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="2.4"
        />

        {/* Fine inner inset border */}
        <rect
          x={colX(0) + 5}
          y={rowY(0) + 5}
          width={colX(8) - colX(0) - 10}
          height={rowY(9) - rowY(0) - 10}
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="1"
          opacity="0.75"
        />

        {/* Corner Flourish: Top-Left */}
        <g transform={`translate(${colX(0) - 2}, ${rowY(0) - 2})`}>
          <path
            d="M 0 35 C 5 20 20 5 35 0 M 6 30 C 10 18 18 10 30 6 M 0 20 C 8 16 16 8 20 0 M 12 12 A 4 4 0 1 0 16 8"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </g>

        {/* Corner Flourish: Top-Right */}
        <g transform={`translate(${colX(8) + 2}, ${rowY(0) - 2}) scale(-1, 1)`}>
          <path
            d="M 0 35 C 5 20 20 5 35 0 M 6 30 C 10 18 18 10 30 6 M 0 20 C 8 16 16 8 20 0 M 12 12 A 4 4 0 1 0 16 8"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </g>

        {/* Corner Flourish: Bottom-Left */}
        <g transform={`translate(${colX(0) - 2}, ${rowY(9) + 2}) scale(1, -1)`}>
          <path
            d="M 0 35 C 5 20 20 5 35 0 M 6 30 C 10 18 18 10 30 6 M 0 20 C 8 16 16 8 20 0 M 12 12 A 4 4 0 1 0 16 8"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </g>

        {/* Corner Flourish: Bottom-Right */}
        <g transform={`translate(${colX(8) + 2}, ${rowY(9) + 2}) scale(-1, -1)`}>
          <path
            d="M 0 35 C 5 20 20 5 35 0 M 6 30 C 10 18 18 10 30 6 M 0 20 C 8 16 16 8 20 0 M 12 12 A 4 4 0 1 0 16 8"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </g>
      </g>

      {/* 4. THE STARRY RIVER (楚河 漢界 - SỞ HÀ HÁN GIỚI) */}
      <g id="starry-river">
        {/* Cosmic River Background Band */}
        <rect
          x={colX(0)}
          y={rowY(4)}
          width={colX(8) - colX(0)}
          height={rowY(5) - rowY(4)}
          fill="url(#riverCosmicBg)"
        />

        {/* Upper & Lower River Golden Shorelines */}
        <line
          x1={colX(0)}
          y1={rowY(4)}
          x2={colX(8)}
          y2={rowY(4)}
          stroke="url(#goldStroke)"
          strokeWidth="2.2"
        />
        <line
          x1={colX(0)}
          y1={rowY(5)}
          x2={colX(8)}
          y2={rowY(5)}
          stroke="url(#goldStroke)"
          strokeWidth="2.2"
        />

        {/* Starry Nebula Particles inside the River */}
        {/* Star Cluster Left */}
        <circle cx="70" cy="425" r="1" fill="#fff" opacity="0.8" />
        <circle cx="105" cy="465" r="1.4" fill="#fed7aa" opacity="0.9" />
        <circle cx="130" cy="430" r="0.8" fill="#a7f3d0" opacity="0.7" />
        <circle cx="160" cy="475" r="1.2" fill="#fff" opacity="0.85" />
        <circle cx="280" cy="425" r="1" fill="#fde047" opacity="0.7" />
        <circle cx="310" cy="460" r="1.3" fill="#fff" opacity="0.9" />
        <circle cx="340" cy="435" r="0.9" fill="#99f6e4" opacity="0.75" />
        {/* Star Cluster Center */}
        <circle cx="380" cy="470" r="1.1" fill="#fff" opacity="0.8" />
        <circle cx="400" cy="428" r="1.5" fill="#fef08a" opacity="0.95" />
        <circle cx="425" cy="465" r="0.9" fill="#a7f3d0" opacity="0.7" />
        {/* Star Cluster Right */}
        <circle cx="470" cy="435" r="1.2" fill="#fff" opacity="0.85" />
        <circle cx="505" cy="470" r="0.8" fill="#fed7aa" opacity="0.7" />
        <circle cx="640" cy="430" r="1.4" fill="#fff" opacity="0.9" />
        <circle cx="670" cy="465" r="0.9" fill="#fde047" opacity="0.75" />
        <circle cx="710" cy="435" r="1.1" fill="#a7f3d0" opacity="0.8" />
        <circle cx="735" cy="470" r="1.3" fill="#fff" opacity="0.85" />

        {/* River Calligraphy: 楚 河 (Sở Hà) on the left */}
        <text
          x={colX(1) + colWidth * 0.5}
          y={rowY(4) + (rowY(5) - rowY(4)) * 0.65}
          textAnchor="middle"
          fill="url(#goldText)"
          fontSize="42"
          fontFamily="'Cinzel Decorative', 'Noto Serif', serif"
          fontWeight="bold"
          letterSpacing="28"
          filter="url(#goldGlow)"
          opacity="0.95"
        >
          楚 河
        </text>

        {/* River Calligraphy: 漢 界 (Hán Giới) on the right */}
        <text
          x={colX(6) + colWidth * 0.5}
          y={rowY(4) + (rowY(5) - rowY(4)) * 0.65}
          textAnchor="middle"
          fill="url(#goldText)"
          fontSize="42"
          fontFamily="'Cinzel Decorative', 'Noto Serif', serif"
          fontWeight="bold"
          letterSpacing="28"
          filter="url(#goldGlow)"
          opacity="0.95"
        >
          漢 界
        </text>
      </g>

      {/* 5. XIANGQI GRID LINES */}
      <g id="grid-lines">
        {/* Horizontal Lines (r = 0..9) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
          <line
            key={`h-line-${r}`}
            x1={colX(0)}
            y1={rowY(r)}
            x2={colX(8)}
            y2={rowY(r)}
            stroke="url(#goldStroke)"
            strokeWidth={r === 0 || r === 9 || r === 4 || r === 5 ? '2.2' : '1.7'}
          />
        ))}

        {/* Outer Vertical Lines (c = 0 and c = 8): Continuous across whole board */}
        <line
          x1={colX(0)}
          y1={rowY(0)}
          x2={colX(0)}
          y2={rowY(9)}
          stroke="url(#goldStroke)"
          strokeWidth="2.2"
        />
        <line
          x1={colX(8)}
          y1={rowY(0)}
          x2={colX(8)}
          y2={rowY(9)}
          stroke="url(#goldStroke)"
          strokeWidth="2.2"
        />

        {/* Inner Vertical Lines (c = 1..7): Interrupted at the river */}
        {[1, 2, 3, 4, 5, 6, 7].map((c) => (
          <g key={`v-line-${c}`}>
            {/* Top Half (Rank 0 to 4) */}
            <line
              x1={colX(c)}
              y1={rowY(0)}
              x2={colX(c)}
              y2={rowY(4)}
              stroke="url(#goldStroke)"
              strokeWidth="1.6"
            />
            {/* Bottom Half (Rank 5 to 9) */}
            <line
              x1={colX(c)}
              y1={rowY(5)}
              x2={colX(c)}
              y2={rowY(9)}
              stroke="url(#goldStroke)"
              strokeWidth="1.6"
            />
          </g>
        ))}

        {/* Palace Diagonal Crosses (Cửu Cung) */}
        {/* Top Palace (Rank 0..2, File 3..5) */}
        <line
          x1={colX(3)}
          y1={rowY(0)}
          x2={colX(5)}
          y2={rowY(2)}
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
        <line
          x1={colX(5)}
          y1={rowY(0)}
          x2={colX(3)}
          y2={rowY(2)}
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />

        {/* Bottom Palace (Rank 7..9, File 3..5) */}
        <line
          x1={colX(3)}
          y1={rowY(7)}
          x2={colX(5)}
          y2={rowY(9)}
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
        <line
          x1={colX(5)}
          y1={rowY(7)}
          x2={colX(3)}
          y2={rowY(9)}
          stroke="url(#goldStroke)"
          strokeWidth="1.6"
        />
      </g>

      {/* 6. CROSS-HATCH INTERSECTION MARKERS (Dấu chữ thập Pháo và Tốt) */}
      <g id="cross-hatches">
        {/* Cannon positions (4 corners) */}
        {cannonPositions.map((pos, idx) =>
          renderCrossHatch(colX(pos.c), rowY(pos.r), 'none', `cannon-${idx}`)
        )}

        {/* Soldier positions */}
        {soldierPositions.map((pos, idx) =>
          renderCrossHatch(colX(pos.c), rowY(pos.r), pos.edge, `soldier-${idx}`)
        )}
      </g>

      {/* 7. CELESTIAL DIAMOND STAR WATERMARK (Bottom-Right corner from IMG_6633) */}
      <g
        id="celestial-star"
        transform={`translate(${colX(7) + colWidth * 0.5}, ${rowY(8) + rowHeight * 0.4})`}
        opacity="0.45"
      >
        {/* 4-pointed diamond star */}
        <path
          d="M 0 -22 Q 1 -6 18 0 Q 1 6 0 22 Q -1 6 -18 0 Q -1 -6 0 -22 Z"
          fill="url(#goldStroke)"
        />
        {/* Inner subtle core */}
        <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.6" />
      </g>
    </svg>
  );
});

export default JadeChessboard;
