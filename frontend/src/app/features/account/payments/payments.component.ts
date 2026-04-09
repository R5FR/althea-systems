import { Component, OnInit, AfterViewInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { StripeService } from '../../../core/services/stripe.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentMethod } from '../../../core/models';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">{{ 'account.payments_title' | translate }}</h1>
        <button (click)="toggleForm()" class="btn-primary">{{ 'account.add_card' | translate }}</button>
      </div>

      @if (showForm()) {
        <div class="card p-6 max-w-md">
          <h2 class="font-semibold text-gray-900 mb-4">{{ 'account.new_card' | translate }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ 'account.card_name' | translate }}</label>
              <input [(ngModel)]="cardholderName" type="text" class="input-field" [placeholder]="'account.card_name_placeholder' | translate" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ 'account.card_number' | translate }}</label>
              <div #cardEl class="input-field py-3 bg-white"></div>
              @if (stripeError()) { <p class="text-red-500 text-xs mt-1">{{ stripeError() }}</p> }
            </div>
            <div class="text-xs text-gray-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              {{ 'account.secure_payment' | translate }}
            </div>
            @if (addError()) { <p class="text-red-500 text-sm">{{ addError() }}</p> }
            <div class="flex gap-3">
              <button (click)="addCard()" [disabled]="saving()" class="btn-primary">
                @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                {{ 'common.save' | translate }}
              </button>
              <button (click)="toggleForm()" class="btn-ghost">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="space-y-3">@for (_ of [1,2]; track $index) { <div class="card p-4 skeleton h-16"></div> }</div>
      } @else if (cards().length === 0) {
        <div class="card p-8 text-center text-gray-500">
          <p>{{ 'account.no_cards' | translate }}</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (card of cards(); track card.id) {
            <div class="card p-4 flex items-center gap-4">
              <div class="w-8 h-8 text-gray-400 flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ card.cardBrand }} •••• {{ card.last4 }}</p>
                <p class="text-sm text-gray-500">{{ 'account.expires' | translate }} {{ card.expMonth }}/{{ card.expYear }}</p>
              </div>
              @if (card.isDefault) {
                <span class="badge-primary badge">{{ 'account.default_badge' | translate }}</span>
              } @else {
                <button (click)="setDefault(card.id)" class="btn-ghost text-xs">{{ 'account.set_default' | translate }}</button>
              }
              <button (click)="deleteCard(card.id)" class="text-red-400 hover:text-red-600 btn-ghost p-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PaymentsComponent implements OnInit, AfterViewInit {
  @ViewChild('cardEl') cardElRef!: ElementRef;

  private userSvc = inject(UserService);
  private stripeSvc = inject(StripeService);
  private auth = inject(AuthService);

  cards = signal<PaymentMethod[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  cardholderName = '';
  stripeError = signal('');
  addError = signal('');

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  ngOnInit() {
    this.userSvc.getPaymentMethods().subscribe({
      next: c => { this.cards.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    const u = this.auth.user();
    if (u) this.cardholderName = `${u.firstName} ${u.lastName}`;
  }

  async ngAfterViewInit() {
    this.stripe = await this.stripeSvc.getStripe();
  }

  async toggleForm() {
    this.showForm.set(!this.showForm());
    if (this.showForm() && this.stripe) {
      setTimeout(async () => {
        const elements = this.stripe!.elements();
        this.cardElement = elements.create('card', {
          style: { base: { fontSize: '14px', color: '#374151', '::placeholder': { color: '#9CA3AF' } } }
        });
        if (this.cardElRef?.nativeElement) {
          this.cardElement.mount(this.cardElRef.nativeElement);
          this.cardElement.on('change', e => this.stripeError.set(e.error?.message ?? ''));
        }
      }, 100);
    }
  }

  async addCard() {
    if (!this.stripe || !this.cardElement || !this.cardholderName) {
      this.addError.set('Veuillez remplir tous les champs.'); return;
    }
    this.saving.set(true); this.addError.set('');
    try {
      const { clientSecret } = await this.stripeSvc.createSetupIntent().toPromise() as any;
      const result = await this.stripeSvc.confirmSetup(clientSecret, this.cardElement, { name: this.cardholderName });
      if (result.error) { this.addError.set(result.error.message ?? 'Erreur'); this.saving.set(false); return; }
      const pmId = result.setupIntent?.payment_method as string;
      this.userSvc.addPaymentMethod(pmId).subscribe({
        next: card => { this.cards.update(c => [...c, card]); this.saving.set(false); this.showForm.set(false); },
        error: () => { this.addError.set('Erreur lors de l\'enregistrement.'); this.saving.set(false); }
      });
    } catch { this.saving.set(false); }
  }

  setDefault(id: string) {
    this.userSvc.setDefaultPaymentMethod(id).subscribe({
      next: () => this.cards.update(c => c.map(card => ({ ...card, isDefault: card.id === id })))
    });
  }

  deleteCard(id: string) {
    if (!confirm('Supprimer cette carte ?')) return;
    this.userSvc.deletePaymentMethod(id).subscribe({
      next: () => this.cards.update(c => c.filter(card => card.id !== id))
    });
  }
}
