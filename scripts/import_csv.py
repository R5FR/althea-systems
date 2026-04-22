"""
Reads althea-systems-com-2026-04-10.csv, uploads product images to Cloudinary,
and generates + executes seed.sql against the running SQL Server container.

Schema (from EF Core configs):
  Categories: Id, Name, Description, ImageUrl, Slug, ParentId (null), DisplayOrder, Status, CreatedAt, UpdatedAt
  Products:   Id, Name, Description, PriceHt, TvaRate, PriceTtc, StockQuantity, Status, Slug, CategoryId, CreatedAt, UpdatedAt
  ProductImages: Id, ProductId, ImageUrl, IsMain, DisplayOrder, CreatedAt
"""

import csv
import io
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone

import cloudinary
import cloudinary.uploader
import requests

# ── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name="dwttdacri",
    api_key="831855229215398",
    api_secret="f257dk4VIFyYIgVGOrakkd7GRfI",
)

# ── Paths / container ────────────────────────────────────────────────────────
CSV_PATH = r"C:\Users\tomle\Downloads\althea-systems-com-2026-04-10.csv"
SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "seed.sql")
CONTAINER = "althea-systems-sqlserver-1"
SQLCMD = "/opt/mssql-tools18/bin/sqlcmd"
SA_PWD = "Althea@Strong1"  # matches docker-compose SA_PASSWORD

TVA_RATE = 20.0  # standard French medical TVA

# ── Category mapping (reference prefix → fixed GUID) ────────────────────────
CATEGORY_IDS = {
    "IMG-SW": "862c14f9-5578-43f6-85a7-0a54dbcb5ba9",
    "CONS":   "a206b060-d8a3-41c9-8113-8ac10d58593a",
    "IMG":    "c0e30161-162b-4a2e-83f9-8149cd57bc99",
    "DM":     "091c5a7d-7759-4833-8519-e2aefda64c77",
    "DEN":    "d238ae75-f681-43fd-bc3b-58525c312250",
    "LAB":    "a013d5dd-fcd2-40c7-b5d7-0b1e8728170e",
    "CAB":    "b9b72642-35b3-417c-90be-8885c8ff5e1c",
    "ACC":    "a12684d4-0a16-4f4e-ab64-7b2cf72cca7e",
}

CATEGORIES = [
    # (id, name, slug, description, image_url, display_order)
    ("a206b060-d8a3-41c9-8113-8ac10d58593a", "Consommables médicaux", "consommables",
     "Gants, seringues, compresses et tout le matériel à usage unique indispensable à votre pratique quotidienne.",
     "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800", 1),
    ("862c14f9-5578-43f6-85a7-0a54dbcb5ba9", "Logiciels & PACS", "logiciels-pacs",
     "Solutions logicielles de gestion d'images médicales, PACS et systèmes d'information radiologique.",
     "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", 2),
    ("c0e30161-162b-4a2e-83f9-8149cd57bc99", "Imagerie médicale", "imagerie-medicale",
     "Équipements d''imagerie de haute précision : échographes, appareils de radiologie et d''endoscopie.",
     "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800", 3),
    ("091c5a7d-7759-4833-8519-e2aefda64c77", "Monitoring & ECG", "monitoring-ecg",
     "Moniteurs multiparamètres, électrocardiographes et oxymètres pour la surveillance continue du patient.",
     "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", 4),
    ("d238ae75-f681-43fd-bc3b-58525c312250", "Dentaire", "dentaire",
     "Matériel dentaire professionnel : fauteuils, turbines, optiques et instruments de précision.",
     "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800", 5),
    ("a013d5dd-fcd2-40c7-b5d7-0b1e8728170e", "Laboratoire", "laboratoire",
     "Centrifugeuses, microscopes, analyseurs et consommables pour les laboratoires d''analyse médicale.",
     "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800", 6),
    ("b9b72642-35b3-417c-90be-8885c8ff5e1c", "Mobilier médical", "mobilier-medical",
     "Tables d''examen, chariots, armoires et mobilier ergonomique pour équiper vos espaces de soin.",
     "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800", 7),
    ("a12684d4-0a16-4f4e-ab64-7b2cf72cca7e", "Accessoires", "accessoires",
     "Pièces de rechange, batteries, câbles et accessoires compatibles pour vos équipements médicaux.",
     "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800", 8),
]


