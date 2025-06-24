import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('../features/clientes/clientes.page').then((m) => m.ClientesPage),
      },
      {
        path: 'contratos',
        loadComponent: () =>
          import('../features/contratos/contratos.page').then((m) => m.ContratosPage),
      },
      {
        path: 'equipamentos',
        loadComponent: () =>
          import('../features/equipamentos/equipamentos.page').then((m) => m.EquipamentosPage),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];
