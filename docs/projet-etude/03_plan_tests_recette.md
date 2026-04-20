# Plan de Tests et Recette — Althea Systems

---

**Équipe :** Tiago Da Costa · Arthur L'Afféter · Tom Leprieur  
**Classe :** CPI-3 26 DEV A — Bachelor 3 CPI Développement  
**Établissement :** SUP DE VINCI  
**Bloc certifiant :** BC3 — Superviser la mise en œuvre d'un projet informatique  
**Date :** Avril 2026

---

## Table des matières

1. [Objectif](#1-objectif)
2. [Portée](#2-portée)
3. [Stratégie de test](#3-stratégie-de-test)
4. [Environnements et jeux de données](#4-environnements-et-jeux-de-données)
5. [Tests fonctionnels](#5-tests-fonctionnels)
6. [Tests de sécurité](#6-tests-de-sécurité)
7. [Tests de performance](#7-tests-de-performance)
8. [Tests d'accessibilité](#8-tests-daccessibilité)
9. [Recette métier (UAT)](#9-recette-métier-uat)
10. [Critères Go / No-Go](#10-critères-go--no-go)
11. [Plan d'exécution](#11-plan-dexécution)
12. [Livrables de preuve](#12-livrables-de-preuve)

---

## 1. Objectif

Définir une stratégie de vérification complète pour garantir :

- la **conformité fonctionnelle** au cahier des charges Althea Systems
- la **robustesse technique** de la solution sur les flux critiques
- le **niveau de sécurité** attendu (OWASP, PCI-DSS, RGPD)
- la **qualité de service** (performance, accessibilité, internationalisation)

---

## 2. Portée

| Périmètre | Technologie |
|---|---|
| Front office Angular | SPA responsive (mobile + desktop) |
| Backoffice Angular | Interface administrateur |
| API REST ASP.NET Core | Ensemble des endpoints |
| Flux paiement | Stripe (mode test) |
| Stockage images | Cloudinary |
| Chatbot IA | Ollama + Mistral |
| Traduction | LibreTranslate |

---

## 3. Stratégie de test

### 3.1 Pyramide de tests

```
        ┌──────────────────┐
        │    E2E Tests     │  ← Parcours complets utilisateur/admin
        ├──────────────────┤
        │ Tests intégration │  ← API + SQL Server, flux auth/commande
        ├──────────────────┤
        │  Tests unitaires  │  ← Services, validators, composants (majoritaires)
        └──────────────────┘
        
        + Tests non fonctionnels (sécurité, performance, accessibilité)
```

### 3.2 Outils par niveau

| Niveau | Outil | Scope |
|---|---|---|
| Unitaires backend | **xUnit + Moq + FluentAssertions + coverlet** | Services métier, validateurs, entités, repositories |
| Unitaires frontend | **Vitest + Angular TestBed** | Services Angular, composants critiques |
| Intégration API | **Postman / Newman** | Tous les endpoints (auth, catalogue, panier, commande, admin) |
| E2E | *(à définir — Playwright recommandé)* | Parcours utilisateur et admin de bout en bout |
| Performance | **k6** *(ou JMeter)* | Endpoints recherche, catalogue, checkout concurrent |
| Sécurité | **OWASP ZAP** | Scan automatisé des vulnérabilités |
| Accessibilité | **Lighthouse + axe DevTools** | Pages critiques WCAG 2.1 |

---

## 4. Environnements et jeux de données

### 4.1 Environnements cibles

| Environnement | Description | Usage |
|---|---|---|
| **Local (Docker Compose)** | Stack complète en local | Développement, tests unitaires et intégration |
| **Préprod** | Environnement miroir de la prod | Recette fonctionnelle (UAT), tests de performance |

### 4.2 Jeux de données

| Dataset | Contenu | Usage |
|---|---|---|
| **Minimal** | 3 catégories, 10 produits, 2 utilisateurs | Tests fonctionnels ciblés |
| **Nominal** | 10 catégories, 500 produits, 50 utilisateurs | Tests de performance, pagination, recherche |
| **Cas limites** | Stock = 0, prix min/max, utilisateurs inactifs, paniers vides | Tests de robustesse et cas d'erreur |

---

## 5. Tests fonctionnels

### 5.1 Matrice principale (priorité haute)

| ID | Scénario | Entrée | Résultat attendu | Priorité |
|---|---|---|---|---|
| F-01 | Inscription utilisateur | E-mail valide + mot de passe fort | Compte créé + e-mail de confirmation envoyé | Critique |
| F-02 | Confirmation e-mail | Lien unique dans l'e-mail | Compte activé + connexion automatique | Critique |
| F-03 | Connexion utilisateur | E-mail + mot de passe valides | JWT émis + accès compte | Critique |
| F-04 | Reset mot de passe | E-mail existant | Lien reset envoyé, nouveau mot de passe accepté | Haute |
| F-05 | Recherche catalogue | Texte + filtres prix/catégorie/disponibilité | Résultats filtrés, pagination correcte, tri respecté | Critique |
| F-06 | Panier dynamique | Ajout / suppression / modification quantité | Total mis à jour en temps réel | Critique |
| F-07 | Panier invité | Utilisateur non connecté ajoute des produits | Panier accessible sans auth, rappel connexion visible | Haute |
| F-08 | Checkout complet | Panier + adresse + paiement Stripe (test) | Commande créée + facture générée + e-mail de confirmation | Critique |
| F-09 | Produit indisponible | Produit avec stock = 0 dans le panier | Message "Indisponible" + CTA désactivé + blocage checkout | Haute |
| F-10 | Historique commandes | Utilisateur connecté | Liste paginée par année + détail complet accessible | Haute |
| F-11 | Export facture | Commande existante et payée | Fichier PDF téléchargé avec les bonnes informations | Haute |
| F-12 | Contact formulaire | E-mail + sujet + message | Message enregistré et visible dans le backoffice admin | Moyenne |
| F-13 | Chatbot utilisateur | Question courante | Réponse instantanée + historique conservé | Moyenne |
| F-14 | CRUD produit admin | Créer / modifier / supprimer | Modifications visibles immédiatement en front office | Critique |
| F-15 | Gestion catégories admin | Créer / activer / désactiver | Impact catalogue front conforme | Haute |
| F-16 | Gestion commandes admin | Changement de statut | Statut mis à jour + historique des changements tracé | Haute |
| F-17 | Config homepage admin | Modifier carrousel / ordre catégories | Changements visibles immédiatement en page d'accueil | Moyenne |
| F-18 | Suppression facture admin | Action admin | Avoir créé automatiquement + PDF disponible | Haute |
| F-19 | Gestion utilisateurs admin | Désactiver / reset mot de passe | Accès bloqué pour l'utilisateur désactivé | Haute |

### 5.2 Tests de navigation et UX

| ID | Scénario | Résultat attendu |
|---|---|---|
| N-01 | Redirection vers login sur page privée | URL cible mémorisée + redirection après connexion |
| N-02 | Navigation mobile (burger menu) | Menu complet accessible selon état de connexion |
| N-03 | Pagination catalogue | Navigation fluide, page précédente/suivante fonctionnelle |
| N-04 | Changement de langue | Interface bascule correctement (FR ↔ EN ↔ AR) |
| N-05 | Affichage RTL (arabe) | Mise en page miroir correcte, textes de droite à gauche |

---

## 6. Tests de sécurité

### 6.1 Contrôle d'accès

| ID | Test | Résultat attendu |
|---|---|---|
| S-01 | Endpoint protégé sans JWT | HTTP 401 Unauthorized |
| S-02 | Endpoint admin avec rôle `user` | HTTP 403 Forbidden |
| S-03 | JWT expiré utilisé | Refus d'accès + invite à se reconnecter |
| S-04 | Token reset mot de passe invalide ou expiré | HTTP 400/404, pas de reset effectué |
| S-05 | Accès aux ressources d'un autre utilisateur | HTTP 403, isolation utilisateur respectée |

### 6.2 Validation des entrées

| ID | Test | Résultat attendu |
|---|---|---|
| S-06 | Injection SQL dans champ recherche | Pas d'exécution malveillante, erreur gérée proprement |
| S-07 | Payload XSS dans message contact | Pas d'exécution de script, texte affiché en littéral |
| S-08 | Mot de passe faible à l'inscription | Refus + message d'erreur explicite sur les règles |
| S-09 | Données carte complète envoyées via API | Le PAN complet ne doit jamais être reçu par notre API |

### 6.3 Scan automatisé

| ID | Outil | Cible |
|---|---|---|
| S-10 | **OWASP ZAP** (scan passif) | Toutes les routes front office et API |
| S-11 | **OWASP ZAP** (scan actif) | Endpoints API (hors prod) |

---

## 7. Tests de performance

### 7.1 Objectifs chiffrés

| Métrique | Cible |
|---|---|
| Recherche produits (p95) | **< 100 ms** (objectif métier CDC) |
| Catalogue paginé (p95) | **≤ 300 ms** |
| Checkout concurrent (p95) | **≤ 500 ms** sous 50 utilisateurs virtuels |
| Taux d'erreur sous charge nominale | **< 1 %** |
| Largest Contentful Paint (mobile home) | **< 2,5 s** |

### 7.2 Scénarios de charge (k6)

| ID | Scénario | Charge | Durée |
|---|---|---|---|
| P-01 | Recherche produits (dataset 500 SKUs) | 50 VU | 5 min |
| P-02 | Chargement catalogue paginé | 30 VU | 5 min |
| P-03 | Checkout concurrent | 20 VU | 3 min |
| P-04 | Spike test (montée en charge soudaine) | 0 → 100 VU en 30 s | 2 min |

### 7.3 Performance frontend

- **LCP** acceptable sur home et catalogue (Lighthouse > 90 en performance).
- Pas de régression majeure sur mobile (score Lighthouse ≥ 75).
- Bundle size JS maîtrisé (lazy loading des modules).

---

## 8. Tests d'accessibilité

Cible : **WCAG 2.1 niveau AA**

| ID | Test | Outil | Pages ciblées |
|---|---|---|---|
| A-01 | Navigation clavier complète | Manuel | Home, catalogue, checkout, compte |
| A-02 | Labels explicites sur tous les formulaires | axe DevTools | Inscription, connexion, checkout, contact |
| A-03 | Contrastes conformes (ratio ≥ 4,5:1) | Lighthouse | Toutes pages |
| A-04 | Structure sémantique (titres h1–h6, listes) | axe DevTools | Toutes pages |
| A-05 | Attributs ARIA corrects sur composants interactifs | axe DevTools | Menus, modales, alertes |
| A-06 | Test lecteur d'écran (NVDA / VoiceOver) | Manuel | Home, fiche produit, checkout |
| A-07 | Textes alternatifs sur toutes les images | axe DevTools | Catalogue, fiche produit, home |

---

## 9. Recette métier (UAT)

### 9.1 Parcours front office

| ID | Scénario | Validé par |
|---|---|---|
| R-FO-01 | Un client recherche un produit, le commande et télécharge sa facture | Équipe projet |
| R-FO-02 | Un client met à jour son adresse et son moyen de paiement puis repasse une commande | Équipe projet |
| R-FO-03 | Un client non connecté tente le checkout → redirigé vers login → commande finalisée | Équipe projet |
| R-FO-04 | Un client utilise le chatbot, obtient une réponse, puis soumet un formulaire de contact | Équipe projet |
| R-FO-05 | Un client change la langue en arabe et navigue sur le catalogue | Équipe projet |

### 9.2 Parcours backoffice

| ID | Scénario | Validé par |
|---|---|---|
| R-BO-01 | Admin ajoute un produit avec images et vérifie l'affichage en front office | Équipe projet |
| R-BO-02 | Admin fait évoluer une commande de "En attente" à "Terminée" avec historique tracé | Équipe projet |
| R-BO-03 | Admin lit un message support, le marque traité et répond par e-mail | Équipe projet |
| R-BO-04 | Admin supprime une facture → avoir créé automatiquement → PDF téléchargeable | Équipe projet |
| R-BO-05 | Admin reconfigure le carrousel homepage → changements visibles immédiatement | Équipe projet |

---

## 10. Critères Go / No-Go

### Go (livraison autorisée) si :

- [x] 100 % des tests fonctionnels **critiques** (F-01 à F-09, F-14) passent.
- [x] Aucun bug bloquant ouvert.
- [x] Aucun incident de sécurité critique (S-01 à S-09).
- [x] La démonstration complète est exécutable sans contournement.
- [x] Le score Lighthouse accessibilité ≥ 80 sur les pages critiques.

### No-Go (livraison bloquée) si :

- [ ] Échec du checkout ou de l'authentification sur le parcours principal.
- [ ] Fuite de données sensibles (PAN, mot de passe en clair, JWT exposé).
- [ ] Endpoint admin accessible sans rôle `admin`.
- [ ] Performance recherche > 500 ms en conditions nominales.

---

## 11. Plan d'exécution

| Phase | Quand | Qui | Quoi |
|---|---|---|---|
| **T1** | À chaque PR | Automatisé (CI) | Tests unitaires backend + frontend |
| **T2** | Quotidien | Automatisé | Tests intégration API (Newman) |
| **T3** | Fin de sprint | Équipe | Recette fonctionnelle complète du sprint |
| **T4** | Sprint S8 | Équipe | Campagne sécurité (OWASP ZAP) + accessibilité (axe) |
| **T5** | Sprint S9 | Équipe | Campagne performance (k6) + UAT complète |
| **T6** | Pré-soutenance | Équipe | Vérification finale Go/No-Go |

---

## 12. Livrables de preuve

| Livrable | Format | Responsable |
|---|---|---|
| Rapport tests unitaires backend | HTML / XML (coverlet) | Arthur L'Afféter |
| Rapport tests unitaires frontend | HTML (Vitest) | Tiago Da Costa |
| Collection Postman + résultats Newman | JSON + rapport HTML | Arthur L'Afféter |
| Rapport performance k6 | HTML / JSON | Tom Leprieur |
| Rapport accessibilité Lighthouse + axe | HTML | Tiago Da Costa |
| Rapport sécurité OWASP ZAP | HTML | Équipe |
| Journal des anomalies | Tableau (GitHub Issues) | Tom Leprieur |
