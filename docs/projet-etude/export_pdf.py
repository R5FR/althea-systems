from __future__ import annotations

from pathlib import Path
import html
import re

import markdown
from xhtml2pdf import pisa


TEAM = "Tiago Da Costa · Arthur L'Afféter · Tom Leprieur"
CLASS = "CPI-3 26 DEV A — Bachelor 3 CPI Développement"
ETABLISSEMENT = "SUP DE VINCI"
PROJECT = "Projet d'étude — Althea Systems"
DATE_DEFAULT = "Avril 2026"


# ── French typography ──────────────────────────────────────────────────────────

WORD_REPLACEMENTS: dict[str, str] = {
    "acces": "accès",
    "achetes": "achetés",
    "affiche": "affiché",
    "annee": "année",
    "aout": "août",
    "categorie": "catégorie",
    "categories": "catégories",
    "caracteristiques": "caractéristiques",
    "coherence": "cohérence",
    "completer": "compléter",
    "comprehension": "compréhension",
    "conformite": "conformité",
    "contribue": "contribué",
    "criteres": "critères",
    "decrit": "décrit",
    "decrire": "décrire",
    "decrite": "décrite",
    "decrites": "décrites",
    "decrivent": "décrivent",
    "deja": "déjà",
    "demontree": "démontrée",
    "demonstration": "démonstration",
    "dependances": "dépendances",
    "deploiement": "déploiement",
    "detail": "détail",
    "detailles": "détaillés",
    "developpement": "développement",
    "accroitre": "accroître",
    "complete": "complète",
    "completes": "complètes",
    "disponibilite": "disponibilité",
    "medical": "médical",
    "efficacite": "efficacité",
    "eleve": "élevé",
    "elements": "éléments",
    "emet": "émet",
    "equipe": "équipe",
    "equipes": "équipes",
    "equipement": "équipement",
    "equipements": "équipements",
    "etat": "état",
    "etape": "étape",
    "etapes": "étapes",
    "etude": "étude",
    "etudes": "études",
    "echanges": "échanges",
    "evolution": "évolution",
    "experience": "expérience",
    "finalite": "finalité",
    "evolutivite": "évolutivité",
    "fiabilite": "fiabilité",
    "fonctionnalite": "fonctionnalité",
    "fonctionnalites": "fonctionnalités",
    "generes": "générés",
    "gerer": "gérer",
    "hierarchique": "hiérarchique",
    "identite": "identité",
    "implemente": "implémenté",
    "implementation": "implémentation",
    "incoherence": "incohérence",
    "integration": "intégration",
    "maintenabilite": "maintenabilité",
    "mecanisme": "mécanisme",
    "materiel": "matériel",
    "methode": "méthode",
    "methodologie": "méthodologie",
    "metier": "métier",
    "metriques": "métriques",
    "modele": "modèle",
    "modeles": "modèles",
    "necessite": "nécessite",
    "objectif": "objectif",
    "objectifs": "objectifs",
    "optimisee": "optimisée",
    "parametres": "paramètres",
    "perimetre": "périmètre",
    "percue": "perçue",
    "personnalise": "personnalisé",
    "personnalisee": "personnalisée",
    "personnalises": "personnalisés",
    "planification": "planification",
    "preparation": "préparation",
    "prerequis": "prérequis",
    "present": "présent",
    "presentes": "présentées",
    "presentation": "présentation",
    "priorite": "priorité",
    "priorites": "priorités",
    "procede": "procédé",
    "projet": "projet",
    "qualite": "qualité",
    "rediges": "rédigés",
    "reel": "réel",
    "reelle": "réelle",
    "reelles": "réelles",
    "repartition": "répartition",
    "repond": "répond",
    "reponse": "réponse",
    "reponses": "réponses",
    "resume": "résumé",
    "resumee": "résumée",
    "role": "rôle",
    "roles": "rôles",
    "scalabilite": "scalabilité",
    "securise": "sécurisé",
    "securisee": "sécurisée",
    "securite": "sécurité",
    "selection": "sélection",
    "strategie": "stratégie",
    "superieur": "supérieur",
    "synthese": "synthèse",
    "systeme": "système",
    "taches": "tâches",
    "telechargement": "téléchargement",
    "teste": "testé",
    "traceabilite": "traçabilité",
    "tres": "très",
    "utilisabilite": "utilisabilité",
    "utilisateur": "utilisateur",
    "utilisateurs": "utilisateurs",
    "verifie": "vérifié",
    "versionne": "versionné",
}

