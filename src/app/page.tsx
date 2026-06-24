'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getTotalDistance, getTodayCount } from '@/lib/storage';

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    setTotalKm(Math.round(getTotalDistance() * 10) / 10);
    setTodayCount(getTodayCount());
  }, []);

  return (
    <main className="flex flex-col min-h-screen pb-20 bg-[#f3fbf6]">
      {/* 헤더 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4caf6e] via-[#3da55e] to-[#2e7d4f] px-6 pt-14 pb-20 text-white">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="text-5xl mb-3">🚲</div>
          <h1 className="text-4xl font-black tracking-tight">따랜디</h1>
          <p className="mt-2 text-green-100 text-sm leading-relaxed font-medium">
            따릉이 랜덤 디펜스<br />
            서울을 마음껏 달려보세요!
          </p>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="mx-4 -mt-8 z-10 relative">
        <div className="bg-white rounded-3xl shadow-md p-5 flex divide-x divide-gray-100">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-[#4caf6e]">
              {todayCount > 0 ? todayCount : '-'}
            </span>
            <span className="text-xs text-gray-500 font-medium">오늘 미션</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-[#4caf6e]">
              {totalKm > 0 ? `${totalKm}km` : '-'}
            </span>
            <span className="text-xs text-gray-500 font-medium">누적 거리</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-[#4caf6e]">3,334</span>
            <span className="text-xs text-gray-500 font-medium">전체 대여소</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 px-4 mt-6">
        <Link
          href="/mission"
          className="flex items-center justify-between bg-[#ff7043] text-white rounded-3xl px-6 py-5 shadow-lg active:scale-95 transition-transform"
        >
          <div>
            <div className="font-black text-lg">미션 시작하기</div>
            <div className="text-sm text-orange-100 mt-0.5">랜덤 대여소를 뽑아보세요!</div>
          </div>
          <span className="text-3xl">🎲</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/map"
            className="flex flex-col items-center gap-2 bg-white rounded-3xl px-4 py-5 shadow-sm border border-green-100 active:scale-95 transition-transform"
          >
            <span className="text-3xl">🗺️</span>
            <span className="font-bold text-sm text-gray-700">대여소 목록</span>
            <span className="text-xs text-gray-400">서울 전체 보기</span>
          </Link>
          <Link
            href="/badges"
            className="flex flex-col items-center gap-2 bg-white rounded-3xl px-4 py-5 shadow-sm border border-green-100 active:scale-95 transition-transform"
          >
            <span className="text-3xl">🏅</span>
            <span className="font-bold text-sm text-gray-700">내 기록</span>
            <span className="text-xs text-gray-400">뱃지 &amp; 히스토리</span>
          </Link>
        </div>
      </div>

      {/* 가이드 */}
      <div className="mx-4 mt-6 bg-white rounded-3xl p-5 border border-green-100">
        <h2 className="font-bold text-gray-700 mb-3 text-sm">🚀 이렇게 즐겨요</h2>
        <ol className="flex flex-col gap-2.5">
          {[
            { step: '1', text: '난이도를 선택하고 뽑기 버튼을 눌러요' },
            { step: '2', text: '랜덤으로 나온 대여소로 따릉이를 타고 가요' },
            { step: '3', text: '도착하면 미션 완료! 뱃지를 획득해요' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e8f5ee] text-[#4caf6e] text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <Navbar />
    </main>
  );
}
