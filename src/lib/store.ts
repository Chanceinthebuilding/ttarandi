'use client';

import { create } from 'zustand';
import type { Station, Difficulty } from '@/types';
import { saveMission } from './storage';

type DrawState = 'idle' | 'drawing' | 'revealed' | 'done' | 'no-results';

interface AppStore {
  userLocation: { lat: number; lng: number } | null;
  locationError: string | null;
  difficulty: Difficulty;
  drawState: DrawState;
  currentMission: Station | null;
  missionDistance: number;

  setUserLocation: (loc: { lat: number; lng: number }) => void;
  setLocationError: (err: string) => void;
  setDifficulty: (d: Difficulty) => void;
  startDrawing: () => void;
  setNoResults: () => void;
  revealMission: (station: Station, distance: number) => void;
  completeMission: () => void;
  resetMission: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  userLocation: null,
  locationError: null,
  difficulty: 'easy',
  drawState: 'idle',
  currentMission: null,
  missionDistance: 0,

  setUserLocation: (loc) => set({ userLocation: loc, locationError: null }),
  setLocationError: (err) => set({ locationError: err }),
  setDifficulty: (d) => set({ difficulty: d, drawState: 'idle', currentMission: null }),
  startDrawing: () => set({ drawState: 'drawing' }),
  setNoResults: () => set({ drawState: 'no-results' }),
  revealMission: (station, distance) =>
    set({ drawState: 'revealed', currentMission: station, missionDistance: distance }),
  completeMission: () => {
    const { currentMission, missionDistance } = get();
    if (!currentMission) return;
    saveMission({
      station: currentMission,
      distance: missionDistance,
      completedAt: new Date().toISOString(),
    });
    set({ drawState: 'done' });
    setTimeout(() => set({ drawState: 'idle', currentMission: null }), 2000);
  },
  resetMission: () => set({ drawState: 'idle', currentMission: null }),
}));