def fix_encoding(text: str) -> str:
    try:
        return text.encode("latin-1").decode("utf-8")
    except Exception:
        return text


def parse_price(raw: str) -> float:
    """'2 100,00 €HT' → 2100.0"""
    cleaned = re.sub(r"[^\d,]", "", raw).replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_stock(status: str, data_1: str) -> int:
    """Return stock quantity. 'En stock'=100, 'Stock bas'→parse N, else 0."""
    if "En stock" in status:
        return 100
    # "Stock bas" with data_1 like "3 restant" or "N restant"
    match = re.search(r"(\d+)", data_1 or "")
    if match:
        return int(match.group(1))
    if "Stock bas" in status:
        return 5
    return 0


def get_category_id(reference: str) -> str:
    ref = reference.upper()
    if ref.startswith("IMG-SW"):
        return CATEGORY_IDS["IMG-SW"]
    for prefix in ("CONS", "IMG", "DM", "DEN", "LAB", "CAB", "ACC"):
        if ref.startswith(prefix):
            return CATEGORY_IDS[prefix]
    return CATEGORY_IDS["ACC"]


def upload_to_cloudinary(image_url: str, public_id: str) -> str:
    """Download image and upload to Cloudinary. Returns secure_url."""
    try:
        resp = requests.get(image_url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        result = cloudinary.uploader.upload(
            resp.content,
            public_id=f"product-images/{public_id}",
            overwrite=True,
            resource_type="image",
        )
        return result["secure_url"]
    except Exception as e:
        print(f"  [WARN] {e}")
        return image_url  # fallback to original URL


def esc(val: str) -> str:
    """Escape single quotes for SQL."""
    return val.replace("'", "''")


def truncate(val: str, max_len: int) -> str:
    return val[:max_len] if len(val) > max_len else val


def read_csv(path: str):
    with open(path, "r", encoding="utf-8-sig") as f:
        raw = f.read()
    reader = csv.DictReader(io.StringIO(raw))
    rows = []
    for row in reader:
        fixed = {k: fix_encoding(v) if isinstance(v, str) else v for k, v in row.items()}
        rows.append(fixed)
    return rows


def main():
    print(f"Reading CSV: {CSV_PATH}")
    rows = read_csv(CSV_PATH)
    print(f"Found {len(rows)} products\n")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    products = []
    product_images = []

    for i, row in enumerate(rows, 1):
        title = truncate(fix_encoding(row.get("title", "")).strip(), 255)
        raw_ref = fix_encoding(row.get("product_reference", "")).strip()
        reference = raw_ref.replace("Référence ", "").replace("Reference ", "").strip()
        raw_price = fix_encoding(row.get("data2", "0")).strip()
        price_ht = parse_price(raw_price)
        price_ttc = round(price_ht * (1 + TVA_RATE / 100), 2)
        stock_status = fix_encoding(row.get("stock_status", "En stock")).strip()
        data_1 = fix_encoding(row.get("data_1", "")).strip()
        stock_qty = parse_stock(stock_status, data_1)
        description = truncate(fix_encoding(row.get("product_description", "")).strip(), 2000)
        image_url = fix_encoding(row.get("image", "")).strip()
        page_link = fix_encoding(row.get("item_page_link", "")).strip()
        slug = page_link.rstrip("/").split("/")[-1] if page_link else f"produit-{i}"

        category_id = get_category_id(reference)
        product_id = str(uuid.uuid4())
        image_id = str(uuid.uuid4())

        safe_title = title.encode("cp1252", errors="replace").decode("cp1252")
        print(f"[{i:3d}/120] {safe_title[:48]:<48} ref={reference}")

        # Upload image to Cloudinary
        cloudinary_url = image_url
        if image_url:
            print(f"           Uploading Cloudinary...", end=" ", flush=True)
            cloudinary_url = upload_to_cloudinary(image_url, slug)
            status_str = "OK" if cloudinary_url != image_url else "FALLBACK"
            print(status_str)

        cloudinary_url = truncate(cloudinary_url, 500)

        products.append({
            "id": product_id,
            "name": title,
            "description": description or f"Produit médical de référence {reference}.",
            "price_ht": price_ht,
            "tva_rate": TVA_RATE,
            "price_ttc": price_ttc,
            "stock_qty": stock_qty,
            "status": "Published",
            "slug": slug,
            "category_id": category_id,
            "created_at": now,
        })

        if cloudinary_url:
            product_images.append({
                "id": image_id,
                "product_id": product_id,
                "image_url": cloudinary_url,
                "is_main": 1,
                "display_order": 0,
                "created_at": now,
            })

    # ── Build seed.sql ────────────────────────────────────────────────────────
    print(f"\nGenerating seed.sql...")
    lines = [
        "-- Auto-generated seed from althea-systems-com-2026-04-10.csv",
        f"-- Generated: {now}",
        "",
        "USE b3;",
        "",
        "-- Delete in FK-safe order",
        "DELETE FROM ProductImages;",
        "DELETE FROM CartItems;",
        "DELETE FROM OrderItems;",
        "DELETE FROM Products;",
        "DELETE FROM Categories;",
        "",
        "-- ── Categories ────────────────────────────────────────────────────────",
        "INSERT INTO Categories (Id, Name, Slug, Description, ImageUrl, ParentId, DisplayOrder, Status, CreatedAt, UpdatedAt) VALUES",
    ]

    cat_rows = []
    for cat_id, name, slug, desc, img, order in CATEGORIES:
        cat_rows.append(
            f"  ('{cat_id}', N'{esc(name)}', '{slug}', N'{esc(desc)}', "
            f"'{img}', NULL, {order}, 'Active', '{now}', '{now}')"
        )
    lines.append(",\n".join(cat_rows) + ";")
    lines.append("")

    # ── Products ──────────────────────────────────────────────────────────────
    lines.append("-- ── Products ─────────────────────────────────────────────────────────────")
    lines.append(
        "INSERT INTO Products "
        "(Id, Name, Description, PriceHt, TvaRate, PriceTtc, StockQuantity, Status, Slug, CategoryId, CreatedAt, UpdatedAt) VALUES"
    )
    prod_rows = []
    for p in products:
        prod_rows.append(
            f"  ('{p['id']}', N'{esc(p['name'])}', N'{esc(p['description'])}', "
            f"{p['price_ht']:.2f}, {p['tva_rate']:.2f}, {p['price_ttc']:.2f}, "
            f"{p['stock_qty']}, '{p['status']}', '{esc(p['slug'])}', "
            f"'{p['category_id']}', '{p['created_at']}', '{p['created_at']}')"
        )
    lines.append(",\n".join(prod_rows) + ";")
    lines.append("")

    # ── ProductImages ─────────────────────────────────────────────────────────
    if product_images:
        lines.append("-- ── ProductImages ────────────────────────────────────────────────────────")
        lines.append(
            "INSERT INTO ProductImages (Id, ProductId, ImageUrl, IsMain, DisplayOrder, CreatedAt) VALUES"
        )
        img_rows = []
        for img in product_images:
            img_rows.append(
                f"  ('{img['id']}', '{img['product_id']}', '{esc(img['image_url'])}', "
                f"{img['is_main']}, {img['display_order']}, '{img['created_at']}')"
            )
        lines.append(",\n".join(img_rows) + ";")
        lines.append("")

    lines.append("SELECT 'Categories: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Categories;")
    lines.append("SELECT 'Products: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Products;")
    lines.append("SELECT 'ProductImages: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM ProductImages;")

    sql_content = "\n".join(lines)
    seed_path = os.path.abspath(SEED_PATH)
    with open(seed_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"Written: {seed_path}")

    # ── Execute against SQL Server container ──────────────────────────────────
    print(f"\nCopying seed.sql into container {CONTAINER}...")
    result = subprocess.run(
        ["docker", "cp", seed_path, f"{CONTAINER}:/tmp/seed.sql"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"[ERROR] docker cp: {result.stderr}")
        sys.exit(1)
    print("Copied OK")

    print("Executing seed.sql via sqlcmd...")
    result = subprocess.run(
        [
            "docker", "exec", CONTAINER,
            SQLCMD, "-S", "localhost", "-U", "sa", "-P", SA_PWD,
            "-i", "/tmp/seed.sql", "-C",
        ],
        capture_output=True, text=True,
    )
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(f"[STDERR] {result.stderr}")
    if result.returncode != 0:
        print(f"[ERROR] sqlcmd exited {result.returncode}")
        sys.exit(1)

    print("\nDone! Seed executed successfully.")


if __name__ == "__main__":
    main()
