'use client';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '@/lib/vn-address';

export interface VNAddress {
  province?: string;
  provinceCode?: number;
  district?: string;
  districtCode?: number;
  ward?: string;
  wardCode?: number;
}

interface Props {
  value: VNAddress;
  onChange: (v: VNAddress) => void;
}

export function VNAddressSelector({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!value.provinceCode) { setDistricts([]); return; }
    getDistricts(value.provinceCode).then(setDistricts).catch(() => setDistricts([]));
  }, [value.provinceCode]);

  useEffect(() => {
    if (!value.districtCode) { setWards([]); return; }
    getWards(value.districtCode).then(setWards).catch(() => setWards([]));
  }, [value.districtCode]);

  function selectProvince(codeStr: string) {
    const p = provinces.find((x) => String(x.code) === codeStr);
    onChange({ provinceCode: p?.code, province: p?.name }); // reset district/ward
  }
  function selectDistrict(codeStr: string) {
    const d = districts.find((x) => String(x.code) === codeStr);
    onChange({ ...value, districtCode: d?.code, district: d?.name, wardCode: undefined, ward: undefined });
  }
  function selectWard(codeStr: string) {
    const w = wards.find((x) => String(x.code) === codeStr);
    onChange({ ...value, wardCode: w?.code, ward: w?.name });
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div>
        <Label className="mb-1.5 block">Tỉnh / Thành phố</Label>
        <Select value={String(value.provinceCode ?? '')} onValueChange={selectProvince} disabled={loading}>
          <SelectTrigger><SelectValue placeholder={loading ? 'Đang tải…' : 'Chọn tỉnh/TP'} /></SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 block">Quận / Huyện</Label>
        <Select value={String(value.districtCode ?? '')} onValueChange={selectDistrict} disabled={!value.provinceCode}>
          <SelectTrigger><SelectValue placeholder={value.provinceCode ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'} /></SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 block">Phường / Xã</Label>
        <Select value={String(value.wardCode ?? '')} onValueChange={selectWard} disabled={!value.districtCode}>
          <SelectTrigger><SelectValue placeholder={value.districtCode ? 'Chọn phường/xã' : 'Chọn quận trước'} /></SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w.code} value={String(w.code)}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
