'use client';

import React from 'react';
import { loadCustomFrames, CustomFrame } from '../lib/cultivation/shopAndFrames';
import { getRealmByLevel } from '../lib/cultivation/realms';

interface AvatarWithFrameProps {
  avatarUrl: string;
  daoName?: string;
  realmLevel?: number;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

// Strictly calibrated dimensions to ensure exact symmetry and alignment at every viewport
const PIXEL_SIZES: Record<string, { px: number; containerClass: string; dotClass: string }> = {
  xs: { px: 28, containerClass: 'w-7 h-7', dotClass: 'w-2 h-2 bottom-0 right-0' },
  sm: { px: 36, containerClass: 'w-9 h-9', dotClass: 'w-2.5 h-2.5 bottom-0 right-0' },
  md: { px: 48, containerClass: 'w-12 h-12', dotClass: 'w-3 h-3 bottom-0.5 right-0.5' },
  lg: { px: 64, containerClass: 'w-16 h-16', dotClass: 'w-3.5 h-3.5 bottom-0.5 right-0.5' },
  xl: { px: 80, containerClass: 'w-20 h-20', dotClass: 'w-4 h-4 bottom-1 right-1' },
  '2xl': { px: 104, containerClass: 'w-[104px] h-[104px]', dotClass: 'w-5 h-5 bottom-1.5 right-1.5' },
};

const AvatarWithFrame = React.memo(function AvatarWithFrame({
  avatarUrl,
  daoName = 'Đạo Hữu',
  realmLevel = 1,
  frameId,
  size = 'md',
  showOnlineDot = false,
  isOnline = true,
  className = '',
}: AvatarWithFrameProps) {
  const config = PIXEL_SIZES[size] || PIXEL_SIZES.md;
  const realm = getRealmByLevel(realmLevel);

  // Load custom frame details if equipped
  const frames = loadCustomFrames();
  const customFrame: CustomFrame | undefined = frameId ? frames.find((f) => f.id === frameId) : undefined;

  // Proportional offset calculation: normalize based on baseline size (80px standard editor preview)
  const ratio = config.px / 80;
  const baseScale = customFrame?.scale ?? 1.15;
  // Normalize legacy scale (> 1.30) so frame fits symmetrically on the outside without over-stretching
  const frameScale = baseScale > 1.30 ? Number((baseScale * 0.85).toFixed(2)) : baseScale;
  const tx = Math.round((customFrame?.offsetX ?? 0) * ratio);
  const ty = Math.round((customFrame?.offsetY ?? 0) * ratio);
  const glowColor = customFrame?.glowColor || '#f59e0b';

  // Check if frame has transparent center or is default celestial preset
  const isPresetFrame = customFrame && [
    'frame_celestial_gold',
    'frame_purple_thunder',
    'frame_emerald_lotus',
    'frame_phoenix_fire',
    'frame_ice_crystal',
  ].includes(customFrame.id);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${config.containerClass} ${className}`}
      style={{ width: `${config.px}px`, height: `${config.px}px` }}
    >
      {/* 1. Underlying Base Avatar Circle - fitted cleanly inside the frame when equipped */}
      <div
        className={`rounded-full aspect-square overflow-hidden transition-all duration-300 ${
          customFrame
            ? 'absolute inset-0 m-auto w-[74%] h-[74%] z-0 ring-1 ring-white/20'
            : `relative w-full h-full ring-2 ring-white/10 ${realm.avatarGlowCss}`
        }`}
        style={
          customFrame
            ? {
                boxShadow: `0 0 10px ${glowColor}40`,
                borderColor: glowColor,
              }
            : {}
        }
      >
        <img
          src={avatarUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80'}
          alt={daoName}
          className="w-full h-full object-cover rounded-full pointer-events-none block"
          loading="lazy"
        />
      </div>

      {/* 2. Custom Frame Overlay - strictly positioned ON THE OUTSIDE of the avatar */}
      {customFrame && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center origin-center transition-transform duration-100 z-10"
          style={{
            transform: `scale(${frameScale}) translate(${tx}px, ${ty}px)`,
          }}
        >
          {isPresetFrame ? (
            /* Elegant Celestial Daoist Ring for system presets with hollow center */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer decorative ring */}
              <div
                className="absolute inset-0 rounded-full border-2 transition-all"
                style={{
                  borderColor: glowColor,
                  boxShadow: `0 0 16px ${glowColor}aa, inset 0 0 8px ${glowColor}66`,
                }}
              />
              {/* Subtle rotation ring with ornate notches */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full absolute inset-0 animate-spin"
                style={{ animationDuration: '24s' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 8"
                  opacity="0.8"
                />
                {/* 4 Cardinal Spirit Orbs */}
                <circle cx="50" cy="2" r="3.5" fill={glowColor} />
                <circle cx="50" cy="98" r="3.5" fill={glowColor} />
                <circle cx="2" cy="50" r="3.5" fill={glowColor} />
                <circle cx="98" cy="50" r="3.5" fill={glowColor} />
              </svg>
            </div>
          ) : customFrame.imageUrl ? (
            /* User uploaded or custom image frame (PNG with transparency) */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={customFrame.imageUrl}
                alt={customFrame.name}
                className="w-full h-full object-contain pointer-events-none block"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColor})`,
                }}
              />
            </div>
          ) : (
            /* Fallback glowing celestial border */
            <div
              className="w-full h-full rounded-full border-2"
              style={{
                borderColor: glowColor,
                boxShadow: `0 0 12px ${glowColor}`,
              }}
            />
          )}
        </div>
      )}

      {/* 3. Online indicator dot */}
      {showOnlineDot && (
        <span
          className={`absolute rounded-full border-2 border-[#0d1424] z-20 ${config.dotClass} ${
            isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
          }`}
          title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        />
      )}
    </div>
  );
});

export default AvatarWithFrame;

