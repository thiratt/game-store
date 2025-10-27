export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  createdDate: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
}
