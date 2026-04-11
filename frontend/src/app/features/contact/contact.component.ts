import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotStateService } from '../../core/services/chatbot-state.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="page-container py-12">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-display font-semibold text-navy mb-3">{{ 'contact.title' | translate }}</h1>
          <p class="text-gray-500">{{ 'contact.subtitle' | translate }}</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Contact info -->
          <div class="space-y-6">
            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-5">{{ 'contact.info_title' | translate }}</h2>
              <div class="space-y-4">
                @for (info of contactInfos; track info.label) {
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" [innerHTML]="info.icon"></div>
                    <div>
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ info.label }}</p>
                      <p class="text-sm text-gray-900 mt-0.5">{{ info.value }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-3">{{ 'contact.hours_title' | translate }}</h2>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between"><span>{{ 'contact.hours_weekday' | translate }}</span><span class="font-medium">{{ 'contact.hours_weekday_value' | translate }}</span></div>
                <div class="flex justify-between"><span>{{ 'contact.hours_saturday' | translate }}</span><span class="font-medium">{{ 'contact.hours_saturday_value' | translate }}</span></div>
                <div class="flex justify-between text-gray-400"><span>{{ 'contact.hours_sunday' | translate }}</span><span>{{ 'contact.hours_sunday_value' | translate }}</span></div>
              </div>
            </div>

            <!-- Chatbot trigger card -->
            <button (click)="openChat()"
              class="w-full card p-5 flex items-center gap-4 hover:shadow-md transition-all text-left group border-2 border-transparent hover:border-primary/20">
              <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ 'contact.chatbot_title' | translate }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ 'contact.chatbot_card_subtitle' | translate }}</p>
              </div>
              <svg class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Contact form -->
          <div class="lg:col-span-2 card p-8">
            <h2 class="font-semibold text-gray-900 mb-6">{{ 'contact.send_title' | translate }}</h2>

            @if (sent()) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ 'contact.success_title' | translate }}</h3>
                <p class="text-gray-500 text-sm">{{ 'contact.success_msg' | translate }}</p>
                <button (click)="resetForm()" class="btn-ghost mt-6 text-sm">{{ 'contact.send_another' | translate }}</button>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="send()" class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.first_name' | translate }}</label>
                    <input formControlName="firstName" class="input-field" [placeholder]="'contact.first_name_placeholder' | translate" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.last_name' | translate }}</label>
                    <input formControlName="lastName" class="input-field" [placeholder]="'contact.last_name_placeholder' | translate" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.email' | translate }}</label>
                  <input formControlName="email" type="email" class="input-field" placeholder="jean.dupont@example.com" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.phone' | translate }}</label>
                  <input formControlName="phone" type="tel" class="input-field" placeholder="+33 6 00 00 00 00" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.subject' | translate }}</label>
                  <select formControlName="subject" class="input-field">
                    <option value="">{{ 'contact.subject_placeholder' | translate }}</option>
                    <option value="Devis">{{ 'contact.subject_quote' | translate }}</option>
                    <option value="Information">{{ 'contact.subject_info' | translate }}</option>
                    <option value="Commande">{{ 'contact.subject_order' | translate }}</option>
                    <option value="SAV">{{ 'contact.subject_sav' | translate }}</option>
                    <option value="Facturation">{{ 'contact.subject_billing' | translate }}</option>
                    <option value="Autre">{{ 'contact.subject_other' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'contact.message' | translate }}</label>
                  <textarea formControlName="message" rows="5" class="input-field resize-none"
                    [placeholder]="'contact.message_placeholder' | translate"></textarea>
                  <p class="text-xs text-gray-400 mt-1 text-right">{{ form.value.message?.length ?? 0 }} / 2000</p>
                </div>

                @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }

                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-400">{{ 'contact.required_fields' | translate }}</p>
                  <button type="submit" [disabled]="sending() || form.invalid" class="btn-primary px-8">
                    @if (sending()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    }
                    {{ 'contact.send' | translate }}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>

  `,
})
export class ContactComponent {
  private fb          = inject(FormBuilder);
  private contactSvc  = inject(ContactService);
  private auth        = inject(AuthService);
  private sanitizer   = inject(DomSanitizer);
  private translate   = inject(TranslateService);
  private chatbotState = inject(ChatbotStateService);

  // ── Contact form state ────────────────────────────────────────────────────
  sent    = signal(false);
  sending = signal(false);
  error   = signal('');

  // ── Contact info cards ────────────────────────────────────────────────────
  contactInfos: { icon: SafeHtml; label: string; value: string }[] = [
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`),
      label: this.translate.instant('contact.info_phone'),
      value: '+33 1 23 45 67 89',
    },
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`),
      label: this.translate.instant('contact.info_email'),
      value: 'contact@althea-systems.fr',
    },
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`),
      label: this.translate.instant('contact.info_address'),
      value: '12 rue de la Paix, 75001 Paris',
    },
  ];

  // ── Reactive form ─────────────────────────────────────────────────────────
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    subject:   ['', Validators.required],
    message:   ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({ firstName: u.firstName, lastName: u.lastName, email: u.email });
    }
  }

  // ── Contact form methods ──────────────────────────────────────────────────
  send(): void {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.error.set('');
    this.contactSvc.sendMessage(this.form.value as any).subscribe({
      next:  () => { this.sent.set(true);  this.sending.set(false); },
      error: () => { this.error.set(this.translate.instant('contact.error_send')); this.sending.set(false); },
    });
  }

  resetForm(): void {
    this.sent.set(false);
    this.form.reset();
  }

  // ── Chatbot methods ───────────────────────────────────────────────────────
  openChat(): void {
    this.chatbotState.open();
  }
}

