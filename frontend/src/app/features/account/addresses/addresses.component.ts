import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Address } from '../../../core/models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Mes adresses</h1>
        <button (click)="showForm.set(!showForm())" class="btn-primary">
          + Ajouter une adresse
        </button>
      </div>

      @if (showForm()) {
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-4">{{ editId() ? 'Modifier l\'adresse' : 'Nouvelle adresse' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
              <input formControlName="firstName" class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
              <input formControlName="lastName" class="input-field" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1">Adresse *</label>
              <input formControlName="addressLine1" class="input-field" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1">Complément</label>
              <input formControlName="addressLine2" class="input-field" />
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
              <label class="block text-xs font-medium text-gray-700 mb-1">Téléphone *</label>
              <input formControlName="phone" type="tel" class="input-field" />
            </div>
            <div class="col-span-2 flex gap-3">
              <button type="submit" [disabled]="saving()" class="btn-primary">
                @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                Enregistrer
              </button>
              <button type="button" (click)="cancelForm()" class="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="space-y-3">@for (_ of [1,2]; track $index) { <div class="card p-4 skeleton h-24"></div> }</div>
      } @else if (addresses().length === 0) {
        <div class="card p-8 text-center text-gray-500">
          <p>Aucune adresse enregistrée.</p>
        </div>
      } @else {
        <div class="grid sm:grid-cols-2 gap-4">
          @for (addr of addresses(); track addr.id) {
            <div class="card p-4">
              <div class="flex justify-between items-start mb-2">
                <p class="font-semibold text-gray-900">{{ addr.firstName }} {{ addr.lastName }}</p>
                <div class="flex gap-1">
                  <button (click)="startEdit(addr)" class="text-xs btn-ghost px-2 py-1">Modifier</button>
                  <button (click)="deleteAddr(addr.id)" class="text-xs btn-ghost px-2 py-1 text-red-500 hover:bg-red-50">Supprimer</button>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ addr.addressLine1 }}</p>
              @if (addr.addressLine2) { <p class="text-sm text-gray-600">{{ addr.addressLine2 }}</p> }
              <p class="text-sm text-gray-600">{{ addr.postalCode }} {{ addr.city }}, {{ addr.country }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ addr.phone }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userSvc = inject(UserService);

  addresses = signal<Address[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editId = signal<string | null>(null);

  form = this.fb.group({
    firstName: ['', Validators.required], lastName: ['', Validators.required],
    addressLine1: ['', Validators.required], addressLine2: [''],
    city: ['', Validators.required], region: [''], postalCode: ['', Validators.required],
    country: ['FR', Validators.required], phone: ['', Validators.required],
  });

  ngOnInit() {
    this.userSvc.getAddresses().subscribe({
      next: a => { this.addresses.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  startEdit(addr: Address) {
    this.editId.set(addr.id);
    this.form.patchValue(addr as any);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() { this.showForm.set(false); this.editId.set(null); this.form.reset({ country: 'FR' }); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const dto = this.form.value as any;
    const obs = this.editId()
      ? this.userSvc.updateAddress(this.editId()!, dto)
      : this.userSvc.addAddress(dto);

    obs.subscribe({
      next: addr => {
        this.saving.set(false);
        if (this.editId()) {
          this.addresses.update(list => list.map(a => a.id === addr.id ? addr : a));
        } else {
          this.addresses.update(list => [...list, addr]);
        }
        this.cancelForm();
      },
      error: () => this.saving.set(false)
    });
  }

  deleteAddr(id: string) {
    if (!confirm('Supprimer cette adresse ?')) return;
    this.userSvc.deleteAddress(id).subscribe({
      next: () => this.addresses.update(list => list.filter(a => a.id !== id))
    });
  }
}
