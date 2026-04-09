import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'admin.messages_title' | translate }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ unread() }} {{ 'admin.messages_unread' | translate }}</p>
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="input-field text-sm w-auto">
          <option value="">{{ 'admin.messages_filter_all' | translate }}</option>
          <option value="unread">{{ 'admin.messages_filter_unread' | translate }}</option>
          <option value="read">{{ 'admin.messages_filter_read' | translate }}</option>
          <option value="replied">{{ 'admin.messages_filter_replied' | translate }}</option>
        </select>
      </div>

      @if (loading()) {
        <div class="space-y-3">@for (_ of [1,2,3]; track $index) { <div class="card p-5 skeleton h-24"></div> }</div>
      } @else if (messages().length === 0) {
        <div class="card p-12 text-center text-gray-500">
          <p class="text-lg">{{ 'admin.messages_none' | translate }}</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (msg of messages(); track msg.id) {
            <div class="card p-5 cursor-pointer hover:shadow-md transition-all"
              [class]="msg.status === 'unread' ? 'border-l-4 border-l-primary' : ''"
              (click)="openMessage(msg)">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-sm font-bold text-primary">{{ (msg.firstName?.[0] ?? '') + (msg.lastName?.[0] ?? '') }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <p class="font-semibold text-gray-900">{{ msg.firstName }} {{ msg.lastName }}</p>
                    @if (msg.status === 'unread') {
                      <span class="badge badge-primary text-xs">{{ 'admin.messages_new_badge' | translate }}</span>
                    }
                    @if (msg.subject) {
                      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ msg.subject }}</span>
                    }
                    <span class="text-xs text-gray-400 ml-auto">{{ msg.createdAt | date:'d MMM, HH:mm':'':'fr' }}</span>
                  </div>
                  <p class="text-sm text-gray-500">{{ msg.email }}</p>
                  <p class="text-sm text-gray-600 mt-1 truncate">{{ msg.message }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Message detail modal -->
      @if (selected()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="selected.set(null)">
          <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 class="font-bold text-gray-900">{{ selected()!.firstName }} {{ selected()!.lastName }}</h2>
                <p class="text-sm text-gray-500">{{ selected()!.email }}</p>
              </div>
              <button (click)="selected.set(null)" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              @if (selected()!.subject) {
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{{ 'admin.messages_subject_label' | translate }}</p>
                  <p class="text-sm font-medium text-gray-900">{{ selected()!.subject }}</p>
                </div>
              }
              @if (selected()!.phone) {
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{{ 'admin.messages_phone_label' | translate }}</p>
                  <p class="text-sm text-gray-700">{{ selected()!.phone }}</p>
                </div>
              }
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{{ 'admin.messages_message_label' | translate }}</p>
                <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ selected()!.message }}</p>
              </div>
              <p class="text-xs text-gray-400">{{ 'admin.messages_received' | translate }} {{ selected()!.createdAt | date:'d MMMM yyyy à HH:mm':'':'fr' }}</p>

              <div class="border-t border-gray-100 pt-4 flex gap-3">
                <a [href]="'mailto:' + selected()!.email + '?subject=Re: ' + (selected()!.subject ?? 'Votre message')"
                  class="btn-primary text-sm">
                  {{ 'admin.messages_reply_email' | translate }}
                </a>
                <button (click)="markReplied(selected()!)" class="btn-ghost text-sm">{{ 'admin.messages_mark_replied' | translate }}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMessagesComponent implements OnInit {
  private adminSvc = inject(AdminService);

  messages = signal<any[]>([]);
  loading = signal(true);
  selected = signal<any | null>(null);
  statusFilter = '';

  unread = computed(() => this.messages().filter(m => m.status === 'unread').length);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminSvc.getContactMessages({ status: this.statusFilter }).subscribe({
      next: (msgs: any) => { this.messages.set(msgs.data ?? msgs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openMessage(msg: any) {
    this.selected.set(msg);
    if (msg.status === 'unread') {
      this.adminSvc.markMessageRead?.(msg.id)?.subscribe({ next: () => { msg.status = 'read'; } });
    }
  }

  markReplied(msg: any) {
    this.adminSvc.markMessageRead?.(msg.id)?.subscribe({ next: () => { msg.status = 'replied'; this.selected.set(null); } });
  }
}
