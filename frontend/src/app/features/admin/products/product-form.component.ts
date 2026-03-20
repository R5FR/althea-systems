import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a routerLink="/admin/produits" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Modifier le produit' : 'Nouveau produit' }}</h1>
      </div>

      @if (loading()) {
        <div class="card p-8 text-center">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
          <!-- Basic info -->
          <div class="card p-6 space-y-5">
            <h2 class="font-semibold text-gray-900">Informations générales</h2>
            <div class="grid sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom du produit *</label>
                <input formControlName="name" class="input-field" placeholder="Nom complet du produit" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Référence *</label>
                <input formControlName="reference" class="input-field font-mono" placeholder="REF-001" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Catégorie *</label>
                <select formControlName="categoryId" class="input-field">
                  <option value="">Choisir une catégorie...</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Description courte *</label>
                <textarea formControlName="shortDescription" rows="2" class="input-field resize-none"></textarea>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Description complète</label>
                <textarea formControlName="description" rows="5" class="input-field resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing & Stock -->
          <div class="card p-6 space-y-5">
            <h2 class="font-semibold text-gray-900">Prix & Stock</h2>
            <div class="grid sm:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Prix HT * (€)</label>
                <input formControlName="priceHt" type="number" step="0.01" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Taux TVA * (%)</label>
                <select formControlName="vatRate" class="input-field">
                  <option [value]="20">20% (standard)</option>
                  <option [value]="10">10% (intermédiaire)</option>
                  <option [value]="5.5">5,5% (réduit)</option>
                  <option [value]="2.1">2,1% (super réduit)</option>
                  <option [value]="0">0% (exonéré)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Prix TTC (calculé)</label>
                <div class="input-field bg-gray-50 text-gray-600 font-medium">
                  {{ priceTtc() | number:'1.2-2' }} €
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                <input formControlName="stock" type="number" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Stock min. (alerte)</label>
                <input formControlName="minStock" type="number" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Priorité (0-99)</label>
                <input formControlName="priority" type="number" min="0" max="99" class="input-field" />
              </div>
            </div>
          </div>

          <!-- Flags -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-900">Options</h2>
            <div class="space-y-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input formControlName="isActive" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Produit actif</p>
                  <p class="text-xs text-gray-500">Visible sur le site</p>
                </div>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input formControlName="isLargeProduct" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Gros produit (devis)</p>
                  <p class="text-xs text-gray-500">Déclenche un formulaire de contact à la place du panier</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Badges -->
          <div class="card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">Badges personnalisés</h2>
              <button type="button" (click)="addBadge()" class="btn-ghost text-sm">+ Ajouter un badge</button>
            </div>
            <div formArrayName="badges" class="space-y-3">
              @for (badge of badgesArray.controls; track $index) {
                <div [formGroupName]="$index" class="flex gap-3 items-end">
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <input formControlName="label" class="input-field text-sm" placeholder="Nouveau !" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                    <select formControlName="color" class="input-field text-sm">
                      <option value="promo">Promo (rouge)</option>
                      <option value="primary">Bleu</option>
                      <option value="success">Vert</option>
                      <option value="warning">Orange</option>
                      <option value="gray">Gris</option>
                    </select>
                  </div>
                  <button type="button" (click)="removeBadge($index)"
                    class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
              @if (badgesArray.length === 0) {
                <p class="text-sm text-gray-400">Aucun badge. Les badges de stock faible sont générés automatiquement.</p>
              }
            </div>
          </div>

          <!-- Tech specs -->
          <div class="card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">Fiche technique</h2>
              <button type="button" (click)="addSpec()" class="btn-ghost text-sm">+ Ajouter une spec.</button>
            </div>
            <div formArrayName="technicalSpecs" class="space-y-3">
              @for (spec of specsArray.controls; track $index) {
                <div [formGroupName]="$index" class="flex gap-3 items-end">
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Caractéristique</label>
                    <input formControlName="key" class="input-field text-sm" placeholder="Poids" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Valeur</label>
                    <input formControlName="value" class="input-field text-sm" placeholder="2,5 kg" />
                  </div>
                  <button type="button" (click)="removeSpec($index)"
                    class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Image URLs -->
          <div class="card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">Images (URLs)</h2>
              <button type="button" (click)="addImage()" class="btn-ghost text-sm">+ Ajouter une image</button>
            </div>
            <div formArrayName="imageUrls" class="space-y-3">
              @for (ctrl of imagesArray.controls; track $index) {
                <div class="flex gap-3 items-center">
                  <input [formControlName]="$index" class="input-field flex-1 text-sm font-mono" placeholder="https://..." />
                  <button type="button" (click)="removeImage($index)"
                    class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>

          @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }

          <!-- Actions -->
          <div class="flex gap-4">
            <button type="submit" [disabled]="saving() || form.invalid" class="btn-primary px-8">
              @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
              {{ isEdit() ? 'Mettre à jour' : 'Créer le produit' }}
            </button>
            <a routerLink="/admin/produits" class="btn-ghost px-6">Annuler</a>
          </div>
        </form>
      }
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  categories = signal<Category[]>([]);

  form = this.fb.group({
    name: ['', Validators.required],
    reference: ['', Validators.required],
    categoryId: ['', Validators.required],
    shortDescription: ['', Validators.required],
    description: [''],
    priceHt: [0, [Validators.required, Validators.min(0)]],
    vatRate: [20, Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    minStock: [5],
    priority: [0],
    isActive: [true],
    isLargeProduct: [false],
    badges: this.fb.array([]),
    technicalSpecs: this.fb.array([]),
    imageUrls: this.fb.array([]),
  });

  get badgesArray() { return this.form.get('badges') as FormArray; }
  get specsArray() { return this.form.get('technicalSpecs') as FormArray; }
  get imagesArray() { return this.form.get('imageUrls') as FormArray; }

  priceTtc = () => {
    const ht = this.form.value.priceHt ?? 0;
    const vat = this.form.value.vatRate ?? 20;
    return ht * (1 + vat / 100);
  };

  ngOnInit() {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEdit.set(true);
      this.loading.set(true);
      this.productSvc.getById(id).subscribe({
        next: p => {
          this.form.patchValue(p as any);
          (p.badges ?? []).forEach((b: any) => this.badgesArray.push(this.fb.group({ label: b.label, color: b.color })));
          ((p as any).technicalSpecs ?? []).forEach((s: any) => this.specsArray.push(this.fb.group({ key: s.key, value: s.value })));
          ((p as any).imageUrls ?? (p.images ?? []).map((i: any) => i.imageUrl)).forEach((url: string) => this.imagesArray.push(this.fb.control(url)));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  addBadge() { this.badgesArray.push(this.fb.group({ label: ['', Validators.required], color: ['promo'] })); }
  removeBadge(i: number) { this.badgesArray.removeAt(i); }
  addSpec() { this.specsArray.push(this.fb.group({ key: ['', Validators.required], value: ['', Validators.required] })); }
  removeSpec(i: number) { this.specsArray.removeAt(i); }
  addImage() { this.imagesArray.push(this.fb.control('')); }
  removeImage(i: number) { this.imagesArray.removeAt(i); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true); this.error.set('');
    const id = this.route.snapshot.paramMap.get('id');
    const dto = this.form.value as any;
    const obs = this.isEdit() ? this.productSvc.update(id!, dto) : this.productSvc.create(dto);
    obs.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/admin/produits']); },
      error: err => { this.error.set(err?.error?.error || 'Erreur lors de l\'enregistrement.'); this.saving.set(false); }
    });
  }
}
