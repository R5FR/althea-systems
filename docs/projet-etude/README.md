# Livrables Projet Étude 2025-2026 — Althea Systems

---

## Identité de l'équipe

| Champ | Valeur |
|---|---|
| **Membres** | Tiago Da Costa · Arthur L'Afféter · Tom Leprieur |
| **Classe** | CPI-3 26 DEV A |
| **Parcours** | Bachelor 3 CPI — Développement |
| **Établissement** | SUP DE VINCI |
| **Titre visé** | RNCP34581 — Coordinateur de Projets Informatiques |

---

## Contexte

Ce dossier regroupe l'ensemble des livrables pédagogiques et techniques produits dans le cadre du **projet d'étude fil rouge 2025-2026**.  
Le projet consiste à concevoir et développer une plateforme e-commerce B2B complète pour **Althea Systems**, spécialiste de la vente de matériel médical de pointe.

Les documents sont alignés avec :
- le cahier des charges fonctionnel (`Cahier-des-charges-Projet-Etude-2025-2026.pdf`)
- le cadre pédagogique certifiant (`Cadre-Pédagogique-Projet-Etude-CPI-2025-DEV-1.pdf`)
- l'état actuel du codebase `althea-systems/` (backend ASP.NET Core + frontend Angular)

---

## Table des matières des livrables

| N° | Fichier | Bloc certifiant | Description |
|---|---|---|---|
| 1 | [`01_document_de_cadrage.md`](01_document_de_cadrage.md) | BC1 | Analyse du besoin, périmètre, backlog, planification, risques, gouvernance |
| 2 | [`02_dct_document_conception_technique.md`](02_dct_document_conception_technique.md) | BC3 | Architecture, modèle de données, API, sécurité, déploiement |
| 3 | [`03_plan_tests_recette.md`](03_plan_tests_recette.md) | BC3 | Stratégie de tests (unitaires, intégration, e2e, sécurité, perf, a11y) |
| 4 | [`04_plan_soutenance_60min.md`](04_plan_soutenance_60min.md) | BC2 | Trame de soutenance 60 minutes, storyline démo, questions jury |
| 5 | [`05_analyse_dynamique_modele_individuel.md`](05_analyse_dynamique_modele_individuel.md) | BC2.2 | Modèle d'analyse réflexive individuelle (2–4 pages par étudiant) |
| 6 | [`06_matrice_conformite_cdc.md`](06_matrice_conformite_cdc.md) | BC1/BC3 | Matrice de conformité CDC → implémentation (Fait / Partiel / À faire) |
| 7 | [`07_checklist_rendu_final.md`](07_checklist_rendu_final.md) | Tous | Checklist complète avant rendu final |

---

## Blocs de compétences et livrables associés

```
BC1 – Piloter un projet informatique
  ├── 1.1 Rendez-vous de cadrage (individuel)    → préparation dans 01_document_de_cadrage.md
  └── 1.2 Document de cadrage (groupe)           → 01_document_de_cadrage.md

BC2 – Coordonner une équipe projet
  ├── 2.1 Soutenance & démonstration (groupe)    → 04_plan_soutenance_60min.md
  └── 2.2 Analyse de la dynamique (individuel)   → 05_analyse_dynamique_modele_individuel.md

BC3 – Superviser la mise en œuvre
  └── 3.1 Livrables finaux techniques (individuel)
        ├── 02_dct_document_conception_technique.md
        ├── 03_plan_tests_recette.md
        └── code source Git + exports PDF
```

---

## Instructions de rendu

### Export PDF

Les versions PDF uniformisées sont générées dans `docs/projet-etude/pdf/`.

```powershell
# Depuis la racine du projet
.venv/Scripts/python.exe docs/projet-etude/export_pdf.py
```

### Bonnes pratiques

> **Captures à joindre en annexe :** front office, backoffice, Swagger UI, schéma DB, board Kanban, rapports de tests.

- Mettre à jour les sections **Planning** et **KPI** avec les dates campus réelles et les métriques d'avancement.
- Vérifier les **secrets** : aucune clé réelle ne doit figurer dans les fichiers versionnés.
- S'assurer que la **démo est reproductible** sur l'environnement de secours (vidéo backup).

---

## Jalons chronologiques

| Étape | Calendrier indicatif | Livrable |
|---|---|---|
| Kick-off | Sept.–Déc. 2025 | — |
| Rendez-vous de cadrage | Kick-off + 2 mois | Questions + résumé architecture |
| Document de cadrage | RV cadrage + 3 mois | PDF document de cadrage |
| Soutenance & démonstration | Document cadrage + 1 mois | Slides + démo |
| Livrables finaux | Soutenance + 2 semaines | Code Git + DCT PDF |
| Analyse dynamique | Livrables finaux + 2 semaines | Document individuel PDF |
