import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  gameId: string;
  title: string;
  price: number;
  imageUrl?: string;
  addedAt: Date;
  categories: GameCategory[];
}

export interface GameCategory {
  id: number;
  name: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subTotal: number;
  discount: number;
  total: number;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.endpoint;
  private cartEndpoint = this.apiUrl + '/cart';

  // Cart state management
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartTotalSubject = new BehaviorSubject<number>(0);

  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartCount$ = this.cartCountSubject.asObservable();
  public cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadCartItems();
    this.loadCartCount();
    this.loadCartTotal();
  }

  get endpoint(): string {
    return this.apiUrl;
  }

  private buildHeaders(): { [key: string]: string } {
    return {
      'Content-Type': 'application/json',
      'X-User-ID': this.authService.currentUser?.id || '',
    };
  }

  getCartItems(): Observable<ApiResponse<CartItem[]>> {
    return this.http
      .get<ApiResponse<CartItem[]>>(this.cartEndpoint, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.cartItemsSubject.next(response.data);
            this.cartCountSubject.next(response.data.length);
          }
        })
      );
  }

  addToCart(gameId: string): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.cartEndpoint}/${gameId}`, {}, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          console.log('Add to cart response:', response);
          if (response.success) {
            this.loadCartItems();
            this.loadCartCount();
            this.loadCartTotal();
          }
        })
      );
  }

  removeFromCart(cartItemId: number): Observable<ApiResponse> {
    return this.http
      .delete<ApiResponse>(`${this.cartEndpoint}/${cartItemId}`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.loadCartItems();
            this.loadCartCount();
            this.loadCartTotal();
          }
        })
      );
  }

  clearCart(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(this.cartEndpoint, { headers: this.buildHeaders() }).pipe(
      tap((response) => {
        if (response.success) {
          this.cartItemsSubject.next([]);
          this.cartCountSubject.next(0);
          this.cartTotalSubject.next(0);
        }
      })
    );
  }

  clearLocalCart(): void {
    this.cartItemsSubject.next([]);
    this.cartCountSubject.next(0);
    this.cartTotalSubject.next(0);
  }

  getCartCount(): Observable<ApiResponse<number>> {
    return this.http
      .get<ApiResponse<number>>(`${this.cartEndpoint}/count`, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          if (response.success && response.data !== undefined) {
            this.cartCountSubject.next(response.data);
          }
        })
      );
  }

  getCartTotal(): Observable<ApiResponse<number>> {
    return this.http
      .get<ApiResponse<number>>(`${this.cartEndpoint}/total`, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          if (response.success && response.data !== undefined) {
            this.cartTotalSubject.next(response.data);
          }
        })
      );
  }

  private loadCartItems(): void {
    this.getCartItems().subscribe();
  }

  private loadCartCount(): void {
    this.getCartCount().subscribe();
  }

  private loadCartTotal(): void {
    this.getCartTotal().subscribe();
  }

  getCurrentCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCurrentCartCount(): number {
    return this.cartCountSubject.value;
  }
}
