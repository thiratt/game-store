import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { ApiResponse } from '../interfaces/response.interface';
import { OwnedGamesResponse } from '../interfaces/game.interface';
import { CheckoutWithCouponRequest } from '../interfaces/checkout.interface';

export interface PurchaseItem {
  gameId: string;
  gameTitle: string;
  price: number;
}

export interface Purchase {
  id: string;
  totalPrice: number;
  finalPrice: number;
  purchasedAt: string;
  items: PurchaseItem[];
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly endpoint = `${environment.endpoint}/purchase`;

  constructor(private http: HttpClient, private userService: UserService) {}

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.userService.currentUser?.id || '',
    };
    return headers;
  }

  checkoutCart(couponCode?: string): Observable<ApiResponse<Purchase>> {
    const requestBody: CheckoutWithCouponRequest = couponCode ? { couponCode } : {};

    return this.http
      .post<ApiResponse<Purchase>>(`${this.endpoint}/checkout`, requestBody, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            const currentUser = this.userService.currentUser;
            if (currentUser) {
              this.userService.updateCurrentUser({
                key: 'walletBalance',
                value: (currentUser.walletBalance - response.data.finalPrice).toString(),
              });
            }
          }
        })
      );
  }

  getPurchaseHistory(): Observable<ApiResponse<Purchase[]>> {
    return this.http.get<ApiResponse<Purchase[]>>(`${this.endpoint}/history`, {
      headers: this.buildHeaders(),
    });
  }

  getOwnedGames(): Observable<ApiResponse<OwnedGamesResponse>> {
    return this.http.get<ApiResponse<OwnedGamesResponse>>(`${this.endpoint}/owned-games`, {
      headers: this.buildHeaders(),
    });
  }
}
