import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home), title: 'Transmas | Transportation Marketplace' },
      { path: 'services', loadComponent: () => import('./pages/services/service-list/service-list').then((m) => m.ServiceList), title: 'Transportation Services | Transmas' },
      { path: 'services/:id', loadComponent: () => import('./pages/services/service-detail/service-detail').then((m) => m.ServiceDetail), title: 'Service Details | Transmas' },
      { path: 'professionals', loadComponent: () => import('./pages/professionals/professional-list/professional-list').then((m) => m.ProfessionalList), title: 'Transportation Professionals | Transmas' },
      { path: 'professionals/:id', loadComponent: () => import('./pages/professionals/professional-detail/professional-detail').then((m) => m.ProfessionalDetail), title: 'Professional Details | Transmas' },
      { path: 'reservations', loadComponent: () => import('./pages/reservations/reservation-list/reservation-list').then((m) => m.ReservationList), title: 'Reservations | Transmas' },
      { path: 'reservations/new', loadComponent: () => import('./pages/reservations/reservation-create-page/reservation-create-page').then((m) => m.ReservationCreatePage), title: 'Create Reservation | Transmas' },
      { path: 'reservations/:id', loadComponent: () => import('./pages/reservations/reservation-detail/reservation-detail').then((m) => m.ReservationDetail), title: 'Reservation Details | Transmas' },
      { path: 'admin/users', loadComponent: () => import('./pages/users/user-list/user-list').then((m) => m.UserList), title: 'User Management | Transmas' },
      { path: 'admin/categories', loadComponent: () => import('./pages/categories/category-list/category-list').then((m) => m.CategoryList), title: 'Service Categories | Transmas' },
      { path: 'admin/specialties', loadComponent: () => import('./pages/specialties/specialty-list/specialty-list').then((m) => m.SpecialtyList), title: 'Professional Specialties | Transmas' },
      { path: 'admin/professionals', loadComponent: () => import('./pages/professionals/professional-admin-list/professional-admin-list').then((m) => m.ProfessionalAdminList), title: 'Professional Administration | Transmas' },
      { path: 'admin/professionals/new', loadComponent: () => import('./pages/professionals/professional-create-page/professional-create-page').then((m) => m.ProfessionalCreatePage), title: 'Register Professional | Transmas' },
      { path: 'admin/professionals/:id/edit', loadComponent: () => import('./pages/professionals/professional-edit-page/professional-edit-page').then((m) => m.ProfessionalEditPage), title: 'Edit Professional | Transmas' },
      { path: 'admin/services', loadComponent: () => import('./pages/services/service-admin-list/service-admin-list').then((m) => m.ServiceAdminList), title: 'Service Administration | Transmas' },
      { path: 'admin/services/new', loadComponent: () => import('./pages/services/service-create-page/service-create-page').then((m) => m.ServiceCreatePage), title: 'Register Service | Transmas' },
      { path: 'admin/services/:id/edit', loadComponent: () => import('./pages/services/service-edit-page/service-edit-page').then((m) => m.ServiceEditPage), title: 'Edit Service | Transmas' },
    ],
  },
  { path: '**', redirectTo: '' },
];
