import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/response.interface';
import { CouponResponse, AddCouponRequest } from '../interfaces/coupon.interface';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private apiUrl = environment.endpoint;

  constructor(private readonly http: HttpClient) {}

  getAllCoupons(): Observable<ApiResponse<CouponResponse[]>> {
    return this.http.get<ApiResponse<CouponResponse[]>>(`${this.apiUrl}/coupon`);
  }

  addCoupon(request: AddCouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.http.post<ApiResponse<CouponResponse>>(`${this.apiUrl}/coupon`, request);
  }

  deleteCoupon(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/coupon/${id}`);
  }

  get endpoint(): string {
    return this.apiUrl;
  }
}
