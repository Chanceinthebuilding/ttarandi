// 서울 도심 기준 도로거리 보정계수 (직선거리 × 1.35 ≈ 실제 경로)
const ROAD_FACTOR = 1.35;

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function roadDistance(straightKm: number): number {
  return straightKm * ROAD_FACTOR;
}

export function estimatedMinutes(km: number): number {
  return Math.ceil(km / 15 * 60);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
