import { Component, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-container py-12">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-900 mb-3">Contactez-nous</h1>
          <p class="text-gray-500">Notre équipe est disponible pour répondre à toutes vos questions.</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Contact info -->
          <div class="space-y-6">
            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-5">Nos coordonnées</h2>
              <div class="space-y-4">
                @for (info of contactInfos; track info.label) {
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-lg">{{ info.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ info.label }}</p>
                      <p class="text-sm text-gray-900 mt-0.5">{{ info.value }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-3">Horaires</h2>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between"><span>Lun - Ven</span><span class="font-medium">8h00 – 18h00</span></div>
                <div class="flex justify-between"><span>Samedi</span><span class="font-medium">9h00 – 13h00</span></div>
                <div class="flex justify-between text-gray-400"><span>Dimanche</span><span>Fermé</span></div>
              </div>
            </div>

            <!-- Chatbot trigger -->
            <button (click)="openChat()"
              class="w-full card p-5 flex items-center gap-4 hover:shadow-md transition-all text-left group border-2 border-transparent hover:border-primary/20">
              <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">Assistant virtuel</p>
                <p class="text-xs text-gray-500 mt-0.5">Réponse instantanée 24h/24</p>
              </div>
              <svg class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Contact form -->
          <div class="lg:col-span-2 card p-8">
            <h2 class="font-semibold text-gray-900 mb-6">Envoyer un message</h2>

            @if (sent()) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                <p class="text-gray-500 text-sm">Nous vous répondrons dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.</p>
                <button (click)="resetForm()" class="btn-ghost mt-6 text-sm">Envoyer un autre message</button>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="send()" class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                    <input formControlName="firstName" class="input-field" placeholder="Jean" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                    <input formControlName="lastName" class="input-field" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail *</label>
                  <input formControlName="email" type="email" class="input-field" placeholder="jean.dupont@example.com" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <input formControlName="phone" type="tel" class="input-field" placeholder="+33 6 00 00 00 00" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Sujet *</label>
                  <select formControlName="subject" class="input-field">
                    <option value="">Choisir un sujet...</option>
                    <option value="Devis">Demande de devis</option>
                    <option value="Information">Information produit</option>
                    <option value="Commande">Suivi de commande</option>
                    <option value="SAV">Service après-vente</option>
                    <option value="Facturation">Facturation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea formControlName="message" rows="5" class="input-field resize-none"
                    placeholder="Décrivez votre demande en détail..."></textarea>
                  <p class="text-xs text-gray-400 mt-1 text-right">{{ form.value.message?.length ?? 0 }} / 2000</p>
                </div>

                @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }

                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-400">* Champs obligatoires</p>
                  <button type="submit" [disabled]="sending() || form.invalid" class="btn-primary px-8">
                    @if (sending()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    }
                    Envoyer
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Chat window -->
    @if (chatOpen()) {
      <div class="fixed bottom-6 right-6 w-80 sm:w-96 z-50 flex flex-col" style="max-height: 520px;">
        <div class="card flex flex-col shadow-2xl overflow-hidden" style="height: 520px;">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary to-primary-700 p-4 flex items-center gap-3 flex-shrink-0">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-white text-sm">Assistant Althea</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                <span class="text-xs text-primary-100">En ligne</span>
              </div>
            </div>
            <button (click)="chatOpen.set(false)" class="text-white/70 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div #chatBody class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            @for (msg of messages(); track msg.time) {
              <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="msg.role === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] shadow-sm'">
                  <p class="text-sm leading-relaxed">{{ msg.text }}</p>
                  <p class="text-xs mt-1 opacity-60 text-right">{{ msg.time | date:'HH:mm' }}</p>
                </div>
              </div>
            }
            @if (botTyping()) {
              <div class="flex justify-start">
                <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div class="flex gap-1.5 items-center">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Quick replies -->
          @if (messages().length <= 1) {
            <div class="px-4 pb-2 flex gap-2 flex-wrap bg-gray-50 flex-shrink-0">
              @for (q of quickReplies; track q) {
                <button (click)="sendMessage(q)"
                  class="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary transition-colors">
                  {{ q }}
                </button>
              }
            </div>
          }

          <!-- Input -->
          <div class="p-3 border-t border-gray-100 bg-white flex-shrink-0">
            <div class="flex gap-2">
              <input [(ngModel)]="chatInput" (keydown.enter)="sendChatInput()"
                type="text" placeholder="Votre message..."
                class="flex-1 input-field text-sm py-2" />
              <button (click)="sendChatInput()" [disabled]="!chatInput.trim()"
                class="btn-primary px-3 py-2 flex-shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Chat FAB (when closed) -->
    @if (!chatOpen()) {
      <button (click)="openChat()"
        class="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all z-50">
        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      </button>
    }
  `,
})
export class ContactComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBodyRef!: ElementRef;

  private fb = inject(FormBuilder);
  private contactSvc = inject(ContactService);
  private auth = inject(AuthService);

  sent = signal(false);
  sending = signal(false);
  error = signal('');
  chatOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  botTyping = signal(false);
  chatInput = '';
  private shouldScroll = false;

  contactInfos = [
    { icon: '📞', label: 'Téléphone', value: '+33 1 23 45 67 89' },
    { icon: '✉️', label: 'E-mail', value: 'contact@althea-systems.fr' },
    { icon: '📍', label: 'Adresse', value: '12 rue de la Paix, 75001 Paris' },
  ];

  quickReplies = [
    'Délai de livraison ?',
    'Comment commander ?',
    'Retour et remboursement',
    'Paiement sécurisé',
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({ firstName: u.firstName, lastName: u.lastName, email: u.email });
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    const el = this.chatBodyRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  send() {
    if (this.form.invalid) return;
    this.sending.set(true); this.error.set('');
    this.contactSvc.sendMessage(this.form.value as any).subscribe({
      next: () => { this.sent.set(true); this.sending.set(false); },
      error: () => { this.error.set('Une erreur est survenue. Veuillez réessayer.'); this.sending.set(false); }
    });
  }

  resetForm() { this.sent.set(false); this.form.reset(); }

  openChat() {
    this.chatOpen.set(true);
    if (this.messages().length === 0) {
      this.messages.set([{
        role: 'bot',
        text: 'Bonjour ! Je suis l\'assistant virtuel Althea Systems. Comment puis-je vous aider aujourd\'hui ?',
        time: new Date()
      }]);
      this.shouldScroll = true;
    }
  }

  sendChatInput() {
    const text = this.chatInput.trim();
    if (!text) return;
    this.chatInput = '';
    this.sendMessage(text);
  }

  sendMessage(text: string) {
    this.messages.update(m => [...m, { role: 'user', text, time: new Date() }]);
    this.shouldScroll = true;
    this.botTyping.set(true);

    this.contactSvc.getChatbotResponse(text).subscribe({
      next: reply => {
        setTimeout(() => {
          this.botTyping.set(false);
          this.messages.update(m => [...m, { role: 'bot', text: reply, time: new Date() }]);
          this.shouldScroll = true;
        }, 600);
      },
      error: () => {
        this.botTyping.set(false);
        this.messages.update(m => [...m, {
          role: 'bot',
          text: 'Désolé, je n\'ai pas pu traiter votre demande. Utilisez le formulaire de contact pour nous joindre.',
          time: new Date()
        }]);
        this.shouldScroll = true;
      }
    });
  }
}
