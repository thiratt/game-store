import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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

  constructor(private http: HttpClient, private authService: AuthService) {}

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.authService.currentUser?.id || '',
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
            const currentUser = this.authService.currentUser;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                walletBalance: response.data.newBalance,
              };
              this.authService.currentUserSubject.next(updatedUser);
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
