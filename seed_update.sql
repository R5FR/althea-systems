-- ============================================================
--  SEED UPDATE — Althea Systems
--  Ajout d'images + nouveaux produits
--  À exécuter dans la base b3 APRÈS seed.sql
-- ============================================================

-- ── Images des produits existants ────────────────────────────
-- Supprimer les doublons éventuels avant d'insérer

DELETE FROM ProductImages WHERE ProductId IN (
  'B1000000-0000-0000-0000-000000000001','B1000000-0000-0000-0000-000000000002',
  'B1000000-0000-0000-0000-000000000003','B1000000-0000-0000-0000-000000000004',
  'B1000000-0000-0000-0000-000000000005','B1000000-0000-0000-0000-000000000006',
  'B1000000-0000-0000-0000-000000000007','B1000000-0000-0000-0000-000000000008',
  'B1000000-0000-0000-0000-000000000009','B1000000-0000-0000-0000-000000000010',
  'B1000000-0000-0000-0000-000000000011','B1000000-0000-0000-0000-000000000012',
  'B1000000-0000-0000-0000-000000000013','B1000000-0000-0000-0000-000000000014',
  'B1000000-0000-0000-0000-000000000015','B1000000-0000-0000-0000-000000000016',
  'B1000000-0000-0000-0000-000000000017','B1000000-0000-0000-0000-000000000018',
  'B1000000-0000-0000-0000-000000000019'
);

