# Environment Configuration

This directory contains environment-specific configuration files for the Angular application.

## Files

- `environment.interface.ts` - TypeScript interface defining the structure of environment configuration
- `environment.ts` - Development environment configuration (default)
- `environment.prod.ts` - Production environment configuration

## Usage

### Development
```bash
ng serve
# or
ng build --configuration=development
```
Uses `/api/v1` as the API URL with proxy configuration to forward requests to `http://127.0.0.1:8000`

### Production
```bash
ng build --configuration=production
```
Uses `https://your-api-domain.com/api/v1` as the API URL

## Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `production` | boolean | Whether the app is running in production mode |
| `apiUrl` | string | Base URL for API requests |

## Adding New Environment Variables

1. Update the `Environment` interface in `environment.interface.ts`
2. Add the new property to both `environment.ts` and `environment.prod.ts`
3. Access the configuration through the `ConfigService`

## ConfigService

Instead of importing environment files directly, use the `ConfigService`:

```typescript
import { ConfigService } from './core/services/config.service';

// In your service or component
constructor(private config: ConfigService) {}

// Access environment variables
const apiUrl = this.config.apiUrl;
const isProduction = this.config.isProduction;
const isDevelopment = this.config.isDevelopment;
```
