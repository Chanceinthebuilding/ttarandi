'use client';

import { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { haversine, roadDistance, estimatedMinutes, formatDistance } from '@/lib/distance';
import { DIFFICULTY_CONFIG, type Difficulty, type Station } from '@/types';
import stationsData from '@/data/stations.json';

const allStations = stationsData as Station[];
const DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG) as Difficulty[];

function kakaoMapLink(station: Station, userLocation?: { lat: number; lng: number } | null) {
  const dest = `${encodeURIComponent(station.name)},${station.lat},${station.lng}`;
  if (userLocation) {
    return `https://map.kakao.com/link/from/현재위치,${userLocation.lat},${userLocation.lng}/to/${dest}`;
  }
  return `https://map.kakao.com/link/to/${dest}`;
}

function naverMapLink(station: Station, userLocation?: { lat: number; lng: number } | null) {
  const dname = encodeURIComponent(station.name);
  if (userLocation) {
    // 네이버 지도 앱 딥링크 — 자전거 길찾기, 출발지+도착지 모두 지정
    return `nmap://route/bicycle?slat=${userLocation.lat}&slng=${userLocation.lng}&sname=${encodeURIComponent('현재위치')}&dlat=${station.lat}&dlng=${station.lng}&dname=${dname}&appname=ttarandi`;
  }
  // 위치 없으면 목적지 검색으로 폴백
  return `nmap://search?query=${dname}`;
}

