'use client';

export type { CustomFrame, DharmaIdol, CustomArtifact, CustomTitle } from './shopTypes';
export {
  DEFAULT_FRAMES,
  DEFAULT_DHARMA_IDOLS,
  DEFAULT_ARTIFACTS,
  DEFAULT_CUSTOM_TITLES,
  FRAMES_KEY,
  DHARMA_KEY,
  ARTIFACTS_KEY,
  TITLES_KEY,
} from './shopTypes';

import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
  DEFAULT_FRAMES,
  DEFAULT_DHARMA_IDOLS,
  DEFAULT_ARTIFACTS,
  DEFAULT_CUSTOM_TITLES,
  FRAMES_KEY,
  DHARMA_KEY,
  ARTIFACTS_KEY,
  TITLES_KEY,
} from './shopTypes';

// In-memory cache to eliminate repetitive synchronous localStorage parsing lag
let memoryFrames: CustomFrame[] | null = null;
let memoryDharma: DharmaIdol[] | null = null;
let memoryArtifacts: CustomArtifact[] | null = null;
let memoryTitles: CustomTitle[] | null = null;

export function loadCustomFrames(): CustomFrame[] {
  if (memoryFrames) return memoryFrames;
  if (typeof window === 'undefined') return DEFAULT_FRAMES;
  try {
    const raw = localStorage.getItem(FRAMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryFrames = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryFrames = DEFAULT_FRAMES;
  return DEFAULT_FRAMES;
}

export function saveCustomFrames(frames: CustomFrame[]): void {
  const stampedFrames = frames.map((f) => ({ ...f, updatedAt: Date.now() }));
  memoryFrames = stampedFrames;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FRAMES_KEY, JSON.stringify(stampedFrames));
    // Asynchronously push to server cloud store for cross-device sync
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_FRAMES', frames: stampedFrames }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadDharmaIdols(): DharmaIdol[] {
  if (memoryDharma) return memoryDharma;
  if (typeof window === 'undefined') return DEFAULT_DHARMA_IDOLS;
  try {
    const raw = localStorage.getItem(DHARMA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryDharma = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryDharma = DEFAULT_DHARMA_IDOLS;
  return DEFAULT_DHARMA_IDOLS;
}

export function saveDharmaIdols(idols: DharmaIdol[]): void {
  const stampedIdols = idols.map((d) => ({ ...d, updatedAt: Date.now() }));
  memoryDharma = stampedIdols;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DHARMA_KEY, JSON.stringify(stampedIdols));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_DHARMA', dharmaIdols: stampedIdols }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadCustomArtifacts(): CustomArtifact[] {
  if (memoryArtifacts) return memoryArtifacts;
  if (typeof window === 'undefined') return DEFAULT_ARTIFACTS;
  try {
    const raw = localStorage.getItem(ARTIFACTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryArtifacts = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryArtifacts = DEFAULT_ARTIFACTS;
  return DEFAULT_ARTIFACTS;
}

export function saveCustomArtifacts(artifacts: CustomArtifact[]): void {
  const stampedArtifacts = artifacts.map((a) => ({ ...a, updatedAt: Date.now() }));
  memoryArtifacts = stampedArtifacts;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(stampedArtifacts));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_ARTIFACTS', artifacts: stampedArtifacts }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadCustomTitles(): CustomTitle[] {
  if (memoryTitles) return memoryTitles;
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_TITLES;
  try {
    const raw = localStorage.getItem(TITLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTitles = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  memoryTitles = DEFAULT_CUSTOM_TITLES;
  return DEFAULT_CUSTOM_TITLES;
}

export function saveCustomTitles(titles: CustomTitle[]): void {
  const stampedTitles = titles.map((t) => ({ ...t, updatedAt: Date.now() }));
  memoryTitles = stampedTitles;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TITLES_KEY, JSON.stringify(stampedTitles));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_TITLES', titles: stampedTitles }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function deleteCustomFrame(frameId: string): CustomFrame[] {
  const current = loadCustomFrames();
  const updated = current.filter((f) => f.id !== frameId);
  memoryFrames = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FRAMES_KEY, JSON.stringify(updated));
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_FRAME', id: frameId, frames: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}

export function deleteDharmaIdol(dharmaId: string): DharmaIdol[] {
  const current = loadDharmaIdols();
  const updated = current.filter((d) => d.id !== dharmaId);
  memoryDharma = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DHARMA_KEY, JSON.stringify(updated));
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_DHARMA', id: dharmaId, dharmaIdols: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}

export function deleteCustomArtifact(artifactId: string): CustomArtifact[] {
  const current = loadCustomArtifacts();
  const updated = current.filter((a) => a.id !== artifactId);
  memoryArtifacts = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updated));
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ARTIFACT', id: artifactId, artifacts: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}

export function deleteCustomTitle(titleId: string): CustomTitle[] {
  const current = loadCustomTitles();
  const updated = current.filter((t) => t.id !== titleId);
  memoryTitles = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TITLES_KEY, JSON.stringify(updated));
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_TITLE', id: titleId, titles: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}

/**
 * Fetch latest items from cloud server and merge into local storage.
 * Used when app mounts on any device (phone, laptop, tablet).
 */
export async function syncItemsFromCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success) return false;

    // Merge custom frames
    if (Array.isArray(data.customFrames) && data.customFrames.length > 0) {
      const current = loadCustomFrames();
      const map = new Map<string, CustomFrame>();
      current.forEach((f) => map.set(f.id, f));
      data.customFrames.forEach((f: CustomFrame) => {
        const local = map.get(f.id);
        if (!local) {
          map.set(f.id, f);
        } else {
          const serverTime = f.updatedAt || f.createdAt || 0;
          const localTime = local.updatedAt || local.createdAt || 0;
          if (serverTime > localTime) {
            map.set(f.id, f);
          }
        }
      });
      const merged = Array.from(map.values());
      memoryFrames = merged;
      localStorage.setItem(FRAMES_KEY, JSON.stringify(merged));
    }

    // Merge dharma idols
    if (Array.isArray(data.dharmaIdols) && data.dharmaIdols.length > 0) {
      const current = loadDharmaIdols();
      const map = new Map<string, DharmaIdol>();
      current.forEach((d) => map.set(d.id, d));
      data.dharmaIdols.forEach((d: DharmaIdol) => {
        const local = map.get(d.id);
        if (!local) {
          map.set(d.id, d);
        } else {
          const serverTime = d.updatedAt || d.createdAt || 0;
          const localTime = local.updatedAt || local.createdAt || 0;
          if (serverTime > localTime) {
            map.set(d.id, d);
          }
        }
      });
      const merged = Array.from(map.values());
      memoryDharma = merged;
      localStorage.setItem(DHARMA_KEY, JSON.stringify(merged));
    }

    // Merge artifacts
    if (Array.isArray(data.customArtifacts) && data.customArtifacts.length > 0) {
      const current = loadCustomArtifacts();
      const map = new Map<string, CustomArtifact>();
      current.forEach((a) => map.set(a.id, a));
      data.customArtifacts.forEach((a: CustomArtifact) => {
        const local = map.get(a.id);
        if (!local) {
          map.set(a.id, a);
        } else {
          const serverTime = a.updatedAt || a.createdAt || 0;
          const localTime = local.updatedAt || local.createdAt || 0;
          if (serverTime > localTime) {
            map.set(a.id, a);
          }
        }
      });
      const merged = Array.from(map.values());
      memoryArtifacts = merged;
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(merged));
    }

    // Merge titles
    if (Array.isArray(data.customTitles) && data.customTitles.length > 0) {
      const current = loadCustomTitles();
      const map = new Map<string, CustomTitle>();
      current.forEach((t) => map.set(t.id, t));
      data.customTitles.forEach((t: CustomTitle) => {
        const local = map.get(t.id);
        if (!local) {
          map.set(t.id, t);
        } else {
          const serverTime = t.updatedAt || t.createdAt || 0;
          const localTime = local.updatedAt || local.createdAt || 0;
          if (serverTime > localTime) {
            map.set(t.id, t);
          }
        }
      });
      const merged = Array.from(map.values());
      memoryTitles = merged;
      localStorage.setItem(TITLES_KEY, JSON.stringify(merged));
    }

    return true;
  } catch (err) {
    console.warn('[Sync] Could not pull items from server cloud:', err);
    return false;
  }
}
