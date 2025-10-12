import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
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

  checkoutCart(): Observable<ApiResponse<Purchase>> {
    return this.http
      .post<ApiResponse<Purchase>>(
        `${this.endpoint}/checkout`,
        {},
        { headers: this.buildHeaders() }
      )
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

  getOwnedGames(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.endpoint}/owned-games`, {
      headers: this.buildHeaders(),
    });
  }
}
