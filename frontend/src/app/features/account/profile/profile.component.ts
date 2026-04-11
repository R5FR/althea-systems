import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl font-display font-semibold text-navy">{{ 'account.profile_title' | translate }}</h1>

      <!-- Personal info -->
      <div class="card p-6">
        <h2 class="font-semibold text-gray-900 mb-5">{{ 'account.personal_info' | translate }}</h2>
        <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="space-y-4 max-w-md">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.first_name' | translate }}</label>
              <input formControlName="firstName" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.last_name' | translate }}</label>
              <input formControlName="lastName" class="input-field" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.email' | translate }}</label>
            <input formControlName="email" type="email" class="input-field" />
            <p class="text-xs text-gray-500 mt-1">{{ 'account.email_note' | translate }}</p>
          </div>
          @if (infoSuccess()) { <p class="text-sm text-green-600">{{ 'account.profile_updated' | translate }}</p> }
          @if (infoError()) { <p class="text-sm text-red-500">{{ infoError() }}</p> }
          <button type="submit" [disabled]="savingInfo()" class="btn-primary">
            @if (savingInfo()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
            {{ 'account.save' | translate }}
          </button>
        </form>
      </div>

      <!-- Change password -->
      <div class="card p-6">
        <h2 class="font-semibold text-gray-900 mb-5">{{ 'account.change_password' | translate }}</h2>
        <form [formGroup]="pwdForm" (ngSubmit)="changePwd()" class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.current_password' | translate }}</label>
            <input formControlName="currentPassword" type="password" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.new_password' | translate }}</label>
            <input formControlName="newPassword" type="password" class="input-field" />
            <p class="text-xs text-gray-500 mt-1">{{ 'account.password_hint' | translate }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'account.confirm_password' | translate }}</label>
            <input formControlName="confirm" type="password" class="input-field" />
          </div>
          @if (pwdSuccess()) { <p class="text-sm text-green-600">{{ 'account.password_updated' | translate }}</p> }
          @if (pwdError()) { <p class="text-sm text-red-500">{{ pwdError() }}</p> }
          <button type="submit" [disabled]="savingPwd()" class="btn-primary">
            @if (savingPwd()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
            {{ 'account.update' | translate }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userSvc = inject(UserService);
  private auth = inject(AuthService);

  savingInfo = signal(false);
  infoSuccess = signal(false);
  infoError = signal('');
  savingPwd = signal(false);
  pwdSuccess = signal(false);
  pwdError = signal('');

  infoForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
  });

  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirm:         ['', Validators.required],
  });

  ngOnInit() {
    const u = this.auth.user();
    if (u) this.infoForm.patchValue({ firstName: u.firstName, lastName: u.lastName, email: u.email });
  }

  saveInfo() {
    if (this.infoForm.invalid) return;
    this.savingInfo.set(true); this.infoError.set(''); this.infoSuccess.set(false);
    this.userSvc.updateProfile(this.infoForm.value as any).subscribe({
      next: () => { this.infoSuccess.set(true); this.savingInfo.set(false); setTimeout(() => this.infoSuccess.set(false), 3000); },
      error: err => { this.infoError.set(err?.error?.error || 'Erreur'); this.savingInfo.set(false); }
    });
  }

  changePwd() {
    if (this.pwdForm.value.newPassword !== this.pwdForm.value.confirm) {
      this.pwdError.set('Les mots de passe ne correspondent pas.'); return;
    }
    this.savingPwd.set(true); this.pwdError.set(''); this.pwdSuccess.set(false);
    this.userSvc.updateProfile({ currentPassword: this.pwdForm.value.currentPassword!, newPassword: this.pwdForm.value.newPassword! }).subscribe({
      next: () => { this.pwdSuccess.set(true); this.savingPwd.set(false); this.pwdForm.reset(); },
      error: err => { this.pwdError.set(err?.error?.error || 'Erreur'); this.savingPwd.set(false); }
    });
  }
}
