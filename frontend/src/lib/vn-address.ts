/**
 * Vietnam administrative divisions via provinces.open-api.vn (free, no key).
 * Cached in-memory after first fetch.
 */

const BASE = 'https://provinces.open-api.vn/api';

export interface Province { code: number; name: string; codename: string }
export interface District { code: number; name: string; province_code: number }
export interface Ward     { code: number; name: string; district_code: number }

let _provincesCache: Province[] | null = null;
const _districtsCache = new Map<number, District[]>();
const _wardsCache = new Map<number, Ward[]>();

export async function getProvinces(): Promise<Province[]> {
  if (_provincesCache) return _provincesCache;
  const res = await fetch(`${BASE}/p/`);
  if (!res.ok) throw new Error('Cannot fetch provinces');
  _provincesCache = await res.json();
  return _provincesCache!;
}

export async function getDistricts(provinceCode: number): Promise<District[]> {
  if (_districtsCache.has(provinceCode)) return _districtsCache.get(provinceCode)!;
  const res = await fetch(`${BASE}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error('Cannot fetch districts');
  const data = await res.json();
  const districts = data.districts || [];
  _districtsCache.set(provinceCode, districts);
  return districts;
}

export async function getWards(districtCode: number): Promise<Ward[]> {
  if (_wardsCache.has(districtCode)) return _wardsCache.get(districtCode)!;
  const res = await fetch(`${BASE}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error('Cannot fetch wards');
  const data = await res.json();
  const wards = data.wards || [];
  _wardsCache.set(districtCode, wards);
  return wards;
}

/** Validate Vietnam phone number — common mobile prefixes (10 digits) */
export function isValidVNPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  // 0 + (Viettel/MobiFone/Vinaphone/Vietnamobile/Gmobile prefix) + 7 digits
  return /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/.test(cleaned);
}
