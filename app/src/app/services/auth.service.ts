import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  walletBalance: number;
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

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  password?: string;
  profileImage?: File;
}

export interface LoginResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  data?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.endpoint;
  public currentUserSubject = new BehaviorSubject<User | null>(null);
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

  get isAdmin(): boolean {
    return this.currentUser?.role.toLowerCase() === 'admin';
  }

  get endpoint(): string {
    return this.apiUrl;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.endpoint}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
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

    return this.http.post<SignupResponse>(`${this.endpoint}/auth/signup`, formData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  // TODO: Change return type to UpdateProfileResponse if needed
  updateProfile(request: UpdateProfileRequest): Observable<SignupResponse> {
    const formData = new FormData();

    if (request.username) {
      formData.append('username', request.username);
    }

    if (request.email) {
      formData.append('email', request.email);
    }

    if (request.password) {
      formData.append('password', request.password);
    }

    if (request.profileImage) {
      formData.append('profileImage', request.profileImage, request.profileImage.name);
    }

    return this.http
      .put<SignupResponse>(`${this.endpoint}/profile/${this.currentUser?.id}`, formData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
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
      .get<{ success: boolean; data?: boolean; message?: string }>(
        `${this.endpoint}/auth/check?email=${encodeURIComponent(email)}`
      )
      .pipe(map((response) => ({ available: response.success })));
  }

  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http
      .get<{ success: boolean; data?: boolean; message?: string }>(
        `${this.endpoint}/auth/check?username=${encodeURIComponent(username)}`
      )
      .pipe(map((response) => ({ available: response.success })));
  }
}
