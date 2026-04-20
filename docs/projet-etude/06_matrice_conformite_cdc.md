# Matrice de Conformité — Cahier des Charges vs Implémentation

---

**Équipe :** Tiago Da Costa · Arthur L'Afféter · Tom Leprieur  
**Classe :** CPI-3 26 DEV A — Bachelor 3 CPI Développement  
**Établissement :** SUP DE VINCI  
**Date :** Avril 2026

---

## Légende

| Statut | Signification |
|---|---|
| ✅ **Fait** | Fonctionnalité disponible et exploitable |
| ⚠️ **Partiel** | Présent mais incomplet, ou écart de comportement par rapport au CDC |
| ❌ **À faire** | Non implémenté ou non démontré |

---

## Table des matières

1. [Front office](#1-front-office)
2. [Backoffice](#2-backoffice)
3. [Exigences transverses](#3-exigences-transverses)
4. [Écarts critiques à traiter](#4-écarts-critiques-à-traiter)
5. [Plan d'action de clôture](#5-plan-daction-de-clôture)

---

## 1. Front office

### 1.1 Structure et navigation

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Sitemap complet (accueil, catégories, recherche, produits, contact, chatbot) | ✅ Fait | `frontend/src/app/app.routes.ts` | Routes présentes et accessibles |
| En-tête avec logo, barre de recherche, panier et menu de navigation | ✅ Fait | `shared/layout/header/` | Header responsive desktop + mobile |
| Pied de page desktop (CGU, mentions légales, contact, réseaux sociaux) | ✅ Fait | `shared/layout/footer/` | Liens présents |
| Menu burger adapté (connecté / non connecté) | ✅ Fait | `shared/layout/header/` | Contenu conditionnel selon état auth |
| Pagination sur les listes de produits | ✅ Fait | API `?page=&pageSize=` + UI | Navigation par pages présente |

### 1.2 Page d'accueil

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Carrousel en 3 parties (images + textes + liens) | ✅ Fait | `features/home/`, `GET /api/admin/homepage` | Config exposée en API admin |
| Texte fixe modifiable via backoffice | ✅ Fait | `features/home/`, `PUT /api/admin/homepage` | Champ texte configuré |
| Grille de catégories avec images personnalisables | ✅ Fait | `features/home/`, `GET /api/categories` | Catégories actives avec images |
| Ordre des catégories modifiable depuis le backoffice | ✅ Fait | `PUT /api/admin/categories/:id` | Champ `displayOrder` présent |
| Section "Top Produits du moment" | ✅ Fait | `GET /api/products/top/:limit` | Produits mis en avant configurables |

### 1.3 Catalogue de produits

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Catalogue par catégorie (liste mobile / grille desktop) | ✅ Fait | `features/catalog/`, `GET /api/categories/:slug` | Responsive list/grid selon breakpoint |
| Image principale de la catégorie avec surimpression nom | ✅ Fait | `features/catalog/category-header/` | Overlay visible |
| Description de la catégorie | ✅ Fait | `GET /api/categories/:slug` | Champ description retourné par l'API |
| Nom, prix et indicateur de disponibilité sur chaque produit | ✅ Fait | `features/catalog/product-card/` | Affichage complet |
| Tri par priorité puis par disponibilité (produits épuisés en dernier) | ✅ Fait | Paramètres `sortBy`, API products | Logique de tri côté API |

### 1.4 Fiche produit

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Carrousel d'illustrations produit | ✅ Fait | `features/product/product-images/` | Slider multi-images |
| Nom, description, caractéristiques techniques, prix | ✅ Fait | `GET /api/products/:id` | Tous les champs présents |
| Indicateur de disponibilité (stock, rupture) | ✅ Fait | Champ `stockStatus` retourné par l'API | Affiché avec code couleur |
| CTA "Ajouter au panier" / "En rupture de stock" | ✅ Fait | `features/product/`, `POST /api/cart/:id/items` | Bouton désactivé si stock = 0 |
| Produits similaires (6 produits, même catégorie, disponibles en priorité) | ⚠️ Partiel | `features/product/similar-products/` | À valider fonctionnellement : randomisation et priorité disponibilité |

### 1.5 Recherche avancée

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Recherche par texte du titre (avec priorité : exact > ~1 char > commence par > contient) | ✅ Fait | `GET /api/products?search=`, `ProductsController` | Paramètre `search` côté API |
| Recherche dans la description | ✅ Fait | Paramètre `searchDescription` | Filtre présent |
| Filtre par caractéristiques techniques | ⚠️ Partiel | Modèle produit | Pas de champ structuré distinct dans l'API publique (intégré à la description) |
| Filtre prix minimum / maximum | ✅ Fait | `?minPrice=&maxPrice=` | Paramètres supportés |
| Filtre par catégorie | ✅ Fait | `?categoryId=` | Filtre présent |
| Filtre "uniquement produits disponibles" | ✅ Fait | `?inStockOnly=true` | Paramètre supporté |
| Tri par prix (asc/desc) | ✅ Fait | `?sortBy=price&sortDir=asc` | Tri paramétré côté API |
| Tri par nouveauté (asc/desc) | ✅ Fait | `?sortBy=createdAt&sortDir=desc` | Tri paramétré |
| Tri par disponibilité | ✅ Fait | `?sortBy=stock` | Tri supporté |
| Performance < 100 ms | ❌ À faire | — | Objectif métier non prouvé par bench formel |

### 1.6 Panier

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Accessible connecté et non connecté | ✅ Fait | `CartController` (hors checkout), `features/cart/` | Panier basé sur `cartId` session |
| Ajout / suppression / modification de quantités | ✅ Fait | `POST/PATCH/DELETE /api/cart/:id/items` | CRUD panier complet |
| Total dynamique mis à jour en temps réel | ✅ Fait | Calcul réactif frontend | Mise à jour instantanée |
| Gestion des produits indisponibles dans le panier | ✅ Fait | Vérification stock à l'affichage du panier | Marquage "Indisponible" |
| Rappel connexion pour les invités | ✅ Fait | `features/cart/` | Bannière de rappel visible |

### 1.7 Checkout

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Connexion ou inscription pendant le checkout | ✅ Fait | Guard + flux checkout | Redirection propre vers login |
| Checkout en mode invité | ⚠️ Partiel | `app.routes.ts` (`/checkout` protégé) | Actuellement auth requise — écart à formaliser |
| Adresse de facturation/livraison (nouvelle ou existante) | ✅ Fait | `features/checkout/address-step/` | Sélection + saisie |
| Informations de paiement (Stripe Elements) | ✅ Fait | `features/checkout/payment-step/`, `POST /api/payments/intent` | Stripe Elements PCI-compliant |
| Page de confirmation avec récapitulatif complet | ✅ Fait | `features/checkout/confirmation/` | Route dédiée avec détail |
| E-mail de confirmation envoyé | ✅ Fait | Service e-mail backend déclenché après commande | |
| Génération facture PDF | ✅ Fait | `GET /api/orders/:id/export` | Export disponible |
| Création d'un avoir si facture supprimée | ⚠️ Partiel | Modèle `CreditNote` présent | Workflow complet admin à finaliser |

### 1.8 Compte utilisateur et historique commandes

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Modification profil (nom, e-mail avec validation, mot de passe) | ✅ Fait | `PUT /api/users/me`, `features/account/profile/` | Flux complet présent |
| Carnet d'adresses (ajout, modification, suppression) | ✅ Fait | `GET/POST/PUT/DELETE /api/users/me/addresses` | CRUD complet |
| Méthodes de paiement (ajout, suppression, par défaut) | ✅ Fait | `GET/POST/PATCH/DELETE /api/users/me/payment-methods` | CRUD complet |
| Historique des commandes (liste + détail) | ✅ Fait | `GET /api/orders`, `features/orders/` | Paginé |
| Commandes regroupées par année | ⚠️ Partiel | `features/orders/` | Groupement à valider côté UI |
| Filtres et recherche dans l'historique | ⚠️ Partiel | `features/orders/` | Fonctionnalité à compléter |
| Téléchargement de la facture depuis l'historique | ✅ Fait | `GET /api/orders/:id/export` | Lien de téléchargement présent |

### 1.9 Contact et chatbot

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Formulaire de contact (e-mail, sujet, message) | ✅ Fait | `POST /api/contact`, `features/contact/` | Validation + confirmation visuelle |
| Messages visibles dans le backoffice | ✅ Fait | `GET /api/admin/messages` | Lecture admin opérationnelle |
| Bouton "Contact Me" avec chatbot | ✅ Fait | `features/contact/chatbot/` | Fenêtre de chat présente |
| Chatbot avec réponses instantanées (Ollama/Mistral) | ✅ Fait | `POST /api/contact/chatbot` | IA locale opérationnelle |
| Escalade vers agent humain | ⚠️ Partiel | `features/contact/chatbot/` | Escalade non explicitement implémentée |
| Historique des conversations dans le backoffice | ✅ Fait | `GET /api/admin/messages` | Conversations enregistrées |

---

## 2. Backoffice

### 2.1 Accès et sécurité

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Accès réservé aux administrateurs | ✅ Fait | `[Authorize(Roles="admin")]`, `adminGuard` Angular | Contrôle côté API + route guard |
| Authentification forte (2FA) | ❌ À faire | — | Exigence CDC non implémentée |

### 2.2 Dashboard

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| KPI : CA jour / semaine / mois | ✅ Fait | `GET /api/admin/dashboard` | Indicateurs présents |
| KPI : nombre de commandes du jour | ✅ Fait | `GET /api/admin/dashboard` | |
| Alertes produits en rupture de stock (badge rouge) | ⚠️ Partiel | `GET /api/admin/dashboard` | À vérifier : badge rouge si > 0 |
| Messages de contact non traités (badge) | ✅ Fait | `GET /api/admin/dashboard` | |
| Graphique camembert ventes par catégorie (7 derniers jours) | ⚠️ Partiel | `features/admin/dashboard/` | Périmètre exact à confirmer |
| Histogramme ventes par jour (7 jours + 5 semaines) | ⚠️ Partiel | `features/admin/dashboard/` | Données disponibles, UI à valider |
| Histogramme paniers moyens par catégorie | ⚠️ Partiel | `features/admin/dashboard/` | À confirmer |
| Actions rapides (nouvelle commande, ajouter produit, voir messages) | ⚠️ Partiel | `features/admin/` | UX dépend de l'écran dashboard |

### 2.3 Gestion des produits

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste produits en tableau (image, nom, catégorie, prix HT, TVA, prix TTC, stock, statut, date) | ✅ Fait | `features/admin/products/`, `GET /api/admin/products` | Colonnes présentes |
| Tri par colonne (ascendant / descendant) | ✅ Fait | Paramètres `sortBy`, `sortDir` | |
| Recherche globale dans le tableau | ✅ Fait | Paramètre `search` | |
| Filtre par catégorie (liste déroulante) | ✅ Fait | `?categoryId=` | |
| Filtre par disponibilité / rupture | ✅ Fait | `?inStockOnly=` | |
| Filtre par statut (publié / brouillon) | ✅ Fait | `?status=` | |
| Pagination (10 / 25 / 50 par page) | ✅ Fait | `?page=&pageSize=` | |
| Sélection multiple + actions groupées (supprimer, changer statut, changer catégorie) | ⚠️ Partiel | `features/admin/products/` | Non confirmé pour toutes les actions CDC |
| Export CSV / Excel | ✅ Fait | `GET /api/admin/products/export/csv` | Endpoint présent |
| Upload images (drag & drop, miniature, ordre, image principale) | ✅ Fait | `POST /api/admin/products/:id/images` | Cloudinary intégré |
| Réorganisation images par glisser-déposer | ⚠️ Partiel | `features/admin/products/` | À vérifier implémentation |
| Lien de redirection sur slide carrousel | ✅ Fait | `PUT /api/admin/homepage` | Champ `redirectUrl` présent |
| URL personnalisée (slug SEO) | ✅ Fait | Champ `slug` sur Product | |

### 2.4 Gestion des catégories

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste catégories (image, nom, description, nb produits, ordre, statut) | ✅ Fait | `GET /api/admin/categories` | Tableau complet |
| Ajout catégorie (formulaire : nom, description, image, statut, slug) | ✅ Fait | `POST /api/admin/categories` | |
| Modification et suppression | ✅ Fait | `PUT/DELETE /api/admin/categories/:id` | |
| Réorganisation par drag & drop | ⚠️ Partiel | `features/admin/categories/` | Nécessite vérification implémentation détaillée |
| Activer / désactiver les catégories sélectionnées | ✅ Fait | `PATCH /api/admin/categories/:id` | |
| Détail catégorie avec vue sur les produits associés | ✅ Fait | `GET /api/admin/categories/:id` | |

### 2.5 Gestion des commandes

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste commandes (n°, date, client, montant TTC, statut, mode paiement) | ✅ Fait | `GET /api/admin/orders` | |
| Statuts avec code couleur (en attente, en cours, terminée, annulée) | ⚠️ Partiel | `features/admin/orders/` | Codes couleur à vérifier |
| Filtres (statut, mode paiement, statut paiement) | ⚠️ Partiel | `GET /api/admin/orders` | Couverture filtres à vérifier |
| Détail commande (n°, date, statut modifiable, historique changements, infos paiement) | ✅ Fait | `GET /api/admin/orders/:id` | |
| Historique des changements de statut (date + utilisateur) | ✅ Fait | `PATCH /api/admin/orders/:id` + log | Tracé dans le modèle |

### 2.6 Gestion des factures et avoirs

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste factures (n°, date, client, n° commande, montant, statut) | ⚠️ Partiel | Modèle `Invoice` + endpoints admin | Workflow complet à finaliser |
| Téléchargement PDF facture | ✅ Fait | `GET /api/orders/:id/export` | |
| Renvoi facture par e-mail | ⚠️ Partiel | Service e-mail | Action admin à exposer explicitement |
| Modification de la facture (formulaire) | ⚠️ Partiel | `PUT /api/admin/invoices/:id` | À confirmer |
| Suppression facture → création avoir automatique | ⚠️ Partiel | Modèle `CreditNote` présent | Déclenchement automatique à valider |
| Liste avoirs (n°, facture liée, date, client, montant, motif) | ⚠️ Partiel | — | À implémenter côté UI admin |
| Téléchargement PDF avoir | ⚠️ Partiel | — | À implémenter |

### 2.7 Gestion des utilisateurs

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste utilisateurs (nom, e-mail, date inscription, statut, nb commandes, CA total, dernière connexion) | ⚠️ Partiel | `GET /api/admin/users` | Certaines colonnes à vérifier |
| Activer / désactiver le compte | ✅ Fait | `PATCH /api/admin/users/:id` | |
| Envoyer un e-mail à l'utilisateur | ⚠️ Partiel | — | Action à implémenter |
| Réinitialiser le mot de passe | ⚠️ Partiel | `POST /api/admin/users/:id/reset-password` | À confirmer |
| Supprimer le compte (avec avertissement RGPD) | ⚠️ Partiel | `DELETE /api/admin/users/:id` | Avertissement RGPD à vérifier |
| Liste des adresses de facturation de l'utilisateur | ⚠️ Partiel | — | Vue admin à implémenter |

### 2.8 Messages et support

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Liste messages contact non traités | ✅ Fait | `GET /api/admin/messages` | |
| Marquage message comme traité | ✅ Fait | `PATCH /api/admin/messages/:id` | |
| Historique conversations chatbot | ✅ Fait | `GET /api/admin/messages` | |

### 2.9 CMS page d'accueil

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| Configuration carrousel (3 slides max : images, textes, liens, ordre) | ✅ Fait | `GET/PUT /api/admin/homepage` | Carrousel + sections configurables |
| Texte fixe sous le carrousel (avec formatage) | ✅ Fait | Champ `bannerText` dans homepage config | |
| Sélection et ordre des catégories en page d'accueil | ✅ Fait | `displayOrder` sur catégories | |
| Sélection et ordre des top produits | ✅ Fait | `PUT /api/admin/homepage` | |

---

## 3. Exigences transverses

| Exigence CDC | Statut | Référence technique | Commentaire |
|---|---|---|---|
| i18n multilingue (FR/EN) | ✅ Fait | `assets/i18n/fr.json`, `assets/i18n/en.json`, `ngx-translate` | |
| Support langues RTL (arabe, hébreu) | ⚠️ Partiel | `TranslateController` supporte `ar` | Adaptation UI RTL complète non démontrée |
| Sélecteur de langue dans le menu | ✅ Fait | `shared/layout/header/` | |
| Accessibilité WCAG 2.1 | ⚠️ Partiel | — | Audit formel à planifier et documenter |
| Sécurité OWASP (XSS / CSRF / SQLi) | ⚠️ Partiel | Validation FluentValidation + JWT + EF paramétré | CSRF / audit sécurité à formaliser |
| Chiffrement données sensibles paiement | ✅ Fait | Stripe tokenisation + stockage `last4` uniquement | PCI-DSS conforme |
| Session / auth sécurisée (JWT) | ✅ Fait | JWT Bearer + guards + `[Authorize]` | |
| HTTPS en production | ⚠️ Partiel | `UseHttpsRedirection` en place | Certificat / reverse proxy à confirmer en infra cible |
| 1 framework frontend + 1 framework backend | ✅ Fait | Angular + ASP.NET Core | Conforme contrainte CDC |
| BDD relationnelle + stockage images objet | ✅ Fait | SQL Server + Cloudinary | Conforme contrainte CDC |
| Git + code propre + documentation technique | ✅ Fait | Repo structuré + dossier docs | À compléter avec export PDF final |
| Tests automatisés (unitaires, intégration) | ⚠️ Partiel | xUnit backend + Vitest frontend | Couverture à augmenter |

---

## 4. Écarts critiques à traiter

| # | Écart | Impact | Priorité |
|---|---|---|---|
| 1 | Performance recherche < 100 ms non prouvée par bench formel | Moyen | Avant soutenance |
| 2 | Checkout invité non implémenté (auth actuellement requise) | Élevé | Avant soutenance (décision + argument) |
| 3 | Workflow factures / avoirs complet côté backoffice admin | Moyen | Avant rendu final |
| 4 | Audit accessibilité WCAG 2.1 avec preuves | Moyen | Avant rendu final |
| 5 | Audit sécurité formalisé (OWASP ZAP) | Élevé | Avant rendu final |
| 6 | Hygiène secrets (`.env` ne doit pas contenir de clés réelles versionnées) | Élevé | Immédiat |
| 7 | 2FA administrateur | Faible (MVP) | Post-livraison (évolution v2) |

---

## 5. Plan d'action de clôture

| Lot | Contenu | Échéance |
|---|---|---|
| **Lot A — Obligatoire avant soutenance** | Bench performance recherche, statuer sur checkout invité avec argumentaire, preuves tests fonctionnels, preuves sécurité de base | J-7 soutenance |
| **Lot B — Fortement recommandé avant rendu final** | Workflow factures/avoirs complet, audit accessibilité axe + Lighthouse, campagne OWASP ZAP, hygiène secrets | Rendu final |
| **Lot C — Évolutions v2 post-livraison** | 2FA admin, recommandations intelligentes, analytics enrichi, observabilité (OpenTelemetry) | Roadmap |
