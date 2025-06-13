import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SignInCredentials,
  SignUpCredentials,
  UserPublic,
} from '../models/auth.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  signUp(credentials: SignUpCredentials): Observable<UserPublic> {
    const payload = {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    };

    return this.http.post<UserPublic>(`${this.config.apiUrl}/users`, payload);
  }

  signIn(credentials: SignInCredentials): Observable<UserPublic> {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<UserPublic>(
      `${this.config.apiUrl}/auth/token`,
      formData.toString(),
      {
        headers,
      },
    );
  }

  signOut(): Observable<void> {
    return this.http.post<void>(`${this.config.apiUrl}/auth/logout`, null);
  }

  getCurrentUser(): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${this.config.apiUrl}/users/me`);
  }

  refreshToken(): Observable<UserPublic> {
    return this.http.post<UserPublic>(
      `${this.config.apiUrl}/auth/refresh`,
      null,
    );
  }
}
