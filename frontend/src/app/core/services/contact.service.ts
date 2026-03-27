import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactMessageDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contact`;

  sendMessage(dto: ContactMessageDto) {
    return this.http.post(this.base, dto);
  }

  /** Simple rule-based chatbot responses */
  getChatbotResponse(message: string): Observable<string> {
    return of(this._chatbotReply(message));
  }

  private _chatbotReply(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('commande') || msg.includes('order'))
      return 'Pour suivre votre commande, rendez-vous dans votre espace "Mes commandes" ou contactez-nous par email.';
    if (msg.includes('paiement') || msg.includes('carte'))
      return 'Nous acceptons Visa, Mastercard et American Express via Stripe. Vos données sont sécurisées (PCI-DSS).';
    if (msg.includes('livraison') || msg.includes('délai'))
      return 'Les délais de livraison varient selon les produits. Consultez la fiche produit ou contactez notre équipe.';
    if (msg.includes('retour') || msg.includes('remboursement'))
      return 'Pour un retour ou remboursement, envoyez votre demande via ce formulaire ou par email sous 14 jours.';
    if (msg.includes('stock') || msg.includes('disponible'))
      return 'La disponibilité est indiquée sur chaque fiche produit. Contactez-nous pour les commandes spéciales.';
    if (msg.includes('contact') || msg.includes('humain') || msg.includes('agent'))
      return 'Je vous transfère vers notre équipe. Merci de remplir le formulaire ci-dessous et nous vous répondrons dans les 24h.';
    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello'))
      return 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    return 'Je n\'ai pas bien compris votre demande. Pouvez-vous reformuler, ou utiliser le formulaire de contact pour une assistance personnalisée ?';
  }
}
