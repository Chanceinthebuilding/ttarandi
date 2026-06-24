'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import type { Station } from '@/types';
import stationsData from '@/data/stations.json';

const allStations = stationsData as Station[];
const allDistricts = ['전체', ...Array.from(new Set(allStations.map(s => s.district))).sort()];

function kakaoMapLink(station: Station) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(station.name)},${station.lat},${station.lng}`;
}

export default function MapPage() {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('전체');

  const filtered = useMemo(() => {
    return allStations.filter(s => {
      const matchDistrict = district === '전체' || s.district === district;
      const matchSearch =
        !search ||
        s.name.includes(search) ||
        s.address.includes(search) ||
        s.id.includes(search);
      return matchDistrict && matchSearch;
    });
  }, [search, district]);

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-[#f3fbf6]">
      {/* 헤더 */}
      <div className="bg-[#4caf6e] px-5 pt-12 pb-5 text-white">
        <h1 className="text-2xl font-black">🗺️ 대여소 목록</h1>
        <p className="text-green-100 text-sm mt-1">서울 전체 3,334개 대여소</p>
      </div>

      {/* 검색 + 필터 */}
      <div className="sticky top-0 z-20 bg-[#f3fbf6] px-4 pt-3 pb-2 flex flex-col gap-2 border-b border-green-100">
        <input
          type="search"
          placeholder="대여소 이름, 주소 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-green-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#4caf6e] transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allDistricts.map(d => (
            <button
              key={d}
              onClick={() => setDistrict(d)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                district === d
                  ? 'bg-[#4caf6e] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 px-1">{filtered.length}개 대여소</p>
      </div>

      {/* 목록 */}
      <div className="flex flex-col gap-2 px-4 pt-3">
        {filtered.slice(0, 100).map(station => (
          <a
            key={station.id}
            href={kakaoMapLink(station)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-green-50 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8f5ee] flex items-center justify-center text-sm">
              🚲
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 text-sm truncate">{station.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">{station.address}</div>
            </div>
            <span className="flex-shrink-0 text-xs font-medium text-[#4caf6e] bg-[#e8f5ee] px-2 py-0.5 rounded-full">
              {station.district}
            </span>
          </a>
        ))}
        {filtered.length > 100 && (
          <p className="text-xs text-center text-gray-400 py-4">
            상위 100개만 표시됩니다. 검색어로 좁혀보세요.
          </p>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm">검색 결과가 없어요</p>
          </div>
        )}
      </div>

      <Navbar />
    </main>
  );
}
