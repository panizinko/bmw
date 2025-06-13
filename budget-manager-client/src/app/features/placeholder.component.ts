import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="max-w-2xl mx-auto text-center">
      <mat-card class="p-8">
        <div class="text-6xl mb-4">🚧</div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          {{ title }} Coming Soon
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          This feature is being built with Angular 20's modern patterns
          including Signals and zoneless change detection.
        </p>
        <div class="grid grid-cols-3 gap-4 mt-8">
          <div class="text-center">
            <mat-icon class="text-3xl text-blue-500 mb-2">bolt</mat-icon>
            <div class="text-sm font-medium">Signals</div>
          </div>
          <div class="text-center">
            <mat-icon class="text-3xl text-green-500 mb-2">speed</mat-icon>
            <div class="text-sm font-medium">Zoneless</div>
          </div>
          <div class="text-center">
            <mat-icon class="text-3xl text-purple-500 mb-2"
              >auto_awesome</mat-icon
            >
            <div class="text-sm font-medium">Modern Angular</div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {
  @Input() title = 'Feature';
}
