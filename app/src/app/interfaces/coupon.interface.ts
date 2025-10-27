export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  createdDate: string;
  discountValue: number;
  maxUsage: number;
  usedCount: number;
  remainingUsage: number;
}

export interface AddCouponRequest {
  code: string;
  description?: string;
  discountValue: number;
  maxUsage: number;
}

export interface UpdateCouponRequest {
  code: string;
  description?: string;
  discountValue: number;
  maxUsage: number;
}
