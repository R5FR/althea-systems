import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'categories/:slug', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
      { path: 'produits/:slug', loadComponent: () => import('./features/product/product.component').then(m => m.ProductComponent) },
      { path: 'recherche', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
      { path: 'panier', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
      { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'checkout/confirmation/:id', canActivate: [authGuard], loadComponent: () => import('./features/checkout/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
      { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
      {
        path: 'mon-compte',
        canActivate: [authGuard],
        loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent),
        children: [
          { path: '', redirectTo: 'profil', pathMatch: 'full' },
          { path: 'profil', loadComponent: () => import('./features/account/profile/profile.component').then(m => m.ProfileComponent) },
          { path: 'adresses', loadComponent: () => import('./features/account/addresses/addresses.component').then(m => m.AddressesComponent) },
          { path: 'paiements', loadComponent: () => import('./features/account/payments/payments.component').then(m => m.PaymentsComponent) },
          { path: 'commandes', loadComponent: () => import('./features/orders/order-history.component').then(m => m.OrderHistoryComponent) },
          { path: 'commandes/:id', loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent) },
        ]
      },
      { path: 'cgu', loadComponent: () => import('./features/legal/cgu.component').then(m => m.CguComponent) },
      { path: 'mentions-legales', loadComponent: () => import('./features/legal/mentions.component').then(m => m.MentionsComponent) },
    ]
  },
  // Auth pages (no layout wrapper – minimal UI)
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'confirm-email', loadComponent: () => import('./features/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },
  // Backoffice
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'produits', loadComponent: () => import('./features/admin/products/products-list.component').then(m => m.ProductsListComponent) },
      { path: 'produits/nouveau', loadComponent: () => import('./features/admin/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'produits/:id', loadComponent: () => import('./features/admin/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'commandes', loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'homepage', loadComponent: () => import('./features/admin/homepage/homepage-config.component').then(m => m.HomepageConfigComponent) },
      { path: 'messages', loadComponent: () => import('./features/admin/messages/admin-messages.component').then(m => m.AdminMessagesComponent) },
    ]
  },
  { path: '**', redirectTo: '' },
];
