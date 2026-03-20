import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="hidden md:block" style="background-color: #003D5C;">
      <!-- Main footer grid -->
      <div class="page-container py-16">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10">

          <!-- Brand column -->
          <div class="md:col-span-4">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: #00A8B5;">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                </svg>
              </div>
              <div class="leading-none">
                <span class="font-display font-semibold text-white text-xl tracking-tight block">Althea</span>
                <span class="text-xs font-medium tracking-widest uppercase" style="color: #33BFC9;">Systems</span>
              </div>
            </div>

            <p class="text-sm leading-relaxed mb-6" style="color: rgba(255,255,255,0.5);">
              Spécialiste du matériel médical de haute précision. Nous équipons les cabinets, cliniques et hôpitaux avec les technologies les plus avancées du marché.
            </p>

            <!-- Contact info -->
            <div class="space-y-2.5 text-sm mb-6" style="color: rgba(255,255,255,0.5);">
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 flex-shrink-0" style="color: #00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +33 1 23 45 67 89
              </div>
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 flex-shrink-0" style="color: #00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                contact&#64;althea-systems.fr
              </div>
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 flex-shrink-0 mt-0.5" style="color: #00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                15 Rue de la Santé, 75014 Paris
              </div>
            </div>

            <!-- Social links -->
            <div class="flex gap-2">
              <a href="#" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style="background:rgba(255,255,255,0.08);"
                onmouseenter="this.style.background='#00A8B5'" onmouseleave="this.style.background='rgba(255,255,255,0.08)'">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style="background:rgba(255,255,255,0.08);"
                onmouseenter="this.style.background='#00A8B5'" onmouseleave="this.style.background='rgba(255,255,255,0.08)'">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Navigation -->
          <div class="md:col-span-2">
            <h3 class="text-xs font-semibold tracking-widest uppercase mb-5" style="color: rgba(255,255,255,0.4);">Navigation</h3>
            <ul class="space-y-3">
              <li><a routerLink="/" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Accueil</a></li>
              <li><a routerLink="/recherche" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Catalogue</a></li>
              <li><a routerLink="/contact" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Contact</a></li>
              <li><a href="#" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">À propos</a></li>
              <li><a href="#" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Blog</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="md:col-span-2">
            <h3 class="text-xs font-semibold tracking-widest uppercase mb-5" style="color: rgba(255,255,255,0.4);">Légal</h3>
            <ul class="space-y-3">
              <li><a routerLink="/cgu" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">CGU</a></li>
              <li><a routerLink="/mentions-legales" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Mentions légales</a></li>
              <li><a href="#" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Confidentialité</a></li>
              <li><a href="#" class="text-sm transition-colors" style="color:rgba(255,255,255,0.6);"
                onmouseenter="this.style.color='white'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">Cookies</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="md:col-span-4">
            <h3 class="text-xs font-semibold tracking-widest uppercase mb-5" style="color: rgba(255,255,255,0.4);">Restez informé</h3>
            <p class="text-sm mb-4" style="color:rgba(255,255,255,0.5);">
              Recevez nos nouveautés, offres exclusives et actualités du secteur médical.
            </p>
            <form class="flex gap-2" (submit)="$event.preventDefault()">
              <input
                type="email"
                placeholder="Votre adresse e-mail"
                class="flex-1 px-4 py-2.5 rounded-lg text-sm border-0 outline-none"
                style="background:rgba(255,255,255,0.08); color:white; caret-color:white;"
              />
              <button type="submit" class="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all flex-shrink-0"
                style="background:#00A8B5;"
                onmouseenter="this.style.background='#0094A0'" onmouseleave="this.style.background='#00A8B5'">
                S'abonner
              </button>
            </form>

            <!-- Certifications -->
            <div class="mt-6 pt-6 border-t flex flex-wrap gap-3" style="border-color:rgba(255,255,255,0.08);">
              <div class="flex items-center gap-1.5 text-xs" style="color:rgba(255,255,255,0.4);">
                <svg class="w-4 h-4" style="color:#00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Paiement SSL
              </div>
              <div class="flex items-center gap-1.5 text-xs" style="color:rgba(255,255,255,0.4);">
                <svg class="w-4 h-4" style="color:#00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                Dispositifs CE certifiés
              </div>
              <div class="flex items-center gap-1.5 text-xs" style="color:rgba(255,255,255,0.4);">
                <svg class="w-4 h-4" style="color:#00A8B5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                Livraison EU
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div style="border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs" style="color:rgba(255,255,255,0.3);">
            © {{ year }} Althea Systems SAS. Tous droits réservés.
          </p>
          <p class="text-xs" style="color:rgba(255,255,255,0.2);">
            Numéro SIRET : 123 456 789 00012 — RCS Paris
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
