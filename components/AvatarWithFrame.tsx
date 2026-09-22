'use client';

import React from 'react';
import { loadCustomFrames } from '../lib/cultivation/shopAndFrames';
import { getRealmByLevel } from '../lib/cultivation/realms';

interface AvatarWithFrameProps {
  avatarUrl: string;
  daoName?: string;
  realmLevel?: number;
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: {
    container: 'w-9 h-9',
    avatar: 'w-7 h-7',
    frameScale: 1.28,
    dot: 'w-2.5 h-2.5 bottom-0 right-0',
  },
  md: {
    container: 'w-12 h-12',
    avatar: 'w-9.5 h-9.5',
    frameScale: 1.26,
    dot: 'w-2.5 h-2.5 bottom-0 right-0',
  },
  lg: {
    container: 'w-16 h-16',
    avatar: 'w-13 h-13',
    frameScale: 1.25,
    dot: 'w-3 h-3 bottom-0.5 right-0.5',
  },
  xl: {
    container: 'w-20 h-20',
    avatar: 'w-16 h-16',
    frameScale: 1.25,
    dot: 'w-3.5 h-3.5 bottom-1 right-1',
  },
  '2xl': {
    container: 'w-28 h-28',
    avatar: 'w-22 h-22',
    frameScale: 1.26,
    dot: 'w-4 h-4 bottom-1.5 right-1.5',
  },
};

export default function AvatarWithFrame({
  avatarUrl,
  daoName = 'Đạo Hữu',
  realmLevel = 1,
  frameId,
  size = 'md',
  showOnlineDot = false,
  isOnline = true,
  className = '',
}: AvatarWithFrameProps) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const realm = getRealmByLevel(realmLevel);

  // Find custom frame if any
  const frames = loadCustomFrames();
  const customFrame = frameId ? frames.find((f) => f.id === frameId) : null;

  return (
    <div className={`relative flex items-center justify-center select-none rounded-full ${sizeConfig.container} ${className}`}>
      {/* Base Avatar Circle - strictly circular */}
      <div
        className={`relative ${sizeConfig.avatar} rounded-full aspect-square overflow-hidden transition-all duration-300 ring-1 ring-white/10 ${
          customFrame ? '' : realm.avatarGlowCss
        }`}
        style={
          customFrame
            ? {
                boxShadow: `0 0 12px ${customFrame.glowColor}66, inset 0 0 8px ${customFrame.glowColor}44`,
                borderColor: customFrame.glowColor,
              }
            : {}
        }
      >
        <img
          src={avatarUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80'}
          alt={daoName}
          className="w-full h-full object-cover rounded-full pointer-events-none"
        />
      </div>

      {/* Custom Frame Overlay - Always circular, seamlessly and snugly wrapping adjacent to avatar */}
      {customFrame && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center rounded-full overflow-visible transition-transform duration-200"
          style={{
            transform: `scale(${customFrame.scale ?? sizeConfig.frameScale}) translate(${customFrame.offsetX ?? 0}px, ${customFrame.offsetY ?? 0}px)`,
          }}
        >
          {customFrame.imageUrl.startsWith('data:image') || customFrame.imageUrl.startsWith('http') ? (
            <div className="w-full h-full rounded-full relative flex items-center justify-center">
              <img
                src={customFrame.imageUrl}
                alt={customFrame.name}
                className="w-full h-full object-contain rounded-full drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              />
            </div>
          ) : (
            <div
              className="w-full h-full rounded-full border-2 shadow-[0_0_12px_currentColor]"
              style={{ borderColor: customFrame.glowColor, color: customFrame.glowColor }}
            />
          )}
        </div>
      )}

      {/* Online indicator dot */}
      {showOnlineDot && (
        <span
          className={`absolute rounded-full border-2 border-[#0d1424] z-10 ${sizeConfig.dot} ${
            isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
          }`}
          title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        />
      )}
    </div>
  );
}
