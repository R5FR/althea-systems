import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page-container py-12">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-navy mb-8">{{ 'legal.mentions_title' | translate }}</h1>

        @for (section of sections; track section.title) {
          <div class="mb-8">
            <h2 class="text-xl font-bold text-navy mb-3">{{ section.title | translate }}</h2>
            <div class="text-gray-600 text-sm leading-relaxed space-y-1">
              @for (line of section.lines; track line) {
                @if (line === '') { <br /> }
                @else { <p>{{ line | translate }}</p> }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MentionsComponent {
  sections = [
    {
      title: 'legal.section_editor',
      lines: [
        'legal.mentions_editor_line1',
        'legal.mentions_editor_line2',
        'legal.mentions_editor_line3',
        'legal.mentions_editor_line4',
        '',
        'legal.mentions_editor_line5',
        'legal.mentions_editor_line6',
        'legal.mentions_editor_line7',
      ]
    },
    {
      title: 'legal.section_director',
      lines: ['legal.mentions_director_line1']
    },
    {
      title: 'legal.section_hosting',
      lines: [
        'legal.mentions_hosting_line1',
        'legal.mentions_hosting_line2',
        'legal.mentions_hosting_line3',
        'legal.mentions_hosting_line4',
      ]
    },
    {
      title: 'legal.section_ip',
      lines: [
        'legal.mentions_ip_line1',
        'legal.mentions_ip_line2',
      ]
    },
    {
      title: 'legal.section_data',
      lines: [
        'legal.mentions_data_line1',
        '',
        'legal.mentions_data_line2',
        '',
        'legal.mentions_data_line3',
      ]
    },
    {
      title: 'legal.section_cookies',
      lines: [
        'legal.mentions_cookies_line1',
        'legal.mentions_cookies_line2',
      ]
    },
    {
      title: 'legal.section_payment',
      lines: [
        'legal.mentions_payment_line1',
      ]
    },
    {
      title: 'legal.section_mediation',
      lines: [
        'legal.mentions_mediation_line1',
      ]
    },
  ];
}
