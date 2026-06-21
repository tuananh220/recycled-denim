import { Injectable, Logger } from '@nestjs/common';

/**
 * Shipping fee calculator — currently supports GHN with smart mock fallback.
 *
 * Real GHN integration:
 *   1. Register at https://5sao.ghn.dev
 *   2. Get token + shop_id
 *   3. Set GHN_TOKEN + GHN_SHOP_ID env vars
 *
 * Mock mode (default if no token): calculates based on distance heuristic.
 */

interface CalcFeeInput {
  toDistrictCode: number;   // GHN district id (we map from open-api district code)
  toWardCode?: string;
  weight: number;            // grams
  totalValue: number;        // VNĐ for insurance
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly token = process.env.GHN_TOKEN?.trim();
  private readonly shopId = process.env.GHN_SHOP_ID?.trim();
  private readonly fromDistrictId = Number(process.env.GHN_FROM_DISTRICT_ID || 1450); // HCM Quận 2 default

  get usingReal() {
    return !!(this.token && this.shopId);
  }

  /**
   * Returns shipping fee in VNĐ + estimated delivery time.
   * @param provinceCode optional — used for mock distance heuristic
   */
  async calculateFee(input: CalcFeeInput & { provinceCode?: number }) {
    if (this.usingReal) {
      try {
        return await this.calculateFeeGHN(input);
      } catch (e: any) {
        this.logger.warn(`GHN failed, falling back to mock: ${e.message}`);
      }
    }
    return this.calculateFeeMock(input);
  }

  /** Mock — flat zones based on province code */
  private calculateFeeMock(input: CalcFeeInput & { provinceCode?: number }) {
    const p = input.provinceCode ?? 0;
    // HCM = 79, Hanoi = 1
    let fee = 35_000; // default tỉnh xa
    let leadTimeDays = 5;

    if (p === 79 || p === 1) { fee = 22_000; leadTimeDays = 2; }      // HCM, HN
    else if ([74, 75, 77, 78, 80, 82, 83].includes(p)) {              // miền Nam lân cận
      fee = 28_000; leadTimeDays = 3;
    }
    else if ([24, 25, 27, 30, 31, 33, 35].includes(p)) {              // miền Bắc lân cận
      fee = 30_000; leadTimeDays = 3;
    }

    // Free over 500k
    if (input.totalValue >= 500_000) fee = 0;

    return {
      fee,
      leadTimeDays,
      provider: 'mock' as const,
      note: 'Phí vận chuyển ước tính. Có thể thay đổi khi giao thực tế.',
    };
  }

  /** Real GHN API call */
  private async calculateFeeGHN(input: CalcFeeInput) {
    const res = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
      method: 'POST',
      headers: {
        Token: this.token!,
        ShopId: this.shopId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_district_id: this.fromDistrictId,
        to_district_id: input.toDistrictCode,
        to_ward_code: input.toWardCode || '',
        service_type_id: 2, // 2 = E-commerce delivery
        weight: input.weight,
        insurance_value: input.totalValue,
      }),
    });
    if (!res.ok) throw new Error(`GHN ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    if (data.code !== 200) throw new Error(`GHN ${data.code}: ${data.message}`);

    return {
      fee: data.data.total as number,
      leadTimeDays: 3,
      provider: 'ghn' as const,
      raw: data.data,
    };
  }
}
