import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{{ 'admin.categories_title' | translate }}</h1>
        <button (click)="startCreate()" class="btn-primary text-sm">{{ 'admin.categories_new' | translate }}</button>
      </div>

      @if (showForm()) {
        <div class="card p-6 max-w-lg">
          <h2 class="font-semibold text-gray-900 mb-4">{{ editId() ? ('admin.categories_edit' | translate) : ('admin.categories_create' | translate) }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.cat_name' | translate }}</label>
              <input formControlName="name" class="input-field" [placeholder]="'admin.cat_name_placeholder' | translate" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.cat_description' | translate }}</label>
              <textarea formControlName="description" rows="2" class="input-field resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.cat_image' | translate }}</label>
              <input formControlName="imageUrl" class="input-field font-mono text-sm" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.cat_display_order' | translate }}</label>
              <input formControlName="displayOrder" type="number" min="0" class="input-field w-32" />
            </div>
            @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }
            <div class="flex gap-3">
              <button type="submit" [disabled]="saving() || form.invalid" class="btn-primary">
                @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                {{ 'common.save' | translate }}
              </button>
              <button type="button" (click)="cancelForm()" class="btn-ghost">{{ 'common.cancel' | translate }}</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="space-y-3">@for (_ of [1,2,3]; track $index) { <div class="card p-5 skeleton h-20"></div> }</div>
      } @else if (categories().length === 0) {
        <div class="card p-12 text-center text-gray-500">{{ 'admin.categories_none' | translate }}</div>
      } @else {
        <div class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_category' | translate }}</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_slug' | translate }}</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">{{ 'admin.col_order' | translate }}</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">{{ 'admin.col_products' | translate }}</th>
                <th class="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (cat of categories(); track cat.id) {
                <tr class="hover:bg-gray-50 group">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      @if (cat.imageUrl) {
                        <img [src]="cat.imageUrl" [alt]="cat.name" class="w-10 h-10 rounded-lg object-cover" />
                      } @else {
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                          </svg>
                        </div>
                      }
                      <div>
                        <p class="font-medium text-gray-900">{{ cat.name }}</p>
                        @if (cat.description) { <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ cat.description }}</p> }
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
                  <td class="px-5 py-4 text-center text-gray-600">{{ cat.displayOrder ?? 0 }}</td>
                  <td class="px-5 py-4 text-center">
                    <span class="badge badge-gray text-xs">{{ cat.productCount ?? 0 }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button (click)="startEdit(cat)"
                        class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button (click)="deleteCategory(cat.id)"
                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categorySvc = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editId = signal<string | null>(null);
  error = signal('');

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    imageUrl: [''],
    displayOrder: [0],
  });

  ngOnInit() {
    this.categorySvc.getAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  startCreate() { this.editId.set(null); this.form.reset({ displayOrder: 0 }); this.showForm.set(true); }

  startEdit(cat: Category) {
    this.editId.set(cat.id);
    this.form.patchValue(cat as any);
    this.showForm.set(true);
  }

  cancelForm() { this.showForm.set(false); this.editId.set(null); this.form.reset(); this.error.set(''); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true); this.error.set('');
    const dto = this.form.value as any;
    const obs = this.editId()
      ? this.categorySvc.update(this.editId()!, dto)
      : this.categorySvc.create(dto);
    obs.subscribe({
      next: cat => {
        if (this.editId()) {
          this.categories.update(list => list.map(c => c.id === cat.id ? cat : c));
        } else {
          this.categories.update(list => [...list, cat]);
        }
        this.saving.set(false);
        this.cancelForm();
      },
      error: err => { this.error.set(err?.error?.error || 'Erreur'); this.saving.set(false); }
    });
  }

  deleteCategory(id: string) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.categorySvc.delete(id).subscribe({
      next: () => this.categories.update(list => list.filter(c => c.id !== id))
    });
  }
}
