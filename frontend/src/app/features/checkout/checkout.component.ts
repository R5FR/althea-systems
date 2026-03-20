import { Component, OnInit, AfterViewInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { StripeService } from '../../core/services/stripe.service';
import { AuthService } from '../../core/services/auth.service';
import { Address, PaymentMethod, CheckoutDto } from '../../core/models';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

type Step = 'address' | 'payment' | 'confirm';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container py-8 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Finaliser ma commande</h1>

      <!-- Step indicator -->
      <div class="flex items-center mb-10">
        @for (s of steps; track s.key; let i = $index) {
          <div class="flex items-center" [class.flex-1]="i < steps.length - 1">
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                [class.bg-primary]="isStepDone(s.key) || currentStep() === s.key"
                [class.text-white]="isStepDone(s.key) || currentStep() === s.key"
                [class.bg-gray-200]="!isStepDone(s.key) && currentStep() !== s.key"
                [class.text-gray-500]="!isStepDone(s.key) && currentStep() !== s.key">
                @if (isStepDone(s.key)) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                } @else { {{ i + 1 }} }
              </div>
              <span class="text-xs mt-1 font-medium hidden sm:block"
                [class.text-primary]="currentStep() === s.key"
                [class.text-gray-400]="currentStep() !== s.key && !isStepDone(s.key)"
                [class.text-gray-600]="isStepDone(s.key)">{{ s.label }}</span>
            </div>
            @if (i < steps.length - 1) {
              <div class="flex-1 h-0.5 mx-3 transition-colors" [class.bg-primary]="isStepDone(s.key)" [class.bg-gray-200]="!isStepDone(s.key)"></div>
            }
          </div>
        }
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left: Step content -->
        <div class="lg:col-span-2">

          <!-- ── Step 1: Address ──────────────────────────────── -->
          @if (currentStep() === 'address') {
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-5">Adresse de facturation</h2>

              <!-- Saved addresses -->
              @if (savedAddresses().length > 0) {
                <div class="space-y-3 mb-5">
                  @for (addr of savedAddresses(); track addr.id) {
                    <label class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors"
                      [class.border-primary]="selectedAddressId === addr.id"
                      [class.border-gray-200]="selectedAddressId !== addr.id">
                      <input type="radio" name="address" [value]="addr.id" [(ngModel)]="selectedAddressId" class="mt-1 text-primary" />
                      <div class="text-sm">
                        <p class="font-semibold text-gray-900">{{ addr.firstName }} {{ addr.lastName }}</p>
                        <p class="text-gray-600">{{ addr.addressLine1 }}</p>
                        @if (addr.addressLine2) { <p class="text-gray-600">{{ addr.addressLine2 }}</p> }
                        <p class="text-gray-600">{{ addr.postalCode }} {{ addr.city }}, {{ addr.country }}</p>
                        <p class="text-gray-500">{{ addr.phone }}</p>
                      </div>
                    </label>
                  }
                  <label class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors"
                    [class.border-primary]="selectedAddressId === 'new'"
                    [class.border-gray-200]="selectedAddressId !== 'new'">
                    <input type="radio" name="address" value="new" [(ngModel)]="selectedAddressId" class="mt-1 text-primary" />
                    <span class="text-sm font-semibold text-gray-900">+ Nouvelle adresse</span>
                  </label>
                </div>
              }

              <!-- New address form -->
              @if (savedAddresses().length === 0 || selectedAddressId === 'new') {
                <form [formGroup]="addressForm" class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                    <input formControlName="firstName" class="input-field" [class.input-error]="f['firstName'].invalid && f['firstName'].touched" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                    <input formControlName="lastName" class="input-field" [class.input-error]="f['lastName'].invalid && f['lastName'].touched" />
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Adresse *</label>
                    <input formControlName="addressLine1" class="input-field" placeholder="Rue, numéro" />
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Complément d'adresse</label>
                    <input formControlName="addressLine2" class="input-field" placeholder="Appartement, bâtiment..." />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Code postal *</label>
                    <input formControlName="postalCode" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Ville *</label>
                    <input formControlName="city" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Région</label>
                    <input formControlName="region" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Pays *</label>
                    <select formControlName="country" class="input-field">
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="LU">Luxembourg</option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Téléphone mobile *</label>
                    <input formControlName="phone" type="tel" class="input-field" />
                  </div>
                  <div class="col-span-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="saveAddress" [ngModelOptions]="{standalone: true}" class="text-primary rounded" />
                      <span class="text-sm text-gray-700">Enregistrer cette adresse</span>
                    </label>
                  </div>
                </form>
              }

              <button (click)="nextStep()" class="btn-primary mt-6 w-full justify-center py-3 text-base">
                Continuer vers le paiement
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          }

          <!-- ── Step 2: Payment ──────────────────────────────── -->
          @if (currentStep() === 'payment') {
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-5">Informations de paiement</h2>

              <!-- Saved cards -->
              @if (savedCards().length > 0) {
                <div class="space-y-3 mb-5">
                  @for (card of savedCards(); track card.id) {
                    <label class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors"
                      [class.border-primary]="selectedCardId === card.id"
                      [class.border-gray-200]="selectedCardId !== card.id">
                      <input type="radio" name="card" [value]="card.id" [(ngModel)]="selectedCardId" class="text-primary" />
                      <div class="flex items-center gap-3 flex-1">
                        <span class="text-xl">💳</span>
                        <div class="text-sm">
                          <p class="font-semibold text-gray-900">{{ card.cardBrand }} •••• {{ card.last4 }}</p>
                          <p class="text-gray-500">Expire {{ card.expMonth }}/{{ card.expYear }}</p>
                        </div>
                      </div>
                    </label>
                  }
                  <label class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors"
                    [class.border-primary]="selectedCardId === 'new'"
                    [class.border-gray-200]="selectedCardId !== 'new'">
                    <input type="radio" name="card" value="new" [(ngModel)]="selectedCardId" class="text-primary" />
                    <span class="text-sm font-semibold text-gray-900">+ Nouvelle carte</span>
                  </label>
                </div>
              }

              <!-- Stripe card element -->
              @if (savedCards().length === 0 || selectedCardId === 'new') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Nom sur la carte *</label>
                    <input [(ngModel)]="cardholderName" type="text" class="input-field" placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1.5">Numéro de carte *</label>
                    <div #stripeCard class="input-field py-3 bg-white min-h-[44px]">
                      <!-- Stripe CardElement mounts here -->
                    </div>
                    @if (stripeError()) {
                      <p class="text-red-500 text-xs mt-1">{{ stripeError() }}</p>
                    }
                  </div>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" [(ngModel)]="saveCard" class="text-primary rounded" />
                    <span class="text-sm text-gray-700">Enregistrer cette carte pour mes prochains achats</span>
                  </label>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Paiement sécurisé par Stripe (PCI-DSS)
                  </div>
                </div>
              }

              <div class="flex gap-3 mt-6">
                <button (click)="currentStep.set('address')" class="btn-ghost">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                  Retour
                </button>
                <button (click)="nextStep()" class="btn-primary flex-1 justify-center py-3 text-base">
                  Vérifier la commande
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          }

          <!-- ── Step 3: Confirmation ─────────────────────────── -->
          @if (currentStep() === 'confirm') {
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-5">Vérifier et confirmer</h2>

              <!-- Recap address -->
              <div class="mb-5">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-800 text-sm">Adresse</h3>
                  <button (click)="currentStep.set('address')" class="text-xs text-primary hover:underline">Modifier</button>
                </div>
                @if (selectedAddress()) {
                  <div class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {{ selectedAddress()!.firstName }} {{ selectedAddress()!.lastName }}<br/>
                    {{ selectedAddress()!.addressLine1 }}<br/>
                    {{ selectedAddress()!.postalCode }} {{ selectedAddress()!.city }}, {{ selectedAddress()!.country }}
                  </div>
                }
              </div>

              <!-- Recap payment -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-800 text-sm">Paiement</h3>
                  <button (click)="currentStep.set('payment')" class="text-xs text-primary hover:underline">Modifier</button>
                </div>
                <div class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  @if (selectedCardId !== 'new') {
                    @if (selectedCard()) {
                      💳 {{ selectedCard()!.cardBrand }} •••• {{ selectedCard()!.last4 }}
                    }
                  } @else {
                    💳 Nouvelle carte — {{ cardholderName }}
                  }
                </div>
              </div>

              <!-- Items recap -->
              <div class="border-t pt-4 mb-6">
                <h3 class="font-semibold text-gray-800 text-sm mb-3">Articles</h3>
                @for (item of cart()?.items ?? []; track item.id) {
                  <div class="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span class="text-gray-700">{{ item.productName }} × {{ item.quantity }}</span>
                    <span class="font-medium">{{ item.total | number:'1.2-2' }} €</span>
                  </div>
                }
              </div>

              @if (paymentError()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {{ paymentError() }}
                </div>
              }

              <div class="flex gap-3">
                <button (click)="currentStep.set('payment')" class="btn-ghost">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                  Retour
                </button>
                <button (click)="confirmOrder()" [disabled]="processing()"
                  class="btn-primary flex-1 justify-center py-3 text-base">
                  @if (processing()) {
                    <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Traitement...
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Confirmer et payer {{ cart()?.totalTtc | number:'1.2-2' }} €
                  }
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Right: Order summary -->
        <div class="lg:col-span-1">
          <div class="card p-5 sticky top-24">
            <h2 class="font-bold text-gray-900 mb-4">Récapitulatif</h2>
            <div class="space-y-2 text-sm text-gray-600 mb-4">
              @for (item of cart()?.items ?? []; track item.id) {
                <div class="flex justify-between">
                  <span class="line-clamp-1 flex-1 mr-2">{{ item.productName }} ×{{ item.quantity }}</span>
                  <span class="font-medium flex-shrink-0">{{ item.total | number:'1.2-2' }} €</span>
                </div>
              }
            </div>
            <div class="border-t pt-3 space-y-1 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>Sous-total HT</span><span>{{ cart()?.subtotalHt | number:'1.2-2' }} €</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>TVA</span><span>{{ cart()?.totalTva | number:'1.2-2' }} €</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                <span>Total TTC</span><span class="text-primary">{{ cart()?.totalTtc | number:'1.2-2' }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  @ViewChild('stripeCard') stripeCardRef!: ElementRef;

  private fb = inject(FormBuilder);
  private cartSvc = inject(CartService);
  private userSvc = inject(UserService);
  private orderSvc = inject(OrderService);
  private stripeSvc = inject(StripeService);
  private auth = inject(AuthService);
  private router = inject(Router);

  cart = this.cartSvc.cart;
  currentStep = signal<Step>('address');
  savedAddresses = signal<Address[]>([]);
  savedCards = signal<PaymentMethod[]>([]);
  selectedAddressId = '';
  selectedCardId = 'new';
  cardholderName = '';
  saveAddress = false;
  saveCard = false;
  processing = signal(false);
  stripeError = signal('');
  paymentError = signal('');

  private stripe: Stripe | null = null;
  private stripeElements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  steps = [
    { key: 'address' as Step, label: 'Adresse' },
    { key: 'payment' as Step, label: 'Paiement' },
    { key: 'confirm' as Step, label: 'Confirmation' },
  ];

  addressForm = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city:         ['', Validators.required],
    region:       [''],
    postalCode:   ['', Validators.required],
    country:      ['FR', Validators.required],
    phone:        ['', Validators.required],
  });

  get f() { return this.addressForm.controls; }

  selectedAddress = () => {
    if (this.selectedAddressId === 'new') return this.addressForm.value as any;
    return this.savedAddresses().find(a => a.id === this.selectedAddressId) ?? null;
  };

  selectedCard = () => this.savedCards().find(c => c.id === this.selectedCardId) ?? null;

  ngOnInit() {
    this.cartSvc.load().subscribe({ error: () => {} });
    this.userSvc.getAddresses().subscribe({
      next: addrs => {
        this.savedAddresses.set(addrs);
        if (addrs.length > 0) this.selectedAddressId = addrs[0].id;
        else this.selectedAddressId = 'new';
      },
      error: () => { this.selectedAddressId = 'new'; }
    });
    this.userSvc.getPaymentMethods().subscribe({
      next: cards => {
        this.savedCards.set(cards);
        const def = cards.find(c => c.isDefault);
        if (def) this.selectedCardId = def.id;
      },
      error: () => {}
    });
    const user = this.auth.user();
    if (user) this.cardholderName = `${user.firstName} ${user.lastName}`;
  }

  async ngAfterViewInit() {
    await this.mountStripe();
  }

  async mountStripe() {
    this.stripe = await this.stripeSvc.getStripe();
    if (!this.stripe || !this.stripeCardRef) return;
    this.stripeElements = this.stripe.elements();
    this.cardElement = this.stripeElements.create('card', {
      style: {
        base: { fontSize: '14px', color: '#374151', '::placeholder': { color: '#9CA3AF' } },
        invalid: { color: '#EF4444' },
      },
    });
    setTimeout(() => {
      if (this.cardElement && this.stripeCardRef?.nativeElement) {
        this.cardElement.mount(this.stripeCardRef.nativeElement);
        this.cardElement.on('change', e => this.stripeError.set(e.error?.message ?? ''));
      }
    }, 100);
  }

  isStepDone(step: Step): boolean {
    const order: Step[] = ['address', 'payment', 'confirm'];
    return order.indexOf(step) < order.indexOf(this.currentStep());
  }

  nextStep() {
    if (this.currentStep() === 'address') {
      if (this.selectedAddressId === 'new' && this.addressForm.invalid) {
        this.addressForm.markAllAsTouched(); return;
      }
      this.currentStep.set('payment');
      // Mount Stripe when payment step is shown
      setTimeout(() => this.mountStripe(), 200);
    } else if (this.currentStep() === 'payment') {
      this.currentStep.set('confirm');
    }
  }

  async confirmOrder() {
    if (this.processing()) return;
    this.processing.set(true);
    this.paymentError.set('');

    const cart = this.cart();
    if (!cart) { this.processing.set(false); return; }

    try {
      // 1. Create PaymentIntent on backend
      const intent = await this.stripeSvc.createPaymentIntent(cart.totalTtc).toPromise();
      if (!intent) throw new Error('Impossible de créer le paiement');

      // 2. Confirm card payment
      let paymentResult;
      if (this.selectedCardId !== 'new') {
        paymentResult = await this.stripeSvc.confirmSavedCard(intent.clientSecret, this.selectedCardId);
      } else {
        if (!this.cardElement || !this.cardholderName) {
          this.paymentError.set('Veuillez remplir les informations de carte.');
          this.processing.set(false); return;
        }
        paymentResult = await this.stripeSvc.confirmCardPayment(
          intent.clientSecret,
          this.cardElement,
          { name: this.cardholderName, email: this.auth.user()?.email },
          this.saveCard
        );
      }

      if (paymentResult.error) {
        this.paymentError.set(paymentResult.error.message ?? 'Paiement refusé');
        this.processing.set(false); return;
      }

      // 3. Save address if needed
      let addressId: string | undefined;
      if (this.selectedAddressId === 'new') {
        const newAddr = await this.userSvc.addAddress(this.addressForm.value as any).toPromise();
        addressId = newAddr?.id;
      } else {
        addressId = this.selectedAddressId;
      }

      // 4. Place order
      const dto: CheckoutDto = {
        cartId: this.cartSvc.cartId,
        addressId,
        paymentMethodId: this.selectedCardId !== 'new' ? this.selectedCardId : undefined,
        stripePaymentIntentId: intent.paymentIntentId,
        saveCard: this.saveCard,
      };

      const orderId = await this.orderSvc.placeOrder(dto).toPromise();
      localStorage.removeItem('cart_id');
      this.router.navigate(['/checkout/confirmation', orderId]);
    } catch (err: any) {
      this.paymentError.set(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.processing.set(false);
    }
  }
}
