import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const raw = readFileSync(join(root, '따릉이_운영_대여소 .csv'), 'utf8');
const csv = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = csv.split('\n').filter(l => l.trim()).slice(1);

let skippedZero = 0;
let nameFromAddress = 0;

const stations = lines.map(line => {
  const parts = line.split(',');
  if (parts.length < 5) return null;

  const id = parts[0].trim();
  const lng = parseFloat(parts[parts.length - 1].trim());
  const lat = parseFloat(parts[parts.length - 2].trim());
  let name = parts[parts.length - 3].trim();
  const address = parts.slice(1, parts.length - 3).join(',').trim();

  if (!id || isNaN(lat) || isNaN(lng)) return null;
  if (lat === 0 && lng === 0) { skippedZero++; return null; }

  // 이름 없으면 주소에서 "서울특별시 XX구 " 이후 부분 추출
  if (!name) {
    const match = address.match(/서울특별시\s+[가-힣]+구\s+(.+)/);
    name = match ? match[1].trim() : address;
    nameFromAddress++;
  }

  const districtMatch = address.match(/서울특별시\s+([가-힣]+구)/);

  return {
    id,
    address,
    name,
    lat,
    lng,
    district: districtMatch?.[1] || '기타',
  };
}).filter(Boolean);

writeFileSync(
  join(root, 'src/data/stations.json'),
  JSON.stringify(stations, null, 2),
  'utf8'
);

console.log(`✅ ${stations.length}개 대여소 변환 완료`);
console.log(`   - 이름 없어 주소에서 추출: ${nameFromAddress}개`);
console.log(`   - 좌표 없음(0,0) 제외: ${skippedZero}개`);
const districts = [...new Set(stations.map(s => s.district))].sort();
console.log(`📍 자치구 (${districts.length}개): ${districts.join(', ')}`);
