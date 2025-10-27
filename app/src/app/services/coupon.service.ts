import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/response.interface';
import { UserService } from './user.service';
import {
  CouponResponse,
  AddCouponRequest,
  UpdateCouponRequest,
  ValidateCouponRequest,
  CouponValidationResponse,
} from '../interfaces/coupon.interface';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private apiUrl = environment.endpoint;

  constructor(private readonly http: HttpClient, private readonly userService: UserService) {}

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.userService.currentUser?.id || '',
    };
    return headers;
  }

  getAllCoupons(): Observable<ApiResponse<CouponResponse[]>> {
    return this.http.get<ApiResponse<CouponResponse[]>>(`${this.apiUrl}/coupon`);
  }

  getCoupon(id: string): Observable<ApiResponse<CouponResponse>> {
    return this.http.get<ApiResponse<CouponResponse>>(`${this.apiUrl}/coupon/${id}`);
  }

  addCoupon(request: AddCouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.http.post<ApiResponse<CouponResponse>>(`${this.apiUrl}/coupon`, request);
  }

  updateCoupon(id: string, request: UpdateCouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.http.put<ApiResponse<CouponResponse>>(`${this.apiUrl}/coupon/${id}`, request);
  }

  deleteCoupon(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/coupon/${id}`);
  }

  validateCoupon(
    request: ValidateCouponRequest
  ): Observable<ApiResponse<CouponValidationResponse>> {
    return this.http.post<ApiResponse<CouponValidationResponse>>(
      `${this.apiUrl}/coupon/validate`,
      request,
      { headers: this.buildHeaders() }
    );
  }

  get endpoint(): string {
    return this.apiUrl;
  }
}
