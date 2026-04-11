import { Component, signal, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { ContactService } from '../../../core/services/contact.service';
import { ChatbotStateService } from '../../../core/services/chatbot-state.service';
import { AuthService } from '../../../core/services/auth.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .chat-panel { animation: slideUp 0.22s ease; }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    .msg-in  { animation: fadeIn 0.18s ease; }
    .msg-out { animation: fadeIn 0.18s ease; }
  `],
  template: `
    <!-- ─── Chat panel ─────────────────────────────────────────────────────── -->
    @if (state.isOpen()) {
      <div class="chat-panel fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
           style="height: 460px;">

        <!-- Header -->
        <div class="bg-navy px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11h-6V5a1 1 0 00-2 0v6H5a1 1 0 000 2h6v6a1 1 0 002 0v-6h6a1 1 0 000-2z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-white text-sm leading-tight">{{ 'contact.chatbot_title' | translate }}</p>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span class="text-xs text-white/60">{{ 'contact.chatbot_online' | translate }}</span>
              </div>
            </div>
          </div>
          <button (click)="state.close()"
            class="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            [attr.aria-label]="'contact.chatbot_close' | translate">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Not logged in -->
        @if (!auth.isLoggedIn()) {
          <div class="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-gray-50">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ 'contact.chatbot_login_required' | translate }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ 'contact.chatbot_login_hint' | translate }}</p>
            </div>
            <a routerLink="/login" (click)="state.close()"
              class="btn-primary text-sm px-6 py-2">
              {{ 'contact.chatbot_login_btn' | translate }}
            </a>
          </div>

        } @else {
          <!-- Loading history -->
          @if (loadingHistory()) {
            <div class="flex-1 flex items-center justify-center bg-gray-50">
              <span class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            </div>
          } @else {
            <!-- Messages area -->
            <div #chatBody class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              @for (msg of chatMessages(); track msg.time) {
                @if (msg.from === 'bot') {
                  <div class="flex justify-start msg-in">
                    <div class="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
                      <p class="text-xs mt-1 opacity-50 text-right">{{ msg.time | date:'HH:mm' }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="flex justify-end msg-out">
                    <div class="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                      <p class="text-sm leading-relaxed">{{ msg.text }}</p>
                      <p class="text-xs mt-1 opacity-60 text-right">{{ msg.time | date:'HH:mm' }}</p>
                    </div>
                  </div>
                }
              }

              @if (isTyping()) {
                <div class="flex justify-start">
                  <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div class="flex gap-1.5 items-center h-4">
                      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                      <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Quick replies (shown only at start of new session) -->
            @if (chatMessages().length <= 1 && !isTyping()) {
              <div class="px-4 pb-3 pt-1 flex gap-2 flex-wrap bg-gray-50 flex-shrink-0">
                @for (q of quickReplies; track q) {
                  <button (click)="sendMessage(q)"
                    class="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                    {{ q }}
                  </button>
                }
              </div>
            }

            <!-- Input area -->
            <div class="p-3 border-t border-gray-100 bg-white flex-shrink-0">
              <div class="flex gap-2">
                <input
                  type="text"
                  [value]="chatInput()"
                  (input)="chatInput.set($any($event.target).value)"
                  (keydown.enter)="sendMessage(chatInput())"
                  [placeholder]="'contact.chatbot_placeholder' | translate"
                  class="flex-1 input-field text-sm py-2" />
                <button (click)="sendMessage(chatInput())"
                  [disabled]="!chatInput().trim() || isTyping()"
                  class="btn-primary px-3 py-2 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    }

    <!-- ─── Floating chat button ───────────────────────────────────────────── -->
    <button (click)="toggle()"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-200 transition-all hover:shadow-xl hover:scale-105"
      [attr.aria-label]="state.isOpen() ? ('contact.chatbot_close' | translate) : ('contact.chatbot_open' | translate)">
      @if (state.isOpen()) {
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      } @else {
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      }
    </button>
  `,
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLElement>;

  protected state      = inject(ChatbotStateService);
  protected auth       = inject(AuthService);
  private contactSvc   = inject(ContactService);
  private translate    = inject(TranslateService);

  chatMessages   = signal<ChatMessage[]>([]);
  chatInput      = signal('');
  isTyping       = signal(false);
  loadingHistory = signal(false);

  private historyLoaded = false;
  private shouldScroll  = false;

  quickReplies = [
    this.translate.instant('contact.quick_reply_delivery'),
    this.translate.instant('contact.quick_reply_order'),
    this.translate.instant('contact.quick_reply_return'),
    this.translate.instant('contact.quick_reply_payment'),
  ];

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.state.toggle();
    if (this.state.isOpen() && this.auth.isLoggedIn() && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  open(): void {
    this.state.open();
    if (this.auth.isLoggedIn() && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    this.loadingHistory.set(true);
    this.historyLoaded = true;

    this.contactSvc.getChatHistory().pipe(
      catchError(() => of([]))
    ).subscribe(history => {
      if (history.length > 0) {
        const msgs: ChatMessage[] = history.map(h => ({
          from: h.role === 'user' ? 'user' : 'bot',
          text: h.content,
          time: new Date(h.createdAt),
        }));
        this.chatMessages.set(msgs);
      } else {
        // Fresh session — show greeting
        this.chatMessages.set([{
          from: 'bot',
          text: this.translate.instant('contact.chatbot_greeting'),
          time: new Date(),
        }]);
      }
      this.loadingHistory.set(false);
      this.shouldScroll = true;
    });
  }

  private scrollToBottom(): void {
    const el = this.chatBodyRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.isTyping()) return;

    this.chatInput.set('');
    this.chatMessages.update(msgs => [...msgs, { from: 'user', text: trimmed, time: new Date() }]);
    this.shouldScroll = true;
    this.isTyping.set(true);

    setTimeout(() => {
      this.contactSvc.getChatbotResponse(trimmed).pipe(
        catchError(() => of(this.translate.instant('contact.chatbot_default_response')))
      ).subscribe(reply => {
        this.isTyping.set(false);
        this.chatMessages.update(msgs => [...msgs, { from: 'bot', text: reply, time: new Date() }]);
        this.shouldScroll = true;
      });
    }, 1000);
  }
}
