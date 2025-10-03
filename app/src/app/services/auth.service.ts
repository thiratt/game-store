import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  profileImage?: File;
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
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  signup(signupData: SignupRequest): Observable<SignupResponse> {
    const formData = new FormData();
    formData.append('username', signupData.username);
    formData.append('email', signupData.email);
    formData.append('password', signupData.password);

    if (signupData.profileImage) {
      formData.append('profileImage', signupData.profileImage, signupData.profileImage.name);
    }

    return this.http.post<SignupResponse>(`${this.apiUrl}/auth/signup`, formData).pipe(
      tap((response) => {
        if (response.success && response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http
      .get<{ success: boolean; data: boolean; message?: string }>(
        `${this.apiUrl}/auth/check?email=${encodeURIComponent(email)}`
      )
      .pipe(map((response) => ({ available: response.data })));
  }

  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http
      .get<{ success: boolean; data: boolean; message?: string }>(
        `${this.apiUrl}/auth/check?username=${encodeURIComponent(username)}`
      )
      .pipe(map((response) => ({ available: response.data })));
  }
}
