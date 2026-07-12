import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, MenuItem } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly publicMenu = signal<MenuItem[]>([
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Services', path: '/services', icon: 'airport_shuttle' },
    { label: 'Professionals', path: '/professionals', icon: 'badge' },
    { label: 'Reservations', path: '/reservations', icon: 'event_available' },
  ]);

  readonly administrationMenu = signal<MenuItem[]>([
    { label: 'Services', path: '/admin/services', icon: 'airport_shuttle' },
    { label: 'Categories', path: '/admin/categories', icon: 'category' },
    { label: 'Specialties', path: '/admin/specialties', icon: 'workspace_premium' },
    { label: 'Professionals', path: '/admin/professionals', icon: 'badge' },
  ]);

  readonly managementMenu = signal<MenuItem[]>([
    { label: 'Reservations', path: '/reservations', icon: 'event_note' },
    { label: 'Users', path: '/admin/users', icon: 'group' },
  ]);
}
