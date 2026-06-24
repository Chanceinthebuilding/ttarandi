'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getCompletedMissions, getTotalDistance, getTodayCount } from '@/lib/storage';
import type { CompletedMission } from '@/types';
import { formatDistance, roadDistance } from '@/lib/distance';

interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

function computeBadges(missions: CompletedMission[], totalKm: number): Badge[] {
  const total = missions.length;
  const todayCount = getTodayCount();
  const districts = new Set(missions.map(m => m.station.district));

  return [
    {
      id: 'first',
      emoji: '🌱',
      name: '첫 페달',
      desc: '첫 미션 완료',
      unlocked: total >= 1,
    },
    {
      id: 'triple',
      emoji: '🔥',
      name: '3연속 클리어',
      desc: '하루 3미션 완료',
      unlocked: todayCount >= 3,
    },
    {
      id: 'ten',
      emoji: '🎖️',
      name: '10회 달성',
      desc: '누적 10미션 완료',
      unlocked: total >= 10,
    },
    {
      id: 'km10',
      emoji: '🛣️',
      name: '10km 라이더',
      desc: '누적 10km 달성',
      unlocked: totalKm >= 10,
    },
    {
      id: 'km50',
      emoji: '🏆',
      name: '50km 챔피언',
      desc: '누적 50km 달성',
      unlocked: totalKm >= 50,
    },
    {
      id: 'km100',
      emoji: '🌟',
      name: '100km 레전드',
      desc: '누적 100km 달성',
      unlocked: totalKm >= 100,
    },
    {
      id: 'district3',
      emoji: '🗺️',
      name: '탐험가',
      desc: '3개 구 이상 방문',
      unlocked: districts.size >= 3,
    },
    {
      id: 'district5',
      emoji: '🧭',
      name: '서울 정복자',
      desc: '5개 구 이상 방문',
      unlocked: districts.size >= 5,
    },
  ];
}

export default function BadgesPage() {
  const [missions, setMissions] = useState<CompletedMission[]>([]);
  const [totalKm, setTotalKm] = useState(0);

  useEffect(() => {
    const m = getCompletedMissions();
    setMissions(m);
    setTotalKm(Math.round(getTotalDistance() * 10) / 10);
  }, []);

  const badges = computeBadges(missions, totalKm);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-[#f3fbf6]">
      {/* 헤더 */}
      <div className="bg-[#4caf6e] px-5 pt-12 pb-6 text-white">
        <h1 className="text-2xl font-black">🏅 내 기록</h1>
        <p className="text-green-100 text-sm mt-1">
          뱃지 {unlockedCount}/{badges.length}개 달성
        </p>
      </div>

      {/* 스탯 */}
      <div className="mx-4 -mt-4 bg-white rounded-3xl shadow-md p-5 flex divide-x divide-gray-100">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-[#4caf6e]">{missions.length}</span>
          <span className="text-xs text-gray-500">총 미션</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-[#4caf6e]">{totalKm > 0 ? `${totalKm}km` : '-'}</span>
          <span className="text-xs text-gray-500">누적 거리</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-[#4caf6e]">{getTodayCount()}</span>
          <span className="text-xs text-gray-500">오늘 미션</span>
        </div>
      </div>

      {/* 뱃지 */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-gray-600 mb-3">🎖️ 뱃지</h2>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? 'bg-white border-[#4caf6e]/30 shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-[10px] font-bold text-gray-700 leading-tight">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 미션 히스토리 */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-gray-600 mb-3">📋 미션 기록</h2>
        {missions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <span className="text-4xl">🚲</span>
            <p className="text-sm">아직 완료한 미션이 없어요</p>
            <p className="text-xs">첫 미션을 시작해보세요!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {missions.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-green-50 shadow-sm"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8f5ee] flex items-center justify-center text-sm font-black text-[#4caf6e]">
                  {missions.length - i}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">{m.station.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(m.completedAt).toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    {m.distance > 0 && ` · ${formatDistance(roadDistance(m.distance))}`}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{m.station.district}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </main>
  );
}
