#!/usr/bin/env node
/**
 * Traduit automatiquement fr.json → en.json et ar.json via LibreTranslate.
 *
 * Usage :
 *   npm run translate           — traduit seulement les clés manquantes
 *   npm run translate -- --force — retraduit toutes les clés
 *
 * Prérequis : LibreTranslate doit tourner (docker compose up -d libretranslate)
 */

const fs   = require('fs');
const path = require('path');

const LT_URL  = process.env.LT_URL  || 'http://localhost:5100';
const SOURCE  = 'fr';
const TARGETS = ['en', 'ar'];
const I18N    = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const FORCE   = process.argv.includes('--force');

// ── Helpers ────────────────────────────────────────────────────────────────

/** { 'nav.home': 'Accueil', ... } */
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(acc, flatten(v, key));
    else acc[key] = String(v);
    return acc;
  }, {});
}

/** Reconstruit l'objet imbriqué depuis les clés à points */
function unflatten(flat) {
  const out = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    const keys = dotKey.split('.');
    let cur = out;
    for (let i = 0; i < keys.length - 1; i++) {
      cur[keys[i]] ??= {};
      cur = cur[keys[i]];
    }
    cur[keys.at(-1)] = value;
  }
  return out;
}

/** Appelle l'API LibreTranslate avec un tableau de textes */
async function translateBatch(texts, from, to) {
  const res = await fetch(`${LT_URL}/translate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ q: texts, source: from, target: to, format: 'text' }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`LibreTranslate ${res.status}: ${err}`);
  }
  const { translatedText } = await res.json();
  return Array.isArray(translatedText) ? translatedText : [translatedText];
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Vérifier que LibreTranslate est accessible
  try {
    const r = await fetch(`${LT_URL}/languages`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    console.error(`\n❌  LibreTranslate inaccessible à ${LT_URL}`);
    console.error('    Démarrez-le avec : docker compose up -d libretranslate\n');
    process.exit(1);
  }

  const source = JSON.parse(fs.readFileSync(path.join(I18N, `${SOURCE}.json`), 'utf8'));
  const flat   = flatten(source);
  const keys   = Object.keys(flat);
  const values = Object.values(flat);

  for (const lang of TARGETS) {
    process.stdout.write(`\n${SOURCE} → ${lang}  `);

    const file     = path.join(I18N, `${lang}.json`);
    const existing = fs.existsSync(file)
      ? flatten(JSON.parse(fs.readFileSync(file, 'utf8')))
      : {};

    // Clés à traduire : toutes (--force) ou uniquement les manquantes
    const toTranslate = keys.reduce((acc, k, i) => {
      if (FORCE || !existing[k]) acc.push({ key: k, text: values[i] });
      return acc;
    }, []);

    if (toTranslate.length === 0) {
      console.log(`✓  déjà à jour (${keys.length} clés)`);
      continue;
    }

    process.stdout.write(`${toTranslate.length} clés…`);

    const translated = await translateBatch(toTranslate.map(t => t.text), SOURCE, lang);

    toTranslate.forEach(({ key }, i) => { existing[key] = translated[i]; });

    // Conserver l'ordre des clés source dans le fichier produit
    const ordered = {};
    keys.forEach(k => { if (existing[k] !== undefined) ordered[k] = existing[k]; });

    fs.writeFileSync(file, JSON.stringify(unflatten(ordered), null, 2) + '\n');
    console.log(' ✓');
  }

  console.log('\nTerminé.\n');
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
