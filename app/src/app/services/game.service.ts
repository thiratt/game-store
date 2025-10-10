import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameCategory {
  id: number;
  name: string;
}

export interface Game {
  id?: string;
  title: string;
  description: string;
  price: number;
  releaseDate: Date;
  categories: GameCategory[];
  imageUrl?: string;
}

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

  constructor(private http: HttpClient) {}

  get endpoint(): string {
    return this.apiUrl;
  }

  getLatestReleaseGames(): Observable<ApiResponse<Game>> {
    return this.http.get<ApiResponse<Game>>(`${this.endpoint}/game/latest`);
  }

  getCategories(): Observable<ApiResponse<GameCategory[]>> {
    return this.http.get<ApiResponse<GameCategory[]>>(`${this.endpoint}/game/categories`);
  }

  getGames(): Observable<ApiResponse<Game[]>> {
    return this.http.get<ApiResponse<Game[]>>(`${this.endpoint}/game`);
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
}
