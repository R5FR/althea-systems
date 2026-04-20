# Document de Cadrage — Projet Étude Althea Systems

---

**Équipe :** Tiago Da Costa · Arthur L'Afféter · Tom Leprieur  
**Classe :** CPI-3 26 DEV A — Bachelor 3 CPI Développement  
**Établissement :** SUP DE VINCI  
**Bloc certifiant :** BC1 — Piloter un projet informatique  
**Date :** Avril 2026

---

## Table des matières

1. [Contexte et finalité](#1-contexte-et-finalité)
2. [Objectifs du projet](#2-objectifs-du-projet)
3. [Périmètre fonctionnel](#3-périmètre-fonctionnel)
4. [Exigences non fonctionnelles](#4-exigences-non-fonctionnelles)
5. [Contraintes techniques](#5-contraintes-techniques)
6. [Parties prenantes](#6-parties-prenantes)
7. [Organisation de l'équipe et gouvernance](#7-organisation-de-léquipe-et-gouvernance)
8. [Méthodologie](#8-méthodologie)
9. [Backlog macro priorisé](#9-backlog-macro-priorisé)
10. [Planification prévisionnelle](#10-planification-prévisionnelle)
11. [Livrables projet](#11-livrables-projet)
12. [Risques et plans de mitigation](#12-risques-et-plans-de-mitigation)
13. [KPI de suivi](#13-kpi-de-suivi)
14. [Critères de succès](#14-critères-de-succès)
15. [Décisions de cadrage](#15-décisions-de-cadrage)

---

## 1. Contexte et finalité

**Althea Systems** est une entreprise spécialisée dans la vente de matériel médical de pointe pour cabinets et établissements de santé. Ses produits étaient jusqu'ici commercialisés via un réseau de distribution traditionnel et des équipes commerciales terrain.

Dans le cadre de sa transformation numérique, Althea Systems souhaite une **refonte complète** de sa présence en ligne avec une plateforme e-commerce moderne, _mobile-first_, destinée à une clientèle B2B internationale (acheteurs hospitaliers, cliniciens, ingénieurs biomédicaux).

La solution comprend :
- un **front office** client (catalogue, recherche, panier, checkout, compte)
- un **backoffice** administrateur (produits, catégories, commandes, utilisateurs, messages)
- une architecture **scalable**, maintenable et sécurisée
- une expérience d'achat fiable avec paiement sécurisé (Stripe) et facturation

> Ce document répond aux attendus des étapes **rendez-vous de cadrage** (BC1.1) et **document de cadrage certifiant** (BC1.2).

---

## 2. Objectifs du projet

### 2.1 Objectifs business

| Objectif | Indicateur de réussite |
|---|---|
| Digitaliser la vente de produits Althea Systems | Commandes passées via la plateforme |
| Permettre une prise de commande autonome et internationale | Support multilingue, i18n RTL |
| Donner aux équipes internes une autonomie complète | Backoffice opérationnel sans développeur |
| Accroître la qualité de service | Suivi commandes, factures, support chatbot |

### 2.2 Objectifs utilisateurs

- Trouver rapidement un produit pertinent (recherche < 100 ms, facettes avancées).
- Commander en quelques étapes claires et sécurisées.
- Gérer son profil, ses adresses, ses moyens de paiement et son historique de commandes.
- Contacter facilement le support (formulaire + chatbot IA avec escalade humaine).

### 2.3 Objectifs techniques

- Architecture propre et modulaire (Clean Architecture).
- API sécurisée par JWT et contrôle d'accès basé sur les rôles.
- Données relationnelles SQL + stockage images externalisé (Cloudinary).
- Déploiement conteneurisé (Docker Compose).
- Base documentaire technique exploitable par une équipe tierce.

---

## 3. Périmètre fonctionnel

### 3.1 Front office (MVP)

| Module | Fonctionnalités clés |
|---|---|
| **Accueil** | Carrousel configurable (3 slides), texte fixe, grille catégories, top produits |
| **Catalogue** | Liste/grille responsive, tri par priorité/disponibilité, pagination |
| **Fiche produit** | Carrousel d'images, description, caractéristiques techniques, prix, disponibilité, produits similaires, CTA |
| **Recherche avancée** | Texte (titre/description), catégorie, prix min/max, disponibilité, tri prix/nouveauté/dispo |
| **Panier** | Ajout, suppression, modification de quantités, total dynamique, accès connecté et invité |
| **Checkout** | Connexion/inscription, adresse facturation/livraison, paiement Stripe, confirmation |
| **Authentification** | Inscription, confirmation e-mail, connexion, reset mot de passe, "Se souvenir de moi" |
| **Espace compte** | Profil, adresses, moyens de paiement, historique commandes, export facture PDF |
| **Contact** | Formulaire (e-mail, sujet, message) + chatbot IA (réponses instantanées, escalade humaine) |

### 3.2 Backoffice (MVP)

| Module | Fonctionnalités clés |
|---|---|
| **Dashboard** | KPI (CA jour/semaine/mois, commandes, alertes stock, messages non traités), graphiques ventes |
| **Produits** | CRUD complet, upload images drag & drop, table tri/filtre/recherche/pagination, actions groupées, export CSV |
| **Catégories** | CRUD, activation/désactivation, réorganisation drag & drop, vue produits associés |
| **Commandes** | Liste filtrée, changement de statut (code couleur), détail complet, historique des changements |
| **Factures & avoirs** | Génération PDF, envoi e-mail, modification, suppression (créé un avoir automatiquement) |
| **Utilisateurs** | Liste, activation/désactivation, envoi e-mail, reset mot de passe, suppression RGPD |
| **Messages contact** | Liste, lecture, marquage traité, conversations chatbot |
| **CMS Homepage** | Configuration carrousel (ordre, images, textes, liens), texte fixe, catégories/produits mis en avant |

### 3.3 Hors périmètre initial (phase suivante)

- 2FA administrateur complet.
- Moteur de recommandation personnalisé avancé.
- Monitoring sécurité centralisé (SIEM).
- Place de marché multi-vendeur.

---

## 4. Exigences non fonctionnelles

| Exigence | Cible |
|---|---|
| **Performance** | Recherche perçue < 100 ms ; p95 API catalogue ≤ 300 ms |
| **Accessibilité** | Conformité WCAG 2.1 — navigation clavier, contrastes, labels ARIA |
| **Internationalisation** | Site multilingue incluant langues RTL (arabe, hébreu) via ngx-translate |
| **Sécurité** | Protection SQL injection, XSS, CSRF ; chiffrement transport (HTTPS) ; sessions JWT robustes |
| **Maintenabilité** | Code lisible, modulaire, testé, versionné (Git) |
| **Scalabilité** | Extension future des modules sans refonte globale de l'architecture |
| **Conformité RGPD** | Suppression de compte avec avertissement, gestion des données personnelles |
| **Paiement (PCI-DSS)** | Aucun stockage du PAN complet — tokenisation Stripe |

---

## 5. Contraintes techniques

Conformément au cahier des charges :

| Contrainte | Choix retenu | Justification |
|---|---|---|
| 1 framework frontend | **Angular 21** | Productivité, typage fort, écosystème mature, modularité |
| 1 framework backend | **ASP.NET Core (.NET 8)** | Performance, Clean Architecture, sécurité intégrée |
| 1 BDD relationnelle | **SQL Server** | Intégrité données, support EF Core, requêtes complexes |
| 1 stockage images NoSQL/objet | **Cloudinary** | CDN intégré, transformations à la volée, API simple |
| Paiement sécurisé | **Stripe** | Conformité PCI-DSS, Stripe Elements, webhooks |
| Internationalisation | **ngx-translate + LibreTranslate** | i18n complet côté client + traduction dynamique côté serveur |
| Conteneurisation | **Docker Compose** | Environnements reproductibles, déploiement simplifié |
| Chatbot IA | **Ollama + Mistral** | LLM local, maîtrise des données, pas de dépendance cloud |

---

## 6. Parties prenantes

| Rôle | Acteur | Responsabilités |
|---|---|---|
| **Client métier** | Althea Systems | Expression du besoin, validation fonctionnelle |
| **Utilisateurs finaux** | Acheteurs B2B, praticiens, ingénieurs biomédicaux | Usage quotidien de la plateforme |
| **Équipe projet** | Tiago, Arthur, Tom | Conception, développement, tests, documentation |
| **Jury pédagogique** | SUP DE VINCI | Évaluation certifiante (BC1, BC2, BC3) |

---

## 7. Organisation de l'équipe et gouvernance

### 7.1 Répartition des rôles

| Membre | Rôle principal | Responsabilités clés |
|---|---|---|
| **Tom Leprieur** | Référent frontend | UX/UI, Angular, intégration front-back, parcours utilisateurs |
| **Arthur L'Afféter** | Référent backend | API REST, modèle de données, logique métier, sécurité |
| **Tiago Da Costa** | Chef de projet & coordination | Pilotage, qualité globale, documentation, suivi planning, cadrage |

> La répartition peut être ajustée en fonction des contraintes de sprint.

### 7.2 Rituels d'équipe

- **Daily court** (15 min) — synchronisation quotidienne
- **Revue hebdomadaire** — suivi avancement et déblocage
- **Revue de sprint + rétrospective** — fin de chaque sprint (1–2 semaines)
- **Point client** aux jalons définis

### 7.3 Outils de pilotage

| Outil | Usage |
|---|---|
| Git + Pull Requests | Versionnement, revue de code |
| Board Kanban (GitHub Projects) | Suivi des tâches et du backlog |
| Markdown + export PDF | Documentation centralisée |
| Swagger / Postman | Contrats et tests API |
| Docker Compose | Environnements locaux unifiés |

---

## 8. Méthodologie

**Approche agile itérative** avec livraison incrémentale :

- Backlog priorisé selon la valeur métier (MoSCoW).
- Sprints courts de 1 à 2 semaines.
- Livraison incrémentale : frontend, API, backoffice.
- _Definition of Done_ explicite pour chaque story.

### Définition of Done

Une _user story_ est considérée **terminée** si :

- [x] Le code compile sans erreur et les tests passent.
- [x] Le scénario métier est validé fonctionnellement.
- [x] La revue de code a été effectuée (PR mergée).
- [x] La documentation est mise à jour.
- [x] Aucun bug bloquant n'est ouvert.

---

## 9. Backlog macro priorisé

### Epic E1 — Identité et accès

| ID | User Story | Priorité |
|---|---|---|
| US-01 | En tant que visiteur, je peux créer un compte (formulaire + confirmation e-mail). | Critique |
| US-02 | En tant qu'utilisateur, je peux me connecter / déconnecter. | Critique |
| US-03 | En tant qu'utilisateur, je peux récupérer mon mot de passe oublié. | Haute |
| US-04 | En tant qu'admin, je contrôle l'accès backoffice via rôle dédié. | Critique |

### Epic E2 — Catalogue et recherche

| ID | User Story | Priorité |
|---|---|---|
| US-05 | En tant que visiteur, je consulte les catégories et leurs produits. | Critique |
| US-06 | En tant que visiteur, je consulte la fiche complète d'un produit. | Critique |
| US-07 | En tant que visiteur, je recherche et filtre les produits par texte, catégorie, prix et disponibilité. | Haute |
| US-08 | En tant que visiteur, je vois les top produits mis en avant sur la page d'accueil. | Moyenne |

### Epic E3 — Panier et commande

| ID | User Story | Priorité |
|---|---|---|
| US-09 | En tant qu'utilisateur, j'ajoute, modifie ou supprime des articles dans mon panier. | Critique |
| US-10 | En tant qu'utilisateur connecté, je finalise une commande via un checkout sécurisé. | Critique |
| US-11 | En tant qu'utilisateur connecté, je consulte mon historique de commandes. | Haute |
| US-12 | En tant qu'utilisateur connecté, j'exporte une facture au format PDF. | Haute |

### Epic E4 — Backoffice

| ID | User Story | Priorité |
|---|---|---|
| US-13 | En tant qu'admin, je gère les produits et catégories (CRUD complet). | Critique |
| US-14 | En tant qu'admin, je gère les commandes et leur statut. | Critique |
| US-15 | En tant qu'admin, je gère les utilisateurs (activation, suppression RGPD). | Haute |
| US-16 | En tant qu'admin, je gère les messages et conversations du support. | Moyenne |
| US-17 | En tant qu'admin, je configure la page d'accueil (carrousel, catégories, produits vedettes). | Moyenne |

### Epic E5 — Support et internationalisation

| ID | User Story | Priorité |
|---|---|---|
| US-18 | En tant qu'utilisateur, j'envoie un message via le formulaire de contact. | Haute |
| US-19 | En tant qu'utilisateur, j'interagis avec le chatbot pour des réponses instantanées. | Moyenne |
| US-20 | En tant qu'utilisateur, je change la langue du site (FR/EN/AR/HE). | Moyenne |

---

## 10. Planification prévisionnelle

Plan type sur **10 semaines** (à adapter selon le calendrier campus) :

| Sprint | Semaines | Objectifs |
|---|---|---|
| **S0** | S1 | Cadrage, architecture cible, setup repo et environnements Docker |
| **S1** | S2 | Auth + modèle de données + API catégories/produits |
| **S2** | S3 | Pages accueil / catalogue / fiche produit + recherche v1 |
| **S3** | S4 | Panier + checkout v1 + intégration Stripe |
| **S4** | S5 | Espace compte (profil, adresses, moyens de paiement) |
| **S5** | S6 | Historique commandes + export facture PDF |
| **S6** | S7 | Backoffice : dashboard + CRUD produits/catégories |
| **S7** | S8 | Backoffice : commandes/utilisateurs/messages + config homepage |
| **S8** | S9 | Qualité : tests, sécurité, performances, a11y, i18n |
| **S9** | S10 | Gel, soutenance, dossier final et annexes |

---

## 11. Livrables projet

| Code | Livrable | Bloc | Échéance |
|---|---|---|---|
| L1 | Questions de cadrage + résumé architecture | BC1.1 | RV cadrage |
| L2 | Document de cadrage (présent document) | BC1.2 | RV cadrage + 3 mois |
| L3 | Support de soutenance + démo | BC2.1 | Doc cadrage + 1 mois |
| L4 | Dossier technique final (DCT) | BC3 | Soutenance + 2 semaines |
| L5 | Code source versionné + doc API + plan de tests | BC3 | Soutenance + 2 semaines |
| L6 | Analyse individuelle dynamique de projet (2–4 pages) | BC2.2 | L4 + 2 semaines |

---

## 12. Risques et plans de mitigation

| Risque | Impact | Probabilité | Plan de mitigation |
|---|---|---|---|
| Dérive du périmètre | Élevé | Moyen | Priorisation MoSCoW, gel de scope à partir de S8 |
| Dette technique | Moyen | Moyen | Revue de code systématique, refactoring continu |
| Incohérence front/back | Élevé | Moyen | Contrat API Swagger + mocks + tests d'intégration |
| Retards équipe | Élevé | Moyen | Suivi quotidien, découpage fin des tâches, points de déblocage rapides |
| Défaut de sécurité | Élevé | Faible | Checklist OWASP, validation serveur, secrets hors repo |
| Démonstration défaillante | Moyen | Moyen | Script de démo, environnement de secours, vidéo backup |
| Non-conformité RGPD | Élevé | Faible | Suppression compte, avertissements, pas de PAN stocké |

---

## 13. KPI de suivi

- Taux de _stories_ terminées par sprint (cible ≥ 80 %).
- Nombre de bugs critiques ouverts (cible = 0 en fin de sprint).
- Temps moyen de résolution de bug (cible < 48 h).
- Couverture de tests unitaires backend (cible ≥ 60 %).
- Temps de réponse API sur endpoints critiques (p95 ≤ 300 ms).
- Taux de succès du scénario checkout de bout en bout (cible = 100 %).

---

## 14. Critères de succès

Le projet est considéré **conforme** si :

- [x] Le parcours client principal fonctionne de bout en bout (recherche → produit → panier → checkout).
- [x] Le backoffice permet la gestion opérationnelle courante (produits, commandes, utilisateurs).
- [x] Les exigences de sécurité et de qualité minimales sont respectées.
- [x] La documentation permet la reprise par une équipe tierce.
- [x] La soutenance prouve la maîtrise des choix techniques et des arbitrages effectués.

---

## 15. Décisions de cadrage

1. **Priorité au parcours de conversion** : recherche → produit → panier → checkout.
2. **Stabilité backend avant enrichissement UI** : schéma de données et API solidifiés en priorité.
3. **Backoffice orienté usages opérationnels** avant enrichissements visuels secondaires.
4. **Documentation et traçabilité intégrées dès le début** — pas en fin de projet.
5. **Checkout invité** : le cahier des charges le prévoit, l'implémentation actuelle impose l'auth — décision à formaliser et argumenter.