INSERT INTO ProductImages (Id, ProductId, ImageUrl, IsMain, DisplayOrder, CreatedAt) VALUES
-- Échographe portable
('C1000000-0000-0000-0000-000000000001','B1000000-0000-0000-0000-000000000001',
 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000002','B1000000-0000-0000-0000-000000000001',
 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50d3?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Scanner portable
('C1000000-0000-0000-0000-000000000003','B1000000-0000-0000-0000-000000000002',
 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000004','B1000000-0000-0000-0000-000000000002',
 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Moniteur multiparamétrique
('C1000000-0000-0000-0000-000000000005','B1000000-0000-0000-0000-000000000003',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000006','B1000000-0000-0000-0000-000000000003',
 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Oxymètre
('C1000000-0000-0000-0000-000000000007','B1000000-0000-0000-0000-000000000004',
 'https://images.unsplash.com/photo-1584308666744-93a4de03db9c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Tensiomètre
('C1000000-0000-0000-0000-000000000008','B1000000-0000-0000-0000-000000000005',
 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000009','B1000000-0000-0000-0000-000000000005',
 'https://images.unsplash.com/photo-1631651364022-0f0a24dba6e2?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Bistouri électrique
('C1000000-0000-0000-0000-000000000010','B1000000-0000-0000-0000-000000000006',
 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000011','B1000000-0000-0000-0000-000000000006',
 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Insufflateur laparoscopique
('C1000000-0000-0000-0000-000000000012','B1000000-0000-0000-0000-000000000007',
 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Otoscope numérique
('C1000000-0000-0000-0000-000000000013','B1000000-0000-0000-0000-000000000008',
 'https://images.unsplash.com/photo-1631648669996-ce60dd073c61?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000014','B1000000-0000-0000-0000-000000000008',
 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Dermatoscope
('C1000000-0000-0000-0000-000000000015','B1000000-0000-0000-0000-000000000009',
 'https://images.unsplash.com/photo-1588776814546-daab30f2916c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Défibrillateur
('C1000000-0000-0000-0000-000000000016','B1000000-0000-0000-0000-000000000010',
 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000017','B1000000-0000-0000-0000-000000000010',
 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- ECG 12 dérivations
('C1000000-0000-0000-0000-000000000018','B1000000-0000-0000-0000-000000000011',
 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000019','B1000000-0000-0000-0000-000000000011',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Holter ECG
('C1000000-0000-0000-0000-000000000020','B1000000-0000-0000-0000-000000000012',
 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Lampe à fente
('C1000000-0000-0000-0000-000000000021','B1000000-0000-0000-0000-000000000013',
 'https://images.unsplash.com/photo-1576671081837-49000212a9cc?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000022','B1000000-0000-0000-0000-000000000013',
 'https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Tonomètre
('C1000000-0000-0000-0000-000000000023','B1000000-0000-0000-0000-000000000014',
 'https://images.unsplash.com/photo-1576671081837-49000212a9cc?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Autoclave
('C1000000-0000-0000-0000-000000000024','B1000000-0000-0000-0000-000000000015',
 'https://images.unsplash.com/photo-1584308666744-93a4de03db9c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000025','B1000000-0000-0000-0000-000000000015',
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Thermo-scelleuse
('C1000000-0000-0000-0000-000000000026','B1000000-0000-0000-0000-000000000016',
 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- Table d'examen
('C1000000-0000-0000-0000-000000000027','B1000000-0000-0000-0000-000000000017',
 'https://images.unsplash.com/photo-1519494026892-8078ce59a3c0?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000028','B1000000-0000-0000-0000-000000000017',
 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Fauteuil dentaire
('C1000000-0000-0000-0000-000000000029','B1000000-0000-0000-0000-000000000018',
 'https://images.unsplash.com/photo-1588776814546-daab30f2916c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000030','B1000000-0000-0000-0000-000000000018',
 'https://images.unsplash.com/photo-1519494026892-8078ce59a3c0?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- Chariot inox
('C1000000-0000-0000-0000-000000000031','B1000000-0000-0000-0000-000000000019',
 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE());

-- ── Nouveaux produits ─────────────────────────────────────────

-- Supprimer les doublons si le script est rejoué
DELETE FROM ProductImages WHERE ProductId IN (
  'B1000000-0000-0000-0000-000000000020','B1000000-0000-0000-0000-000000000021',
  'B1000000-0000-0000-0000-000000000022','B1000000-0000-0000-0000-000000000023',
  'B1000000-0000-0000-0000-000000000024','B1000000-0000-0000-0000-000000000025',
  'B1000000-0000-0000-0000-000000000026','B1000000-0000-0000-0000-000000000027',
  'B1000000-0000-0000-0000-000000000028','B1000000-0000-0000-0000-000000000029',
  'B1000000-0000-0000-0000-000000000030','B1000000-0000-0000-0000-000000000031'
);
DELETE FROM Products WHERE Id IN (
  'B1000000-0000-0000-0000-000000000020','B1000000-0000-0000-0000-000000000021',
  'B1000000-0000-0000-0000-000000000022','B1000000-0000-0000-0000-000000000023',
  'B1000000-0000-0000-0000-000000000024','B1000000-0000-0000-0000-000000000025',
  'B1000000-0000-0000-0000-000000000026','B1000000-0000-0000-0000-000000000027',
  'B1000000-0000-0000-0000-000000000028','B1000000-0000-0000-0000-000000000029',
  'B1000000-0000-0000-0000-000000000030','B1000000-0000-0000-0000-000000000031'
);

INSERT INTO Products (Id, Name, Description, PriceHt, TvaRate, PriceTtc, StockQuantity, Status, Slug, CategoryId, CreatedAt, UpdatedAt)
VALUES
-- Imagerie médicale
('B1000000-0000-0000-0000-000000000020',
 'Radiographe dentaire numérique DentRay Pro',
 'Capteur numérique intra-oral haute résolution (25 lp/mm). Compatible logiciels TWAIN, temps d''exposition réduit de 80 % vs argentique. Inclus : capteur taille 2, câble USB 3.0, logiciel.',
 2916.67, 20, 3500.00, 5, 0, 'dentray-pro-numerique',
 'A1000000-0000-0000-0000-000000000001', GETUTCDATE(), GETUTCDATE()),

('B1000000-0000-0000-0000-000000000021',
 'Caméra d''endoscopie EndoView HD 1080p',
 'Caméra endoscopique Full HD 1080p avec tête de caméra stérilisable. Capteur CMOS 1/3'', balance des blancs automatique, sortie HDMI/DVI. Idéale pour ORL et gastroentérologie.',
 7083.33, 20, 8500.00, 3, 0, 'endoview-hd-1080p',
 'A1000000-0000-0000-0000-000000000001', GETUTCDATE(), GETUTCDATE()),

-- Monitoring & Surveillance
('B1000000-0000-0000-0000-000000000022',
 'Respirateur de transport VentiMax Eco',
 'Respirateur d''urgence et de transport, modes VVC/VAC/VSAI. Turbine interne, autonomie 8h sur batterie, alarmes sonores et visuelles. Poids 3,8 kg, homologué SAMU.',
 8750.00, 20, 10500.00, 2, 0, 'ventimax-eco-transport',
 'A1000000-0000-0000-0000-000000000002', GETUTCDATE(), GETUTCDATE()),

('B1000000-0000-0000-0000-000000000023',
 'Nébuliseur à ultrasons SilentBreath Pro',
 'Nébuliseur ultrasonique silencieux (< 35 dB) pour aérosolthérapie ambulatoire. Débit réglable 0,5–3 ml/min, réservoir 10 ml, minuterie 30 min. Adapté adultes et enfants.',
 208.33, 20, 250.00, 35, 0, 'silentbreath-pro-nebuliseur',
 'A1000000-0000-0000-0000-000000000002', GETUTCDATE(), GETUTCDATE()),

-- Chirurgie & Blocs
('B1000000-0000-0000-0000-000000000024',
 'Table d''opération chirurgicale OptiSurg 500',
 'Table d''opération polyvalente à commande électrohydraulique. Plateau carbone radiotransparent, hauteur 65–105 cm, inclinaison ±30°, capacité 350 kg. Accessoires fournis.',
 20833.33, 20, 25000.00, 1, 0, 'optisurg-500-table-operation',
 'A1000000-0000-0000-0000-000000000003', GETUTCDATE(), GETUTCDATE()),

('B1000000-0000-0000-0000-000000000025',
 'Aspirateur chirurgical AccuSuct 800 mL',
 'Aspirateur chirurgical portable 800 mL pour bloc opératoire et soins. Moteur brushless silencieux, vide max -90 kPa, cuve graduée avec filtre HEPA, décontamination facile.',
 1041.67, 20, 1250.00, 10, 0, 'accusuct-aspirateur-chirurgical',
 'A1000000-0000-0000-0000-000000000003', GETUTCDATE(), GETUTCDATE()),

-- Diagnostic clinique
('B1000000-0000-0000-0000-000000000026',
 'Stéthoscope électronique amplificateur SoundDoc 3000',
 'Stéthoscope électronique avec amplification x24, filtre bruit ambiant et enregistrement Bluetooth. Compatible application iOS/Android pour télémédecine. Autonomie 100h.',
 374.17, 20, 449.00, 20, 0, 'sounddoc-3000-stethoscope',
 'A1000000-0000-0000-0000-000000000004', GETUTCDATE(), GETUTCDATE()),

('B1000000-0000-0000-0000-000000000027',
 'Glucomètre connecté GlucoCheck Elite',
 'Lecteur de glycémie connecté Bluetooth, résultats en 5 secondes. Mémoire 500 mesures avec horodatage, alerte hyperglycémie/hypoglycémie, compatible iOS/Android.',
 58.33, 20, 70.00, 60, 0, 'glucocheck-elite-connecte',
 'A1000000-0000-0000-0000-000000000004', GETUTCDATE(), GETUTCDATE()),

-- Ophtalmologie
('B1000000-0000-0000-0000-000000000028',
 'Ophtalmoscope direct LED HD OptiDoc',
 'Ophtalmoscope à LED haute luminosité pour examen du fond d''œil. Grossissement x15, pupille 0 à +20 dioptries, tête interchangeable, poignée rechargeable universelle.',
 291.67, 20, 350.00, 15, 0, 'optidoc-ophtalmoscope-led',
 'A1000000-0000-0000-0000-000000000006', GETUTCDATE(), GETUTCDATE()),

-- Stérilisation
('B1000000-0000-0000-0000-000000000029',
 'Laveur désinfecteur instruments LavaMed 600',
 'Laveur-désinfecteur automatique 4 paniers pour instruments chirurgicaux. Cycle 35 min, température 93 °C, pompe dosage intégrée, traçabilité USB. Conforme EN ISO 15883.',
 6666.67, 20, 8000.00, 2, 0, 'lavamed-600-laveur-desinfecteur',
 'A1000000-0000-0000-0000-000000000007', GETUTCDATE(), GETUTCDATE()),

-- Mobilier médical
('B1000000-0000-0000-0000-000000000030',
 'Lampe d''examen LED sur pied ExamLight 50W',
 'Lampe d''examen à LED 50 000 lux, température de couleur 4 500 K. Bras articulé 5 axes, pied à 5 roulettes avec frein, allumage sensitif. Rendu colorimétrique CRI > 95.',
 541.67, 20, 650.00, 12, 0, 'examlight-50w-led-examen',
 'A1000000-0000-0000-0000-000000000008', GETUTCDATE(), GETUTCDATE()),

('B1000000-0000-0000-0000-000000000031',
 'Armoire à pharmacie sécurisée PharmaSafe 90',
 'Armoire médicale verrouillable 90 cm à 2 portes vitrées. 6 étagères réglables en acier inox, serrure à clé double, montage mural ou sur pied en option.',
 458.33, 20, 550.00, 8, 0, 'pharmasafe-90-armoire-pharmacie',
 'A1000000-0000-0000-0000-000000000008', GETUTCDATE(), GETUTCDATE());

-- ── Images des nouveaux produits ─────────────────────────────

INSERT INTO ProductImages (Id, ProductId, ImageUrl, IsMain, DisplayOrder, CreatedAt) VALUES
-- DentRay Pro (radiographie dentaire)
('C1000000-0000-0000-0000-000000000032','B1000000-0000-0000-0000-000000000020',
 'https://images.unsplash.com/photo-1588776814546-daab30f2916c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000033','B1000000-0000-0000-0000-000000000020',
 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50d3?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- EndoView HD (caméra endoscopique)
('C1000000-0000-0000-0000-000000000034','B1000000-0000-0000-0000-000000000021',
 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000035','B1000000-0000-0000-0000-000000000021',
 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- VentiMax Eco (respirateur)
('C1000000-0000-0000-0000-000000000036','B1000000-0000-0000-0000-000000000022',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000037','B1000000-0000-0000-0000-000000000022',
 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- SilentBreath (nébuliseur)
('C1000000-0000-0000-0000-000000000038','B1000000-0000-0000-0000-000000000023',
 'https://images.unsplash.com/photo-1584308666744-93a4de03db9c?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- OptiSurg 500 (table d'opération)
('C1000000-0000-0000-0000-000000000039','B1000000-0000-0000-0000-000000000024',
 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000040','B1000000-0000-0000-0000-000000000024',
 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50d3?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- AccuSuct (aspirateur chirurgical)
('C1000000-0000-0000-0000-000000000041','B1000000-0000-0000-0000-000000000025',
 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),

-- SoundDoc 3000 (stéthoscope électronique)
('C1000000-0000-0000-0000-000000000042','B1000000-0000-0000-0000-000000000026',
 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000043','B1000000-0000-0000-0000-000000000026',
 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- GlucoCheck Elite (glucomètre)
('C1000000-0000-0000-0000-000000000044','B1000000-0000-0000-0000-000000000027',
 'https://images.unsplash.com/photo-1631651364022-0f0a24dba6e2?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000045','B1000000-0000-0000-0000-000000000027',
 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- OptiDoc (ophtalmoscope)
('C1000000-0000-0000-0000-000000000046','B1000000-0000-0000-0000-000000000028',
 'https://images.unsplash.com/photo-1576671081837-49000212a9cc?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000047','B1000000-0000-0000-0000-000000000028',
 'https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- LavaMed 600 (laveur-désinfecteur)
('C1000000-0000-0000-0000-000000000048','B1000000-0000-0000-0000-000000000029',
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000049','B1000000-0000-0000-0000-000000000029',
 'https://images.unsplash.com/photo-1584308666744-93a4de03db9c?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- ExamLight 50W (lampe d'examen)
('C1000000-0000-0000-0000-000000000050','B1000000-0000-0000-0000-000000000030',
 'https://images.unsplash.com/photo-1519494026892-8078ce59a3c0?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE()),
('C1000000-0000-0000-0000-000000000051','B1000000-0000-0000-0000-000000000030',
 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop&auto=format',0,1,GETUTCDATE()),

-- PharmaSafe 90 (armoire pharmacie)
('C1000000-0000-0000-0000-000000000052','B1000000-0000-0000-0000-000000000031',
 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop&auto=format',1,0,GETUTCDATE());

DECLARE @prods INT = (SELECT COUNT(*) FROM Products);
DECLARE @imgs  INT = (SELECT COUNT(*) FROM ProductImages);
PRINT 'Mise à jour terminée — ' + CAST(@prods AS VARCHAR) + ' produits, ' + CAST(@imgs AS VARCHAR) + ' images.';
