import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly cards = signal<FeatureCard[]>([
    {
      title: 'Transportation services',
      description: 'Compare tourist, corporate, airport, event, school, and special transportation options.',
      icon: 'airport_shuttle',
      path: '/services',
    },
    {
      title: 'Trusted professionals',
      description: 'Find independent drivers, bilingual guides, subcontractors, and transportation companies.',
      icon: 'verified_user',
      path: '/professionals',
    },
    {
      title: 'Simple reservations',
      description: 'Provide the route, schedule, passenger count, and trip details in one clear request.',
      icon: 'event_available',
      path: '/reservations/new',
    },
  ]);
}
