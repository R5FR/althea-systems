import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatbotComponent],
  template: `<router-outlet /><app-chatbot />`,
})
export class App implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit() {
    const saved = localStorage.getItem('lang') || 'fr';
    this.translate.use(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir  = saved === 'ar' ? 'rtl' : 'ltr';
  }
}
