import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

export interface ApiResponse<T> {
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

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.authService.currentUser?.id || '',
    };
    return headers;
  }

  // Get all cart items
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

  // Add item to cart
  addToCart(gameId: string): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(
        `${this.cartEndpoint}/${gameId}`,
        {},
        { headers: this.buildHeaders() }
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            this.loadCartItems();
            this.loadCartCount();
          }
        })
      );
  }

  // Remove item from cart
  removeFromCart(cartItemId: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.cartEndpoint}/${cartItemId}`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.loadCartItems();
            this.loadCartCount();
          }
        })
      );
  }

  // Clear entire cart
  clearCart(): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(this.cartEndpoint, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.cartItemsSubject.next([]);
            this.cartCountSubject.next(0);
          }
        })
      );
  }

  // Get cart item count
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

  // Get cart total
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

  // Helper methods for state management
  private loadCartItems(): void {
    this.getCartItems().subscribe();
  }

  private loadCartCount(): void {
    this.getCartCount().subscribe();
  }

  private loadCartTotal(): void {
    this.getCartTotal().subscribe();
  }

  // Get current cart items synchronously
  getCurrentCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Get current cart count synchronously
  getCurrentCartCount(): number {
    return this.cartCountSubject.value;
  }
}
