import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly env = environment;

  get apiUrl(): string {
    return this.env.apiUrl;
  }

  get isProduction(): boolean {
    return this.env.production;
  }

  get isDevelopment(): boolean {
    return !this.env.production;
  }
}
