import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cgu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container py-12">
      <div class="max-w-3xl mx-auto prose prose-gray">
        <h1 class="text-3xl font-bold text-navy mb-8">Conditions Générales d'Utilisation</h1>
        <p class="text-sm text-gray-400 mb-8">Dernière mise à jour : 1er janvier 2025</p>

        @for (section of sections; track section.title) {
          <div class="mb-8">
            <h2 class="text-xl font-bold text-navy mb-3">{{ section.title }}</h2>
            <div class="text-gray-600 space-y-2 text-sm leading-relaxed">
              @for (p of section.paragraphs; track p) {
                <p>{{ p }}</p>
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
      title: 'Article 1 – Objet',
      paragraphs: [
        'Les présentes Conditions Générales d\'Utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles Althea Systems met à disposition de ses utilisateurs le site althea-systems.fr.',
        'Toute utilisation du site implique l\'acceptation sans réserve des présentes CGU.',
      ]
    },
    {
      title: 'Article 2 – Accès au site',
      paragraphs: [
        'Le site est accessible 24h/24 et 7j/7, sauf en cas de force majeure ou de maintenance nécessaire au bon fonctionnement du service.',
        'Althea Systems se réserve le droit de suspendre, modifier ou interrompre l\'accès au site à tout moment sans préavis.',
      ]
    },
    {
      title: 'Article 3 – Création de compte',
      paragraphs: [
        'La création d\'un compte est nécessaire pour passer commande. L\'utilisateur s\'engage à fournir des informations exactes et à les maintenir à jour.',
        'L\'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation frauduleuse du compte devra être signalée immédiatement.',
      ]
    },
    {
      title: 'Article 4 – Commandes et paiement',
      paragraphs: [
        'Les commandes sont passées en ligne via le site. Les prix affichés sont en euros, toutes taxes comprises (TTC).',
        'Le paiement s\'effectue par carte bancaire via la plateforme sécurisée Stripe (PCI-DSS niveau 1). Althea Systems ne stocke jamais les numéros de carte complets.',
        'Pour les équipements de grande valeur (gros produits), la commande fait l\'objet d\'un devis personnalisé avant validation.',
      ]
    },
    {
      title: 'Article 5 – Livraison',
      paragraphs: [
        'Les délais et frais de livraison sont indiqués lors du passage de commande. Althea Systems s\'engage à expédier les commandes dans les délais annoncés.',
        'En cas de retard, l\'utilisateur sera informé par email.',
      ]
    },
    {
      title: 'Article 6 – Droit de rétractation',
      paragraphs: [
        'Conformément à l\'article L. 221-18 du Code de la consommation, l\'utilisateur dispose d\'un délai de 14 jours à compter de la réception pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.',
        'Pour exercer ce droit, l\'utilisateur doit contacter Althea Systems par email ou courrier avant l\'expiration du délai.',
      ]
    },
    {
      title: 'Article 7 – Propriété intellectuelle',
      paragraphs: [
        'L\'ensemble des éléments constituant le site (textes, images, graphismes, logos) est protégé par le droit de la propriété intellectuelle et est la propriété exclusive d\'Althea Systems.',
        'Toute reproduction, représentation ou utilisation, même partielle, sans autorisation expresse est strictement interdite.',
      ]
    },
    {
      title: 'Article 8 – Données personnelles',
      paragraphs: [
        'Althea Systems collecte et traite les données personnelles de ses utilisateurs conformément au RGPD. Pour en savoir plus, consultez notre Politique de confidentialité.',
        'L\'utilisateur dispose d\'un droit d\'accès, de rectification, de suppression et d\'opposition à tout moment en contactant contact@althea-systems.fr.',
      ]
    },
    {
      title: 'Article 9 – Droit applicable',
      paragraphs: [
        'Les présentes CGU sont soumises au droit français. En cas de litige, les parties s\'efforceront de trouver une solution amiable avant tout recours judiciaire.',
      ]
    },
  ];
}
