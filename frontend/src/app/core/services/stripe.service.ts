import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { from, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/payments`;

  private stripePromise = loadStripe(environment.stripePublicKey);

  getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  /** Ask backend to create a PaymentIntent and return the client_secret */
  createPaymentIntent(amountTtc: number, currency = 'eur') {
    return this.http.post<{ clientSecret: string; paymentIntentId: string }>(
      `${this.base}/intent`,
      { amount: Math.round(amountTtc * 100), currency }
    );
  }

  /** Confirm payment using a Stripe CardElement */
  async confirmCardPayment(
    clientSecret: string,
    cardElement: StripeCardElement,
    billingDetails: { name: string; email?: string },
    saveCard = false
  ) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');

    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
      setup_future_usage: saveCard ? 'off_session' : undefined,
    });
  }

  /** Confirm payment using a saved payment method ID */
  async confirmSavedCard(clientSecret: string, paymentMethodId: string) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');
    return stripe.confirmCardPayment(clientSecret, { payment_method: paymentMethodId });
  }

  /** Create a SetupIntent to save a card without immediate payment */
  createSetupIntent() {
    return this.http.post<{ clientSecret: string }>(`${this.base}/setup-intent`, {});
  }

  async confirmSetup(clientSecret: string, cardElement: StripeCardElement, billingDetails: { name: string }) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');
    return stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement, billing_details: billingDetails },
    });
  }
}
