import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TranslationApiService } from '../../core/services/translation-api.service';

@Pipe({ name: 'translateDynamic', standalone: true, pure: false })
export class TranslateDynamicPipe implements PipeTransform, OnDestroy {
  private svc = inject(TranslationApiService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  private sub?: Subscription;
  private langSub?: Subscription;
  private lastInput: string | null | undefined = null;
  private lastLang = '';
  private value = '';

  constructor() {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.lastInput != null) { this.lastLang = ''; this.resolve(this.lastInput); }
    });
  }

  transform(input: string | null | undefined): string {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    if (input === this.lastInput && lang === this.lastLang) return this.value;
    this.lastInput = input;
    this.lastLang = lang;
    this.resolve(input);
    return this.value;
  }

  private resolve(input: string | null | undefined) {
    this.sub?.unsubscribe();
    const lang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    this.value = input ?? '';
    if (!input) return;
    if (lang === 'fr') { this.value = input; return; }
    this.sub = this.svc.translate$(input, 'fr', lang).subscribe(v => {
      if (this.value !== v) {
        this.value = v;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.langSub?.unsubscribe();
  }
}
