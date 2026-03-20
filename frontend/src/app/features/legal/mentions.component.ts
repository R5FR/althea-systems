import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container py-12">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

        @for (section of sections; track section.title) {
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-3">{{ section.title }}</h2>
            <div class="text-gray-600 text-sm leading-relaxed space-y-1">
              @for (line of section.lines; track line) {
                @if (line === '') { <br /> }
                @else { <p>{{ line }}</p> }
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
      title: 'Éditeur du site',
      lines: [
        'Althea Systems SAS',
        'Capital social : 50 000 €',
        'RCS Paris : 123 456 789',
        'N° TVA intracommunautaire : FR 12 123456789',
        '',
        'Siège social : 12 rue de la Paix, 75001 Paris, France',
        'Téléphone : +33 1 23 45 67 89',
        'Email : contact@althea-systems.fr',
      ]
    },
    {
      title: 'Directeur de la publication',
      lines: ['Le directeur de la publication est le représentant légal d\'Althea Systems SAS.']
    },
    {
      title: 'Hébergement',
      lines: [
        'Le site est hébergé par :',
        'Vercel Inc.',
        '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
        'Site : https://vercel.com',
      ]
    },
    {
      title: 'Propriété intellectuelle',
      lines: [
        'L\'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, icônes) sont protégés par le droit d\'auteur et appartiennent à Althea Systems SAS ou à ses partenaires.',
        'Toute reproduction, même partielle, est interdite sans autorisation préalable écrite.',
      ]
    },
    {
      title: 'Protection des données personnelles',
      lines: [
        'Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données.',
        '',
        'Pour exercer vos droits, contactez-nous à : rgpd@althea-systems.fr',
        '',
        'Délégué à la Protection des Données (DPO) : dpo@althea-systems.fr',
      ]
    },
    {
      title: 'Cookies',
      lines: [
        'Le site utilise des cookies strictement nécessaires à son fonctionnement (session, panier, authentification). Aucun cookie publicitaire n\'est déposé sans consentement.',
        'Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités pourraient être altérées.',
      ]
    },
    {
      title: 'Paiement sécurisé',
      lines: [
        'Les paiements en ligne sont traités par Stripe, Inc. — certifié PCI-DSS niveau 1. Althea Systems ne stocke jamais vos données de carte bancaire complètes.',
      ]
    },
    {
      title: 'Médiation',
      lines: [
        'En cas de litige, vous pouvez recourir gratuitement au médiateur de la consommation : CM2C, 14 rue Saint Jean, 75017 Paris — www.cm2c.net',
      ]
    },
  ];
}