PHRASE_REPLACEMENTS: dict[str, str] = {
    "a faire": "à faire",
    "a adapter": "à adapter",
    "a completer": "à compléter",
    "a confirmer": "à confirmer",
    "a partir": "à partir",
    "a jour": "à jour",
    "a joindre": "à joindre",
    "d'etude": "d'étude",
    "l'etat": "l'état",
    "cote": "côté",
}

WORD_PATTERN = re.compile(
    r"\b(" + "|".join(sorted((re.escape(w) for w in WORD_REPLACEMENTS), key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)


def _match_case(source: str, target: str) -> str:
    if source.isupper():
        return target.upper()
    if source and source[0].isupper():
        return target[0].upper() + target[1:]
    return target


def apply_french_typography(text: str) -> str:
    for src, target in PHRASE_REPLACEMENTS.items():
        pattern = re.compile(re.escape(src), re.IGNORECASE)
        text = pattern.sub(lambda m: _match_case(m.group(0), target), text)

    def replace_word(match: re.Match[str]) -> str:
        found = match.group(0)
        replacement = WORD_REPLACEMENTS.get(found.lower())
        if replacement is None:
            return found
        return _match_case(found, replacement)

    return WORD_PATTERN.sub(replace_word, text)


def accent_outside_code_blocks(markdown_text: str) -> str:
    segments = markdown_text.split("```")
    for i in range(0, len(segments), 2):
        segments[i] = apply_french_typography(segments[i])
    return "```".join(segments)


# ── Markdown pre-processing ────────────────────────────────────────────────────

# Emoji that xhtml2pdf/ReportLab cannot render: replace with styled HTML.
# Using HTML entities that are in the Latin-1 / standard Unicode range.
_EMOJI_REPLACEMENTS = [
    # Status: checked / OK
    ("✅", '<span class="s-ok">&#10003;</span>'),        # ✓ CHECK MARK (U+2713)
    # Status: partial / warning
    ("⚠️", '<span class="s-warn">!</span>'),
    ("⚠",  '<span class="s-warn">!</span>'),
    # Status: failed / missing
    ("❌", '<span class="s-fail">&times;</span>'),       # × (U+00D7, Latin-1)
    # Misc icons that may not render
    ("🔒", '[verrou]'),
    ("📦", '[paquet]'),
    ("📄", '[doc]'),
    ("🚀", '[lancement]'),
]


def preprocess_for_pdf(md_text: str) -> str:
    """
    Pre-process raw markdown before HTML conversion:
      - GFM task list checkboxes → styled HTML spans (☑ / ☐)
      - Emoji → safe HTML character entities or text
    Works on text outside code fences only.
    """
    segments = md_text.split("```")

    for i in range(0, len(segments), 2):
        seg = segments[i]

        # Task-list checkboxes: "- [x]" and "- [ ]"
        # Must come before emoji substitutions to avoid double-processing.
        seg = re.sub(
            r'^( *[-*+] )\[x\] ',
            lambda m: m.group(1) + '<span class="cb-done">&#10003;</span> ',
            seg,
            flags=re.MULTILINE | re.IGNORECASE,
        )
        seg = re.sub(
            r'^( *[-*+] )\[ \] ',
            lambda m: m.group(1) + '<span class="cb-open">&#9675;</span> ',
            seg,
            flags=re.MULTILINE,
        )

        # Emoji → safe substitutions
        for emoji, replacement in _EMOJI_REPLACEMENTS:
            seg = seg.replace(emoji, replacement)

        segments[i] = seg

    return "```".join(segments)


# ── Metadata extraction ────────────────────────────────────────────────────────

def extract_doc_meta(markdown_body: str) -> dict[str, str]:
    """Extract **Key :** Value pairs from the document preamble (first 40 lines)."""
    meta: dict[str, str] = {}
    for line in markdown_body.splitlines()[:40]:
        m = re.match(r"\*\*([^*]+?)\s*:\*\*\s*(.+)", line.strip())
        if m:
            key = m.group(1).strip().lower()
            val = m.group(2).strip()
            meta[key] = val
    return meta


def strip_cover_section(markdown_body: str) -> str:
    """Return content from the first '## ' heading onward (skips H1 title + metadata)."""
    for i, line in enumerate(markdown_body.splitlines()):
        if line.startswith("## "):
            return "\n".join(markdown_body.splitlines()[i:])
    return markdown_body


def first_title(markdown_body: str, fallback: str) -> str:
    for raw in markdown_body.splitlines():
        line = raw.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


# ── HTML post-processing ───────────────────────────────────────────────────────

def postprocess_html(html_content: str) -> str:
    """
    Post-process converted HTML for visual improvements:
      - Add .toc class to the list immediately after a 'Table des matières' heading.
    """
    # Match <h2>…Table des matières…</h2> followed (with optional whitespace) by <ol or <ul
    html_content = re.sub(
        r'(<h2>[^<]*[Tt]able\s+des\s+mati[^<]*</h2>\s*)(<(?:ol|ul))',
        lambda m: m.group(1) + m.group(2) + ' class="toc"',
        html_content,
    )
    return html_content


# ── CSS ────────────────────────────────────────────────────────────────────────

CSS = """
/* ── Page layout ── */
@page {
  size: A4;
  margin: 1.9cm 1.75cm 2.1cm 1.75cm;
  @frame footer_frame {
    -pdf-frame-content: page_footer;
    left: 1.75cm;
    width: 17.5cm;
    top: 27.65cm;
    height: 0.7cm;
  }
}

/* ── Base ── */
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10.5pt;
  color: #1a3a4a;
  line-height: 1.7;
  background: #ffffff;
}

/* ── Headings ── */
h1 { display: none; }

h2 {
  font-family: Georgia, "Palatino Linotype", "Book Antiqua", serif;
  font-size: 14pt;
  color: #003d5c;
  font-weight: bold;
  margin: 28px 0 10px 0;
  padding: 9px 14px 9px 20px;
  background: #edf9fb;
  border-left: 5px solid #00a8b5;
  border-bottom: 1px solid #bce9ee;
  page-break-after: avoid;
}

h3 {
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 12pt;
  color: #003d5c;
  font-weight: bold;
  margin: 22px 0 8px 0;
  padding-bottom: 5px;
  border-bottom: 1.5px solid #d0eef3;
  page-break-after: avoid;
}

h4 {
  font-size: 10.8pt;
  color: #005f6e;
  font-weight: bold;
  margin: 16px 0 5px 0;
  page-break-after: avoid;
}

h5 {
  font-size: 10pt;
  color: #00a8b5;
  font-weight: normal;
  font-style: italic;
  margin: 12px 0 4px 0;
}

/* ── Body ── */
p { margin: 0 0 10px 0; }
ul, ol { margin: 0 0 12px 22px; padding: 0; }
li { margin: 5px 0; line-height: 1.65; }
strong { color: #003d5c; }
em { color: #1e4d62; font-style: italic; }
a { color: #006272; text-decoration: underline; }

hr {
  border: none;
  border-top: 1px solid #d6eff3;
  margin: 20px 0;
}

/* ── Inline code ── */
code {
  font-family: "Courier New", Courier, monospace;
  background: #edf9fb;
  border: 1px solid #aadde4;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9pt;
  color: #004f63;
}

/* ── Code blocks ── */
pre {
  font-family: "Courier New", Courier, monospace;
  background: #012536;
  color: #a8e6ed;
  border-left: 4px solid #00a8b5;
  padding: 13px 16px;
  white-space: pre-wrap;
  font-size: 8.8pt;
  line-height: 1.55;
  margin: 12px 0 18px 0;
  page-break-inside: avoid;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* ── Blockquote ── */
blockquote {
  border-left: 4px solid #00a8b5;
  margin: 16px 0;
  padding: 10px 18px;
  color: #1e4d62;
  background: #f0fafc;
  font-style: italic;
  page-break-inside: avoid;
}

blockquote p { margin: 0 0 5px 0; }
blockquote p:last-child { margin: 0; }
blockquote strong { color: #005f6e; font-style: normal; }

/* ── Tables ── */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 14px 0 20px 0;
  font-size: 9.3pt;
  page-break-inside: auto;
  border: 1px solid #a8dde4;
}

th {
  background: #003d5c;
  color: #f0fafb;
  font-weight: bold;
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 9px 11px;
  text-align: left;
  border: 1px solid #002840;
  page-break-after: avoid;
}

td {
  border: 1px solid #c2e7ec;
  padding: 7px 11px;
  vertical-align: top;
}

tr:nth-child(even) td { background: #f3fbfc; }
tr:nth-child(odd) td { background: #ffffff; }

/* ── Table of Contents ── */
ol.toc, ul.toc {
  list-style: none;
  margin: 6px 0 20px 0;
  padding: 0;
  border: 1px solid #bce9ee;
  border-radius: 4px;
  background: #f7fdfe;
}

ol.toc li, ul.toc li {
  border-bottom: 1px solid #daf1f5;
  padding: 7px 16px;
  margin: 0;
  font-size: 10pt;
  line-height: 1.5;
}

ol.toc li:last-child, ul.toc li:last-child {
  border-bottom: none;
}

ol.toc a, ul.toc a {
  color: #003d5c;
  text-decoration: none;
  font-weight: bold;
}

/* Nested ToC items */
ol.toc li ol, ol.toc li ul,
ul.toc li ol, ul.toc li ul {
  border: none;
  background: none;
  margin: 4px 0 0 12px;
  padding: 0;
}

ol.toc li ol li, ul.toc li ul li {
  border-bottom: none;
  padding: 3px 0 3px 12px;
  font-size: 9.5pt;
  font-weight: normal;
}

ol.toc li ol a, ul.toc li ul a {
  color: #4a7c8a;
  font-weight: normal;
}

/* ── Task-list checkboxes ── */
.cb-done {
  color: #16a34a;
  font-weight: bold;
  font-size: 11pt;
  margin-right: 2px;
}

.cb-open {
  color: #94b4bc;
  font-size: 11pt;
  margin-right: 2px;
}

/* ── Status indicators (replaces emoji) ── */
.s-ok {
  color: #15803d;
  font-weight: bold;
  font-size: 10pt;
}

.s-warn {
  color: #b45309;
  font-weight: bold;
  font-size: 10pt;
}

.s-fail {
  color: #b91c1c;
  font-weight: bold;
  font-size: 10pt;
}

/* ── Cover page — table-based layout (xhtml2pdf-safe) ── */

/* Outer shell: table forces background onto all cells */
.cover-shell {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

/* Top teal bar row */
.cover-topbar-cell {
  height: 7px;
  background: #00a8b5;
  padding: 0;
  font-size: 1pt;
  line-height: 1pt;
  border: none;
}

/* Main content cell: navy background guaranteed on a <td> */
.cover-body-cell {
  background: #003d5c;
  color: #f0fafb;
  padding: 30px 32px 28px 32px;
  border: none;
  vertical-align: top;
}

.cover-kicker {
  font-size: 7.8pt;
  color: #6dccd5;
  text-transform: uppercase;
  letter-spacing: 2.2px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

/* Document number — plain teal label, no badge background (xhtml2pdf can't clip divs) */
.cover-docnum {
  font-size: 8pt;
  color: #00a8b5;
  font-weight: bold;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0 0 16px 0;
}

.cover-accent-line {
  width: 44px;
  height: 3px;
  background: #00a8b5;
  margin: 0 0 18px 0;
  font-size: 1pt;
  line-height: 1pt;
}

.cover-title {
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 24pt;
  color: #f0fafb;
  font-weight: bold;
  line-height: 1.2;
  margin: 0 0 10px 0;
}

.cover-subtitle {
  font-size: 11.5pt;
  color: #6dccd5;
  margin: 0 0 22px 0;
}

/* Divider row inside the meta nested table */
.cover-meta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.8pt;
  margin: 16px 0 0 0;
  background: #003d5c;
}

.cover-meta-table td {
  border: none;
  border-bottom: 1px solid #1a5675;
  padding: 9px 6px;
  background: #003d5c;
  color: #f0fafb;
  vertical-align: top;
}

.cover-meta-table tr:last-child td { border-bottom: none; }
/* Override alternating rows for cover — keep navy on every row */
.cover-meta-table tr:nth-child(even) td { background: #003d5c; }
.cover-meta-table tr:nth-child(odd)  td { background: #003d5c; }

.meta-key {
  color: #6dccd5;
  font-weight: bold;
  font-size: 8.2pt;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  width: 30%;
}

/* Brand footer inside cover */
.cover-brand-cell {
  background: #003d5c;
  border: none;
  border-top: 1px solid #1a5675;
  padding: 14px 32px 26px 32px;
}

.cover-brand {
  font-size: 9pt;
  font-weight: bold;
  color: #00a8b5;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin: 0;
}

/* ── Document identity header (first content page) ── */
.dh-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  background: #f2fbfc;
  border: 1px solid #bce9ee;
  border-left: 5px solid #00a8b5;
  border-radius: 4px;
  page-break-after: avoid;
}

.dh-table td {
  border: none;
  vertical-align: middle;
  background: transparent;
  padding: 10px 16px;
}

.dh-table tr:nth-child(even) td { background: transparent; }

.dh-title {
  font-size: 11.5pt;
  font-weight: bold;
  color: #003d5c;
  margin-bottom: 3px;
}

.dh-meta {
  font-size: 8pt;
  color: #4d7585;
}

.dh-num {
  font-family: Georgia, serif;
  font-size: 28pt;
  font-weight: bold;
  color: #caedf2;
  text-align: right;
  width: 55px;
  line-height: 1;
  padding: 8px 18px 8px 10px;
}

/* ── Running footer ── */
.footer-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1.5px solid #00a8b5;
}

.footer-table td {
  border: none;
  padding: 4px 0 0 0;
  background: transparent;
  font-size: 7.6pt;
  color: #4d7585;
  vertical-align: top;
}

.footer-table tr:nth-child(even) td { background: transparent; }
.footer-left { text-align: left; }
.footer-right { text-align: right; font-weight: bold; color: #003d5c; }
"""


# ── HTML builder ───────────────────────────────────────────────────────────────

def build_html(title: str, markdown_body: str, doc_num: str = "") -> str:
    meta = extract_doc_meta(markdown_body)

    # Body: strip cover section → preprocess → typography → convert → postprocess
    body_md = strip_cover_section(markdown_body)
    body_md = preprocess_for_pdf(body_md)
    body_md = accent_outside_code_blocks(body_md)
    title_display = apply_french_typography(title)

    content_html = markdown.markdown(
        body_md,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="xhtml1",
    )
    content_html = postprocess_html(content_html)

    bloc = meta.get("bloc certifiant", "")
    date_val = meta.get("date", DATE_DEFAULT)

    # Footer: short title before "—"
    short = title_display.split("—")[0].strip() if "—" in title_display else title_display
    short_esc = html.escape(short)
    title_esc = html.escape(title_display)

    bloc_row = (
        f'<tr><td class="meta-key">Bloc certifiant</td>'
        f'<td>{html.escape(bloc)}</td></tr>'
        if bloc else ""
    )

    docnum_label = (
        f'<p class="cover-docnum">Document&nbsp;{html.escape(doc_num)}</p>'
        if doc_num else ""
    )

    # Build doc-header meta line (bloc + school + date)
    dh_meta_parts = [p for p in [html.escape(bloc), html.escape(ETABLISSEMENT), html.escape(date_val)] if p]
    dh_meta = " &nbsp;·&nbsp; ".join(dh_meta_parts)

    dh_num_cell = (
        f'<td class="dh-num">{html.escape(doc_num)}</td>'
        if doc_num else ""
    )

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <style>{CSS}</style>
</head>
<body>

  <!-- Running footer (rendered on every page via @frame) -->
  <table id="page_footer" class="footer-table">
    <tr>
      <td class="footer-left">{short_esc} &nbsp;·&nbsp; Althea Systems</td>
      <td class="footer-right">Page <pdf:pagenumber /> / <pdf:pagecount /></td>
    </tr>
  </table>

  <!-- ── Cover page — full table layout (xhtml2pdf-safe) ── -->
  <table class="cover-shell" cellpadding="0" cellspacing="0">
    <!-- Teal topbar -->
    <tr><td class="cover-topbar-cell">&nbsp;</td></tr>

    <!-- Main body -->
    <tr>
      <td class="cover-body-cell">
        <p class="cover-kicker">{html.escape(ETABLISSEMENT)} &nbsp;·&nbsp; Dossier professionnel</p>
        {docnum_label}
        <table cellpadding="0" cellspacing="0" style="margin:0 0 18px 0; background:#003d5c; border:none;">
          <tr><td style="background:#00a8b5; height:3px; width:44px; padding:0; border:none; font-size:1pt; line-height:1pt;">&nbsp;</td></tr>
        </table>
        <p class="cover-title">{title_esc}</p>
        <p class="cover-subtitle">{html.escape(PROJECT)}</p>
        <table class="cover-meta-table" cellpadding="0" cellspacing="0">
          <tr>
            <td class="meta-key">Équipe</td>
            <td>{html.escape(TEAM)}</td>
          </tr>
          <tr>
            <td class="meta-key">Classe</td>
            <td>{html.escape(CLASS)}</td>
          </tr>
          {bloc_row}
          <tr>
            <td class="meta-key">Date</td>
            <td>{html.escape(date_val)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Brand footer -->
    <tr><td class="cover-brand-cell"><p class="cover-brand">Althea Systems</p></td></tr>
  </table>

  <pdf:nextpage />

  <!-- ── Document identity header (first content page) ── -->
  <table class="dh-table">
    <tr>
      <td>
        <div class="dh-title">{title_esc}</div>
        <div class="dh-meta">{dh_meta}</div>
      </td>
      {dh_num_cell}
    </tr>
  </table>

  {content_html}

</body>
</html>"""


# ── File conversion ────────────────────────────────────────────────────────────

def convert_file(md_path: Path, out_dir: Path) -> tuple[bool, str]:
    body = md_path.read_text(encoding="utf-8")
    title = first_title(body, md_path.stem)

    # Extract two-digit document number from filename (e.g. "01" from "01_document.md")
    m = re.match(r"^(\d+)", md_path.stem)
    doc_num = m.group(1).zfill(2) if m else ""

    full_html = build_html(title, body, doc_num)

    out_path = out_dir / f"{md_path.stem}.pdf"
    with out_path.open("wb") as target:
        result = pisa.CreatePDF(src=full_html, dest=target, encoding="utf-8")

    return (not bool(result.err), str(out_path))


def main() -> int:
    root = Path(__file__).resolve().parent
    out_dir = root / "pdf"
    out_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(root.glob("[0-9][0-9]_*.md"))
    if not files:
        print("No markdown files found")
        return 1

    failures = 0
    for md in files:
        ok, out = convert_file(md, out_dir)
        status = "OK" if ok else "FAIL"
        print(f"{status} - {md.name} -> {out}")
        if not ok:
            failures += 1

    return 0 if failures == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
