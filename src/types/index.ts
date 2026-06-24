export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

export interface Station {
  id: string;
  address: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
}

export interface CompletedMission {
  station: Station;
  distance: number;
  completedAt: string;
}

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; emoji: string; minKm: number; maxKm: number; colorClass: string; bgClass: string }
> = {
  beginner: { label: '입문', emoji: '🟢', minKm: 0,   maxKm: 1,        colorClass: 'text-green-600',  bgClass: 'bg-green-100' },
  easy:     { label: '초급', emoji: '🟡', minKm: 1,   maxKm: 3,        colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100' },
  medium:   { label: '중급', emoji: '🟠', minKm: 3,   maxKm: 5,        colorClass: 'text-orange-500', bgClass: 'bg-orange-100' },
  hard:     { label: '고급', emoji: '🔴', minKm: 5,   maxKm: 10,       colorClass: 'text-red-600',    bgClass: 'bg-red-100' },
  master:   { label: '마스터', emoji: '⚫', minKm: 0, maxKm: Infinity, colorClass: 'text-gray-700',   bgClass: 'bg-gray-100' },
} as const;
