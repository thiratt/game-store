import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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

  constructor(private http: HttpClient, private authService: AuthService) {}

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.authService.currentUser?.id || '',
    };
    return headers;
  }

  checkoutCart(): Observable<ApiResponse<Purchase>> {
    return this.http.post<ApiResponse<Purchase>>(
      `${this.endpoint}/checkout`,
      {},
      { headers: this.buildHeaders() }
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
