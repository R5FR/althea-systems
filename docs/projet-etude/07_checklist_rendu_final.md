# Checklist Rendu Final — Projet Étude CPI

---

**Équipe :** Tiago Da Costa · Arthur L'Afféter · Tom Leprieur  
**Classe :** CPI-3 26 DEV A — Bachelor 3 CPI Développement  
**Établissement :** SUP DE VINCI  
**Date :** Avril 2026

---

## Table des matières

1. [Avant la soutenance](#1-avant-la-soutenance)
2. [Pendant la soutenance](#2-pendant-la-soutenance)
3. [Rendu final technique (BC3)](#3-rendu-final-technique-bc3)
4. [Analyse dynamique individuelle (BC2.2)](#4-analyse-dynamique-individuelle-bc22)
5. [Qualité fonctionnelle finale](#5-qualité-fonctionnelle-finale)
6. [Pièces à joindre au dossier](#6-pièces-à-joindre-au-dossier)
7. [Hygiène et sécurité du repo](#7-hygiène-et-sécurité-du-repo)

---

## 1. Avant la soutenance

### Documents et supports

- [ ] Document de cadrage finalisé et exporté en PDF
- [ ] DCT finalisé et exporté en PDF
- [ ] Plan de tests finalisé et exporté en PDF
- [ ] Matrice de conformité CDC mise à jour et exportée en PDF
- [ ] Slides de soutenance finalisées (PowerPoint / Canva / Figma)
- [ ] Slides exportées en PDF en local (pas de dépendance cloud le jour J)
- [ ] Script de démo répété sur environnement stable (≥ 2 répétitions)

### Environnement de démonstration

- [ ] Docker Compose lancé — tous les conteneurs sont `healthy`
- [ ] Base de données seedée avec les données de démo (produits, catégories, commandes, utilisateurs)
- [ ] Compte utilisateur de démo créé et vérifié (e-mail confirmé)
- [ ] Compte admin de démo créé et vérifié
- [ ] Clé Stripe en **mode test** configurée (pas la clé production)
- [ ] Cloudinary opérationnel (test upload d'une image)
- [ ] Ollama + Mistral démarré (`ollama run mistral` répond)
- [ ] LibreTranslate démarré et accessible
- [ ] Vidéo backup de la démo enregistrée en local

### Preuves et annexes

- [ ] Rapport de tests unitaires backend généré
- [ ] Rapport de tests frontend généré
- [ ] Collection Postman vérifiée + résultats Newman disponibles
- [ ] Rapport Lighthouse accessibilité sur au moins 3 pages critiques
- [ ] Rapport de scan OWASP ZAP disponible
- [ ] Rapport de performance k6 disponible (ou en cours)
- [ ] Captures d'écran front office (home, catalogue, fiche produit, checkout, compte)
- [ ] Captures d'écran backoffice (dashboard, produits, commandes, utilisateurs)
- [ ] Capture Swagger UI

---

## 2. Pendant la soutenance

### Attendus minimaux (BC2.1)

- [ ] Analyse du besoin présentée clairement (CDC reformulé, priorisation, personas)
- [ ] Réponse à l'appel d'offre argumentée (fonctionnalités couvertes, écarts assumés)
- [ ] Démonstration technique fonctionnelle (parcours client + parcours admin)
- [ ] Répartition équitable de la parole entre les 3 membres
- [ ] Justification des choix techniques (stack, architecture, sécurité)
- [ ] Posture professionnelle maintenue

### Questions jury préparées

- [ ] Justification du choix Angular + .NET
- [ ] Explication de la Clean Architecture
- [ ] Gestion de la sécurité (JWT, Stripe, OWASP)
- [ ] Explication des écarts avec le CDC (checkout invité, 2FA, performance)
- [ ] Roadmap et évolutions v2 préparée
- [ ] Réponses sur la dynamique d'équipe (pour chaque membre)

---

## 3. Rendu final technique (BC3)

### Code source

- [ ] Repository Git structuré avec un historique de commits propre et descriptif
- [ ] README de démarrage rapide à jour (dépendances, variables d'environnement, commandes)
- [ ] Aucun secret réel dans les fichiers versionnés (`.env`, `appsettings.json`)
- [ ] Branche principale (`main` ou `master`) stable et déployable
- [ ] Code compilant sans erreur (`dotnet build` + `ng build`)
- [ ] Tous les tests unitaires passant (`dotnet test` + `npm test`)

### Documentation technique (DCT)

- [ ] Architecture du système documentée (schéma + technologies)
- [ ] Modèle de données documenté (ERD + description des entités clés)
- [ ] Toutes les routes API documentées (méthode, route, auth, description)
- [ ] Procédure d'installation et de déploiement détaillée
- [ ] Stratégie de sécurité documentée
- [ ] Plan de maintenance et d'évolutivité documenté

### Tests

- [ ] Rapport tests unitaires backend (couverture ≥ 60 % cible)
- [ ] Rapport tests frontend
- [ ] Collection Postman + rapport Newman
- [ ] Rapport performance k6 (ou JMeter)
- [ ] Rapport accessibilité (Lighthouse + axe)
- [ ] Rapport sécurité (OWASP ZAP)
- [ ] Journal des anomalies (GitHub Issues ou équivalent)

---

## 4. Analyse dynamique individuelle (BC2.2)

### Pour chaque membre (Tiago, Arthur, Tom)

- [ ] Document individuel rédigé (2 à 4 pages)
- [ ] Réflexion sur le rôle concret dans l'équipe
- [ ] Défis rencontrés documentés (situations réelles, pas de généralités)
- [ ] Forces et limites identifiées avec plans d'amélioration
- [ ] Compétences développées (techniques, organisationnelles, relationnelles)
- [ ] Ce qui serait fait différemment sur un prochain projet
- [ ] Conclusion personnelle
- [ ] Document exporté en PDF individuel

---

## 5. Qualité fonctionnelle finale

### Parcours client

- [ ] Inscription + confirmation e-mail fonctionnelles
- [ ] Connexion, déconnexion, reset mot de passe fonctionnels
- [ ] Recherche avec filtres (texte, catégorie, prix, disponibilité) fonctionnelle
- [ ] Fiche produit complète affichée correctement
- [ ] Ajout au panier, modification de quantité, suppression fonctionnels
- [ ] Checkout complet (adresse + paiement Stripe) → confirmation fonctionnelle
- [ ] Historique des commandes accessible et correct
- [ ] Export facture PDF fonctionnel
- [ ] Formulaire de contact fonctionnel
- [ ] Chatbot Ollama répondant correctement
- [ ] Changement de langue fonctionnel (FR ↔ EN)

### Parcours admin

- [ ] Login admin (contrôle d'accès rôle vérifié)
- [ ] Dashboard KPI affiché correctement
- [ ] Ajout d'un produit avec image → visible en front office
- [ ] Modification et suppression de produit fonctionnelles
- [ ] Changement de statut de commande avec historique tracé
- [ ] Gestion des messages contact (lecture + marquage traité)
- [ ] Configuration homepage (carrousel) → changement visible en front
- [ ] Export CSV produits fonctionnel
- [ ] Gestion des utilisateurs (désactivation fonctionnelle)

---

## 6. Pièces à joindre au dossier

| Pièce | Format | Responsable | Statut |
|---|---|---|---|
| Lien repository Git | URL | Tom | - |
| PDF — Document de cadrage | PDF | Tom | - |
| PDF — DCT | PDF | Arthur | - |
| PDF — Plan de tests | PDF | Arthur | - |
| PDF — Matrice de conformité CDC | PDF | Tom | - |
| PDF — Analyse dynamique (Tiago) | PDF | Tiago | - |
| PDF — Analyse dynamique (Arthur) | PDF | Arthur | - |
| PDF — Analyse dynamique (Tom) | PDF | Tom | - |
| Slides de soutenance | PDF + source | Équipe | - |
| Captures front office | PNG/JPEG | Tiago | - |
| Captures backoffice | PNG/JPEG | Tiago | - |
| Capture Swagger UI | PNG/JPEG | Arthur | - |
| Capture schéma ERD / DB | PNG/JPEG | Arthur | - |
| Capture board sprint / backlog | PNG/JPEG | Tom | - |
| Rapports de tests (unitaires, intégration, perf, a11y, sécurité) | HTML/PDF | Équipe | - |

---

## 7. Hygiène et sécurité du repo

- [ ] Aucune clé API réelle dans les fichiers versionnés (`STRIPE_SECRET`, `CLOUDINARY_API_SECRET`, etc.)
- [ ] Fichier `.env` présent dans `.gitignore` (vérifier `git log -- .env`)
- [ ] Fichier `.env.example` fourni avec les variables nécessaires mais sans valeurs réelles
- [ ] `appsettings.json` ne contient pas de secrets réels (JWT Key, chaîne de connexion avec mot de passe)
- [ ] `CREDENTIALS.md` retiré du repo ou placé hors du versionnement
- [ ] Aucun `console.log` sensible laissé en production

> **Important :** vérifier avec `git log --all -- .env` et `git grep -i "secret\|password\|apikey"` qu'aucune donnée sensible n'a été commitée dans l'historique.
