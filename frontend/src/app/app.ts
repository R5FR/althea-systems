import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit() {
    this.translate.addLangs(['fr', 'en', 'ar']);
    this.translate.setDefaultLang('fr');
    const saved = localStorage.getItem('lang') || 'fr';
    this.translate.use(saved);
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
  }
}
