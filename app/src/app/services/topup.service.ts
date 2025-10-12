import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

export interface TopupRequest {
  amount: number;
  paymentMethod?: string;
  note?: string;
}

export interface TransactionHistory {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class TopupService {
  private readonly endpoint = `${environment.endpoint}/topup`;

  constructor(private http: HttpClient, private userService: UserService) {}

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.userService.currentUser?.id || '',
    };
    return headers;
  }

  processTopup(
    request: TopupRequest
  ): Observable<ApiResponse<{ amount: number; newBalance: number; transactionId: number }>> {
    return this.http
      .post<ApiResponse<{ amount: number; newBalance: number; transactionId: number }>>(
        this.endpoint,
        request,
        {
          headers: this.buildHeaders(),
        }
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            const currentUser = this.userService.currentUser;
            if (currentUser) {
              this.userService.updateCurrentUser({
                key: 'walletBalance',
                value: response.data.newBalance.toString(),
              });
            }
          }
        })
      );
  }

  getTransactionHistory(): Observable<ApiResponse<TransactionHistory[]>> {
    return this.http.get<ApiResponse<TransactionHistory[]>>(`${this.endpoint}/history`, {
      headers: this.buildHeaders(),
    });
  }

  getWalletBalance(): Observable<ApiResponse<{ balance: number }>> {
    return this.http.get<ApiResponse<{ balance: number }>>(`${this.endpoint}/balance`, {
      headers: this.buildHeaders(),
    });
  }
}