export default function MissionPage() {
  const {
    userLocation,
    locationError,
    difficulty,
    drawState,
    currentMission,
    missionDistance,
    setUserLocation,
    setLocationError,
    setDifficulty,
    startDrawing,
    revealMission,
    completeMission,
    resetMission,
    setNoResults,
  } = useAppStore();

  // 서울 경계 (위경도 범위)
  const SEOUL_BOUNDS = { latMin: 37.413, latMax: 37.715, lngMin: 126.734, lngMax: 127.269 };
  const isInSeoul = userLocation
    ? userLocation.lat >= SEOUL_BOUNDS.latMin && userLocation.lat <= SEOUL_BOUNDS.latMax &&
      userLocation.lng >= SEOUL_BOUNDS.lngMin && userLocation.lng <= SEOUL_BOUNDS.lngMax
    : true;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 위치 취득
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('이 기기는 위치 서비스를 지원하지 않아요.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('위치 권한이 거부되었어요. 전체 대여소 중 랜덤으로 뽑을게요.'),
      { timeout: 8000 }
    );
  }, [setUserLocation, setLocationError]);

  // 뽑기 로직
  function handleDraw() {
    if (drawState === 'drawing') return;
    startDrawing();

    timerRef.current = setTimeout(() => {
      const cfg = DIFFICULTY_CONFIG[difficulty];
      let candidates: Station[];

      if (userLocation) {
        candidates = allStations.filter(s => {
          const d = haversine(userLocation.lat, userLocation.lng, s.lat, s.lng);
          return d >= cfg.minKm && (cfg.maxKm === Infinity || d <= cfg.maxKm);
        });
        // 마스터: 전체 중 랜덤
        if (difficulty === 'master') candidates = allStations;
      } else {
        candidates = allStations;
      }

      if (candidates.length === 0) {
        setNoResults();
        return;
      }

      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      const dist = userLocation
        ? haversine(userLocation.lat, userLocation.lng, picked.lat, picked.lng)
        : 0;

      revealMission(picked, dist);
    }, 1600);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-[#f3fbf6]">
      {/* 헤더 */}
      <div className="bg-[#4caf6e] px-5 pt-12 pb-6 text-white">
        <h1 className="text-2xl font-black">🎲 랜덤 미션</h1>
        <p className="text-green-100 text-sm mt-1">오늘의 목적지를 뽑아보세요!</p>
      </div>

      <div className="flex flex-col gap-4 px-4 mt-4">
        {/* 위치 상태 */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${
          userLocation
            ? 'bg-[#e8f5ee] text-[#2e7d4f]'
            : locationError
            ? 'bg-orange-50 text-orange-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          <span className="text-base">
            {userLocation ? '📍' : locationError ? '⚠️' : '🔄'}
          </span>
          <span>
            {userLocation
              ? '현재 위치 확인 완료'
              : locationError
              ? locationError
              : '위치 확인 중...'}
          </span>
        </div>

        {/* 서울 외 경고 (기능 블락 없이 안내만) */}
        {userLocation && !isInSeoul && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200 text-sm text-orange-700">
            <span className="text-base flex-shrink-0">🚨</span>
            <span>현재위치가 서울이 아닙니다. 서울로 이동 후 재시작해주세요!</span>
          </div>
        )}

        {/* 난이도 선택 */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2 px-1">난이도 선택</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DIFFICULTIES.map(d => {
              const c = DIFFICULTY_CONFIG[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all duration-150 ${
                    active
                      ? 'border-[#4caf6e] bg-[#e8f5ee] text-[#2e7d4f]'
                      : 'border-transparent bg-white text-gray-600'
                  }`}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{c.label}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {d === 'master'
                      ? '전체'
                      : d === 'beginner'
                      ? `~${c.maxKm}km`
                      : `${c.minKm}~${c.maxKm}km`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 메인 뽑기 영역 */}
        {drawState === 'no-results' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center text-5xl">
              🔍
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700">해당하는 장소가 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">
                {cfg.label} 난이도 범위 내 대여소가 없어요.<br />난이도를 바꿔서 다시 시도해보세요!
              </p>
            </div>
            <button
              onClick={resetMission}
              className="mt-2 bg-[#4caf6e] text-white font-black text-base px-10 py-3.5 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              다시 선택하기
            </button>
          </div>
        )}

        {drawState === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-[#e8f5ee]">
              <span className="text-5xl">🎲</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700">{cfg.label} 난이도</p>
              <p className="text-xs text-gray-400 mt-1">
                {userLocation
                  ? difficulty === 'master'
                    ? '현재 위치에서 전체 범위'
                    : `현재 위치에서 ${cfg.minKm === 0 ? '' : cfg.minKm + 'km~'}${cfg.maxKm}km 범위`
                  : '위치 미확인 · 전체 대여소 랜덤'}
              </p>
            </div>
            <button
              onClick={handleDraw}
              className="mt-2 bg-[#4caf6e] text-white font-black text-xl px-12 py-4 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              뽑기! 🎯
            </button>
          </div>
        )}

        {drawState === 'drawing' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div
              className="w-32 h-32 rounded-full bg-[#e8f5ee] flex items-center justify-center text-6xl"
              style={{ animation: 'spinSlow 0.8s linear infinite' }}
            >
              🚲
            </div>
            <p className="font-bold text-[#4caf6e] text-lg">운명의 대여소 찾는 중...</p>
            <p className="text-xs text-gray-400">두근두근!</p>
          </div>
        )}

        {(drawState === 'revealed' || drawState === 'done') && currentMission && (
          <div
            className="flex flex-col gap-3"
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            {drawState === 'done' ? (
              <div
                className="bg-[#4caf6e] text-white rounded-3xl p-6 text-center"
                style={{ animation: 'celebrate 0.6s ease both' }}
              >
                <div className="text-5xl mb-2">🎉</div>
                <div className="font-black text-xl">미션 완료!</div>
                <div className="text-green-100 text-sm mt-1">수고했어요! 기록에 저장됐어요.</div>
              </div>
            ) : (
              <>
                {/* 목적지 카드 */}
                <div className="bg-white rounded-3xl p-5 shadow-md border border-green-100">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bgClass} ${cfg.colorClass}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">{currentMission.district}</span>
                  </div>

                  <h2 className="text-xl font-black text-gray-800 leading-tight">
                    {currentMission.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{currentMission.address}</p>

                  {userLocation && missionDistance > 0 && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex-1 text-center">
                        <div className="font-black text-[#4caf6e] text-lg">{formatDistance(roadDistance(missionDistance))}</div>
                        <div className="text-xs text-gray-400 mt-0.5">예상 경로</div>
                      </div>
                      <div className="w-px bg-gray-100" />
                      <div className="flex-1 text-center">
                        <div className="font-black text-[#4caf6e] text-lg">약 {estimatedMinutes(roadDistance(missionDistance))}분</div>
                        <div className="text-xs text-gray-400 mt-0.5">소요 시간</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 지도 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={kakaoMapLink(currentMission, userLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#FAE100] text-[#3C1E1E] font-bold py-3.5 rounded-2xl active:scale-95 transition-transform text-sm"
                  >
                    <span>🗺️</span> 카카오맵
                  </a>
                  <a
                    href={naverMapLink(currentMission, userLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#03C75A] text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform text-sm"
                  >
                    <span>🟢</span> 네이버지도
                  </a>
                </div>

                <button
                  onClick={completeMission}
                  className="flex items-center justify-center gap-2 bg-[#ff7043] text-white font-black text-base py-4 rounded-2xl shadow-md active:scale-95 transition-transform"
                >
                  ✅ 미션 완료!
                </button>

                <button
                  onClick={resetMission}
                  className="text-sm text-gray-400 text-center py-2 underline underline-offset-2"
                >
                  다시 뽑기
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Navbar />
    </main>
  );
}
