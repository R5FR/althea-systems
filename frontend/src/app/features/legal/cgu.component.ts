import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cgu',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page-container py-12">
      <div class="max-w-3xl mx-auto prose prose-gray">
        <h1 class="text-3xl font-display font-semibold text-navy mb-8">{{ 'legal.cgu_title' | translate }}</h1>
        <p class="text-sm text-gray-400 mb-8">{{ 'legal.cgu_updated' | translate }}</p>

        @for (section of sections; track section.title) {
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-navy mb-3">{{ section.title | translate }}</h2>
            <div class="text-gray-600 space-y-2 text-sm leading-relaxed">
              @for (p of section.paragraphs; track p) {
                <p>{{ p | translate }}</p>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CguComponent {
  sections = [
    {
      title: 'legal.cgu_article1_title',
      paragraphs: [
        'legal.cgu_article1_p1',
        'legal.cgu_article1_p2',
      ]
    },
    {
      title: 'legal.cgu_article2_title',
      paragraphs: [
        'legal.cgu_article2_p1',
        'legal.cgu_article2_p2',
      ]
    },
    {
      title: 'legal.cgu_article3_title',
      paragraphs: [
        'legal.cgu_article3_p1',
        'legal.cgu_article3_p2',
      ]
    },
    {
      title: 'legal.cgu_article4_title',
      paragraphs: [
        'legal.cgu_article4_p1',
        'legal.cgu_article4_p2',
        'legal.cgu_article4_p3',
      ]
    },
    {
      title: 'legal.cgu_article5_title',
      paragraphs: [
        'legal.cgu_article5_p1',
        'legal.cgu_article5_p2',
      ]
    },
    {
      title: 'legal.cgu_article6_title',
      paragraphs: [
        'legal.cgu_article6_p1',
        'legal.cgu_article6_p2',
      ]
    },
    {
      title: 'legal.cgu_article7_title',
      paragraphs: [
        'legal.cgu_article7_p1',
        'legal.cgu_article7_p2',
      ]
    },
    {
      title: 'legal.cgu_article8_title',
      paragraphs: [
        'legal.cgu_article8_p1',
        'legal.cgu_article8_p2',
      ]
    },
    {
      title: 'legal.cgu_article9_title',
      paragraphs: [
        'legal.cgu_article9_p1',
      ]
    },
  ];
}
