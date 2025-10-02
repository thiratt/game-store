import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  displayName?: string;
  avatar?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5053';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is logged in from localStorage on service init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.user) {
          // Store user in localStorage and update subject
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  signup(signupData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/auth/register`, signupData).pipe(
      tap((response) => {
        if (response.success && response.user) {
          // Store user in localStorage and update subject (auto-login after signup)
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Check if email is already taken
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http
      .get<{ success: boolean; data: boolean; message?: string }>(
        `${this.apiUrl}/auth/check-email?email=${encodeURIComponent(email)}`
      )
      .pipe(map((response) => ({ available: response.data })));
  }

  // Check if username is already taken
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http
      .get<{ success: boolean; data: boolean; message?: string }>(
        `${this.apiUrl}/auth/check-username?username=${encodeURIComponent(username)}`
      )
      .pipe(map((response) => ({ available: response.data })));
  }

  logout(): void {
    // Remove user from localStorage and update subject
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
