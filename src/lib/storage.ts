import type { CompletedMission } from '@/types';

const KEY = 'ttarandi_missions';

export function getCompletedMissions(): CompletedMission[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveMission(mission: CompletedMission): void {
  const missions = getCompletedMissions();
  localStorage.setItem(KEY, JSON.stringify([mission, ...missions]));
}

export function getTotalDistance(): number {
  return getCompletedMissions().reduce((sum, m) => sum + m.distance, 0);
}

export function getTodayCount(): number {
  const today = new Date().toDateString();
  return getCompletedMissions().filter(
    m => new Date(m.completedAt).toDateString() === today
  ).length;
}
