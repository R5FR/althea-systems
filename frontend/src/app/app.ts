import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatbotComponent],
  template: `<router-outlet />@if (!isAdmin()) { <app-chatbot /> }`,
})
export class App implements OnInit {
  private translate = inject(TranslateService);
  private router    = inject(Router);

  isAdmin = signal(false);

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isAdmin.set((e.urlAfterRedirects as string).startsWith('/admin'));
    });
    const saved = localStorage.getItem('lang') || 'fr';
    this.translate.use(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir  = saved === 'ar' ? 'rtl' : 'ltr';
  }
}
