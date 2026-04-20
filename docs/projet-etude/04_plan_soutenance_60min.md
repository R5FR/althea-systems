# Plan de Soutenance & Démonstration — 60 minutes

---

**Équipe :** Tiago Da Costa · Arthur L'Afféter · Tom Leprieur  
**Classe :** CPI-3 26 DEV A — Bachelor 3 CPI Développement  
**Établissement :** SUP DE VINCI  
**Bloc certifiant :** BC2 — Coordonner une équipe projet  
**Date :** Avril 2026

---

## Table des matières

1. [Objectif de la soutenance](#1-objectif-de-la-soutenance)
2. [Agenda détaillé (60 min)](#2-agenda-détaillé-60-min)
3. [Trame des slides](#3-trame-des-slides)
4. [Storyline de démonstration (15 min)](#4-storyline-de-démonstration-15-min)
5. [Scripts de prise de parole](#5-scripts-de-prise-de-parole)
6. [Questions jury probables et réponses](#6-questions-jury-probables-et-réponses)
7. [Checklist pré-soutenance (J-1)](#7-checklist-pré-soutenance-j-1)
8. [Posture et bonnes pratiques](#8-posture-et-bonnes-pratiques)

---

## 1. Objectif de la soutenance

Présenter une réponse complète et professionnelle articulée autour des **3 axes attendus** par le jury :

| Axe | Description |
|---|---|
| **1. Analyse du besoin** | Compréhension du cahier des charges, priorisation, persona, parcours utilisateurs |
| **2. Réponse à l'appel d'offre** | Fonctionnalités couvertes, choix technologiques justifiés, architecture proposée |
| **3. Solution technique & démonstration** | Démo live du parcours client et admin, qualité, sécurité, limites assumées |

> La soutenance est une évaluation **de groupe** (BC2.1 — 80 % du bloc). La répartition équitable de la parole est un critère évalué.

---

## 2. Agenda détaillé (60 min)

| Temps | Section | Intervenant(s) | Contenu clé |
|---|---|---|---|
| **0–5 min** | Introduction et contexte client | Tom Leprieur | Problématique Althea Systems, enjeux, équipe, plan de soutenance |
| **5–12 min** | Analyse du besoin et priorisation | Tom Leprieur | CDC reformulé, personas, parcours critiques, MoSCoW |
| **12–20 min** | Réponse fonctionnelle | Tiago Da Costa | Front office + backoffice couvert, écarts assumés, CDC vs implémentation |
| **20–35 min** | Architecture technique | Arthur L'Afféter | Stack technique, Clean Architecture, modèle de données, API, sécurité |
| **35–50 min** | Démonstration live guidée | Équipe (Tiago + Arthur + Tom) | Parcours client puis parcours admin |
| **50–58 min** | Résultats, limites et roadmap | Tom Leprieur | KPI, écarts connus, plan d'évolution |
| **58–60 min** | Conclusion et transition Q&R | Tom Leprieur | Synthèse et ouverture au jury |

---

## 3. Trame des slides

| N° | Titre | Intervenant | Points clés |
|---|---|---|---|
| 1 | Page de titre | — | Projet Althea Systems, équipe, date, titre CPI |
| 2 | Contexte et problématique | Tom | Althea Systems en quelques chiffres, pourquoi une plateforme e-commerce B2B |
| 3 | Analyse du besoin | Tom | Synthèse CDC, 4 défis principaux, priorisation MoSCoW |
| 4 | Personas et parcours cibles | Tom | Acheteur hospitalier, praticien, ingénieur biomédical — leurs besoins |
| 5 | Périmètre fonctionnel — Front office | Tiago | Tableau des fonctionnalités (Fait / Partiel / À faire) |
| 6 | Périmètre fonctionnel — Backoffice | Tiago | Modules admin couverts, points forts et écarts |
| 7 | Architecture globale | Arthur | Schéma haut niveau (Angular → API → SQL Server + services externes) |
| 8 | Stack technique et justifications | Arthur | Tableau choix techno → critère de choix (performance, sécurité, maintenabilité) |
| 9 | Modèle de données | Arthur | Diagramme ERD simplifié, points critiques (snapshot OrderItem, PCI-DSS) |
| 10 | Sécurité | Arthur | JWT, rôles, OWASP, Stripe tokenisation, secrets |
| 11 | Pipeline qualité | Tom | Tests unitaires + intégration + performance + accessibilité |
| 12 | Plan de démo | Équipe | Ce qui va être montré (storyline) |
| 13 | Résultats et KPI | Tom | État d'avancement, métriques, couverture de tests |
| 14 | Limites et roadmap | Tom | Écarts assumés, plan d'évolution v2 |
| 15 | Conclusion | Tom | Synthèse en 3 points, ouverture questions |

> **Conseil :** préférer des schémas visuels aux listes à puces. Chaque slide = 1 idée principale.

---

## 4. Storyline de démonstration (15 min)

### 4.1 Parcours client (8 min)

| Étape | Action | Ce qu'on montre |
|---|---|---|
| 1 | Page d'accueil | Carrousel configurable, grille catégories, top produits |
| 2 | Recherche avancée | Saisie texte + filtres (catégorie, prix, disponibilité) + tri |
| 3 | Fiche produit | Images, description, caractéristiques techniques, disponibilité, CTA |
| 4 | Ajout au panier | Total dynamique, produit indisponible bloqué |
| 5 | Checkout | Adresse + paiement Stripe (mode test) + confirmation |
| 6 | Espace compte | Historique commandes + export facture PDF |
| 7 | Contact / Chatbot | Question au chatbot + formulaire de contact |

### 4.2 Parcours admin (7 min)

| Étape | Action | Ce qu'on montre |
|---|---|---|
| 1 | Login admin | Contrôle d'accès rôle admin |
| 2 | Dashboard | KPI (CA, commandes, alertes stock, messages non traités) + graphiques |
| 3 | CRUD produit | Ajout produit + upload image + vérification en front office |
| 4 | Gestion commandes | Changement de statut + historique tracé |
| 5 | Gestion messages | Lecture message support + marquage traité |
| 6 | Config homepage | Modification ordre carrousel + résultat immédiat en front |

> **Plan de secours :** avoir une vidéo enregistrée de la démo complète en cas de problème réseau ou de bug inattendu.

---

## 5. Scripts de prise de parole

### 5.1 Ouverture (Tom — 30 s)

> *"Notre projet répond à un défi concret : digitaliser la commercialisation de matériel médical de pointe pour Althea Systems, avec une plateforme e-commerce B2B sécurisée, fiable et exploitable par leurs équipes sans compétences techniques. Nous allons vous présenter comment nous avons répondu à ce cahier des charges exigeant, de l'analyse du besoin jusqu'à la démonstration live."*

### 5.2 Transition vers l'architecture (Arthur)

> *"Après avoir défini et priorisé les besoins, nous avons opté pour une architecture Clean Architecture côté backend, avec une API REST centralisée qui sert à la fois le front office client et le backoffice administrateur. Ce choix nous permet de livrer rapidement tout en gardant une base maintenable et testable sur le long terme."*

### 5.3 Lancement de la démonstration (Tiago)

> *"Nous allons maintenant vous montrer la solution en conditions réelles. On commence par le parcours complet d'un acheteur hospitalier, de la recherche d'un produit jusqu'à l'obtention de sa facture, puis on bascule sur le backoffice pour montrer comment l'équipe Althea gère l'opérationnel au quotidien."*

### 5.4 Transition vers les limites (Tom)

> *"Nous avons couvert les fonctionnalités prioritaires du cahier des charges. Il reste des points que nous assumons ouvertement, comme [les écarts X et Y], avec des plans d'action concrets pour la v2. Ce niveau de transparence fait partie de notre démarche qualité."*

### 5.5 Conclusion (Tom)

> *"En résumé : une architecture solide et modulaire, un front office et un backoffice opérationnels sur les flux critiques, une sécurité pensée dès la conception. Nous sommes prêts à répondre à vos questions."*

---

## 6. Questions jury probables et réponses

| Question | Réponse synthétique |
|---|---|
| **Pourquoi ce choix de stack ?** | Angular + .NET pour la productivité d'équipe, la maturité des écosystèmes et la séparation claire des responsabilités. SQL Server pour l'intégrité transactionnelle, Stripe et Cloudinary pour externaliser les parties les plus sensibles. |
| **Comment garantissez-vous la sécurité ?** | JWT + rôles, validation côté serveur (FluentValidation), Stripe tokenise les cartes (jamais de PAN stocké), middleware d'erreurs centralisé, pratiques OWASP respectées, secrets en variables d'environnement. |
| **Comment gérez-vous l'évolutivité ?** | Séparation en couches (Clean Architecture), services interchangeables via interfaces, API centralisée, conteneurisation Docker, documentation DCT complète pour reprise par une équipe tierce. |
| **Pourquoi Ollama/Mistral plutôt qu'une API commerciale ?** | Maîtrise totale des données (aucune donnée médicale envoyée à un tiers), pas de coût récurrent, déploiement local dans le conteneur Docker. |
| **Qu'est-ce qui manque encore ?** | Le durcissement sécurité final (2FA admin), la campagne de performance complète sur la recherche (<100 ms CDC), l'audit accessibilité WCAG formel, et le checkout en mode invité complet. Ces points sont documentés et priorisés pour la v2. |
| **Comment avez-vous géré les conflits dans l'équipe ?** | *(Réponse personnelle — voir analyse dynamique individuelle)* |
| **Qu'est-ce que MoSCoW apporte à votre gestion de projet ?** | Il nous permet de défendre nos choix de priorisation au client : Must have = flux critique livré en priorité, Could have = enrichissements post-livraison. Cela évite la dérive de périmètre. |

---

## 7. Checklist pré-soutenance (J-1)

### Environnement

- [ ] Docker Compose lancé et tous les conteneurs `healthy`
- [ ] Base de données seedée avec les données de démo
- [ ] Compte utilisateur de démo prêt (email + mot de passe)
- [ ] Compte admin de démo prêt (email + mot de passe)
- [ ] Clé Stripe mode **test** configurée (pas la clé prod)
- [ ] Cloudinary opérationnel (test upload d'une image)
- [ ] Ollama/Mistral démarré et répondant (`ollama run mistral`)

### Contenu

- [ ] Slides exportées en PDF ET en format source (PowerPoint/Canva)
- [ ] Diagrammes lisibles à l'écran de projection
- [ ] Vidéo backup de la démo enregistrée et accessible hors réseau
- [ ] Collection Postman de secours prête (pour démo API si front défaillant)
- [ ] Rapport de tests disponible en annexe

### Organisation équipe

- [ ] Rôles de prise de parole répétés (qui parle sur quelle slide)
- [ ] Transitions entre intervenants fluides (répétées)
- [ ] Chronomètre disponible pendant la soutenance
- [ ] Questions jury préparées et réponses synthétiques mémorisées

---

## 8. Posture et bonnes pratiques

| À faire | À éviter |
|---|---|
| Réponses directes et factuelles, appuyées par des preuves | Lire les slides mot pour mot |
| Montrer les arbitrages et les compromis assumés | Nier les limites ou les cacher |
| Si une limite existe, annoncer le plan de mitigation | Improviser sur une question technique sans base factuelle |
| Regarder le jury, pas l'écran | Monopoliser la parole (1 seul intervenant) |
| Adapter le niveau de détail à la question posée | Sur-promettre sur la roadmap |
| Rester calme si un bug survient en démo — switcher sur la vidéo | Paniquer ou accuser l'environnement |
