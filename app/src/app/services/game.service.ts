import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Game, GameCategory, TopSellerGame } from '../interfaces/game.interface';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

export interface AddGameRequest {
  title: string;
  description: string;
  price: number;
  releaseDate: Date;
  categoryIds: number[];
  imageUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = environment.endpoint;
  private adminEndpoint = this.apiUrl + '/admin';

  constructor(private http: HttpClient, private userService: UserService) {}

  get endpoint(): string {
    return this.apiUrl;
  }

  private buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': this.userService.currentUser?.id || '',
    };
    return headers;
  }

  getLatestReleaseGames(): Observable<ApiResponse<Game>> {
    return this.http.get<ApiResponse<Game>>(`${this.endpoint}/game/latest`, {
      headers: this.buildHeaders(),
    });
  }

  // getRandomGame(): Observable<ApiResponse<Game>> {
  //   return this.http.get<ApiResponse<Game>>(`${this.endpoint}/game/random`);
  // }

  getCategories(): Observable<ApiResponse<GameCategory[]>> {
    return this.http.get<ApiResponse<GameCategory[]>>(`${this.endpoint}/game/categories`, {
      headers: this.buildHeaders(),
    });
  }

  getGames(): Observable<ApiResponse<Game[]>> {
    return this.http.get<ApiResponse<Game[]>>(`${this.endpoint}/game`, {
      headers: this.buildHeaders(),
    });
  }

  getTopSellers(date?: Date, limit: number = 10): Observable<ApiResponse<TopSellerGame[]>> {
    let url = `${this.endpoint}/game/top-sellers?limit=${limit}`;
    if (date) {
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      url += `&date=${dateStr}`;
    }

    return this.http.get<ApiResponse<TopSellerGame[]>>(url, {
      headers: this.buildHeaders(),
    });
  }

  addGame(gameData: AddGameRequest): Observable<ApiResponse<Game>> {
    return this.http.post<ApiResponse<Game>>(`${this.adminEndpoint}/game`, gameData);
  }

  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<ApiResponse<string>>(`${this.endpoint}/image/upload`, formData);
  }

  deleteImage(imageUrl: string): Observable<ApiResponse<any>> {
    const filename = imageUrl.replace('/image/', '');
    return this.http.delete<ApiResponse<any>>(`${this.endpoint}/image/${filename}`);
  }

  deleteGame(gameId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.adminEndpoint}/game/${gameId}`);
  }

  getGameById(gameId: string): Observable<ApiResponse<Game>> {
    return this.http.get<ApiResponse<Game>>(`${this.endpoint}/game/${gameId}`, {
      headers: this.buildHeaders(),
    });
  }

  updateGame(gameId: string, gameData: AddGameRequest): Observable<ApiResponse<Game>> {
    return this.http.put<ApiResponse<Game>>(`${this.adminEndpoint}/game/${gameId}`, gameData);
  }

  searchGames(query: string, category: number): Observable<ApiResponse<Game[]>> {
    return this.http.get<ApiResponse<Game[]>>(`${this.endpoint}/game/search`, {
      params: { q: query, c: category },
    });
  }
}
