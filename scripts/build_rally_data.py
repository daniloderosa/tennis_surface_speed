"""
Produce rally_length_by_tournament.json
Fonte: charting-m-stats-Rally.csv (Match Charting Project, JeffSackmann)
Logica:
  - Filtra partite 2023-2025
  - Calcola rally length media pesata per partita (midpoint per range: 2, 5, 8, 12)
  - Aggrega per torneo
  - Join con surface_speed_current.json
"""

import csv, json, re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent.parent
RALLY_CSV    = ROOT / "static/data/charting-m-stats-Rally.csv"
MATCHES_CSV  = ROOT / "static/data/charting-m-matches.csv"
SPEED_JSON   = ROOT / "src/lib/data/surface_speed_current.json"
OUT_JSON     = ROOT / "src/lib/data/rally_length_by_tournament.json"
OUT_JSON_2025 = ROOT / "src/lib/data/rally_length_by_tournament_2025.json"
OUT_YEARLY   = ROOT / "src/lib/data/rally_length_by_year_surface.json"

# Midpoint per range di rally
MIDPOINTS = {"1-3": 2, "4-6": 5, "7-9": 8, "10": 12}

# -------------------------------------------------------------------
# 1. Carica i dati di velocità
# -------------------------------------------------------------------
with open(SPEED_JSON, encoding="utf-8") as f:
    speed_data = json.load(f)

speed_lookup = {d["tournament"]: d for d in speed_data}

# -------------------------------------------------------------------
# 2. Normalizzazione nomi torneo (Match Charting → surface_speed)
# -------------------------------------------------------------------
NAME_MAP = {
    # Grand Slam
    "Australian_Open":        "Australian Open",
    "Roland_Garros":          "Roland Garros",
    "Wimbledon":              "Wimbledon",
    "US_Open":                "US Open",
    # Masters 1000 — nomi esatti dal CSV (con underscore e suffisso)
    "Indian_Wells_Masters":   "Indian Wells Masters 2025",
    "Miami_Masters":          "Miami Masters",
    "Monte_Carlo_Masters":    "Monte Carlo Masters",
    "Madrid_Masters":         "Madrid Masters",
    "Rome_Masters":           "Rome Masters",
    "Canada_Masters":         "Canada Masters",
    "Cincinnati_Masters":     "Cincinnati Masters",
    "Shanghai_Masters":       "Shanghai Masters",
    "Paris_Masters":          "Paris Masters",
    # ATP Finals / speciali
    "Tour_Finals":            "Tour Finals",
    "NextGen_Finals":         "Next Gen Finals",
    "United_Cup":             "United Cup",
    # Erba
    "Halle":                  "Halle",
    "Queens_Club":            "Queen's Club",
    "s_Hertogenbosch":        "s-Hertogenbosch",
    "Stuttgart":              "Stuttgart",
    "Mallorca":               "Mallorca",
    "Eastbourne":             "Eastbourne",
    # Hard
    "Brisbane":               "Brisbane",
    "Dubai":                  "Dubai",
    "Doha":                   "Doha",
    "Rotterdam":              "Rotterdam",
    "Dallas":                 "Dallas",
    "Montpellier":            "Montpellier",
    "Metz":                   "Metz",
    "Hong_Kong":              "Hong Kong",
    "Almaty":                 "Almaty",
    "Adelaide":               "Adelaide",
    "Auckland":               "Auckland",
    "Acapulco":               "Acapulco",
    "Washington":             "Washington",
    "Winston_Salem":          "Winston-Salem",
    "Vienna":                 "Vienna",
    "Stockholm":              "Stockholm",
    "Basel":                  "Basel",
    "Beijing":                "Beijing",
    "Tokyo":                  "Tokyo",
    "Hangzhou":               "Hangzhou",
    "Chengdu":                "Chengdu",
    "Athens":                 "Athens",
    "Delray_Beach":           "Delray Beach",
    "Brussels":               "Brussels",
    "Los_Cabos":              "Los Cabos",
    # Terra
    "Buenos_Aires":           "Buenos Aires",
    "Rio_de_Janeiro":         "Rio de Janeiro",
    "Houston":                "Houston",
    "Barcelona":              "Barcelona",
    "Munich":                 "Munich",
    "Geneva":                 "Geneva",
    "Hamburg":                "Hamburg",
    "Gstaad":                 "Gstaad",
    "Bastad":                 "Bastad",
    "Umag":                   "Umag",
    "Kitzbuhel":              "Kitzbuhel",
    "Bucharest":              "Bucharest",
    "Marrakech":              "Marrakech",
    "Santiago":               "Santiago",
}

def extract_tournament(match_id):
    """Estrae il nome torneo dal match_id (formato: YYYYMMDD-M-Tournament-Round-P1-P2)."""
    parts = match_id.split("-")
    if len(parts) < 3:
        return None
    # Il torneo è il terzo elemento (index 2)
    return parts[2]

def normalize_name(raw):
    """Mappa il nome grezzo al nome in surface_speed_current.json."""
    return NAME_MAP.get(raw)

# -------------------------------------------------------------------
# 3. Aggrega rally length per torneo (2023-2025)
# -------------------------------------------------------------------
# struttura: {tournament_raw: {match_id: {range: pts}}}
match_data = defaultdict(lambda: defaultdict(dict))

with open(RALLY_CSV, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        mid = row["match_id"]

        # Filtra per anno
        year_str = mid[:4]
        if not year_str.isdigit() or not (2023 <= int(year_str) <= 2025):
            continue

        # Solo righe con range (non server breakdown come 1-3-1, 1-3-2)
        r = row["row"]
        if r not in MIDPOINTS:
            continue

        tourn_raw = extract_tournament(mid)
        if not tourn_raw:
            continue

        pts = int(row["pts"]) if row["pts"].isdigit() else 0
        # Accumula per match (somma server + returner)
        match_data[tourn_raw][mid][r] = match_data[tourn_raw][mid].get(r, 0) + pts

# -------------------------------------------------------------------
# 4. Calcola media pesata per torneo
# -------------------------------------------------------------------
tournament_rally = {}

for tourn_raw, matches in match_data.items():
    total_numerator = 0
    total_pts = 0

    for mid, ranges in matches.items():
        match_pts = sum(ranges.values())
        if match_pts == 0:
            continue
        match_num = sum(MIDPOINTS[r] * p for r, p in ranges.items())
        total_numerator += match_num
        total_pts += match_pts

    if total_pts == 0:
        continue

    avg = round(total_numerator / total_pts, 2)
    normalized = normalize_name(tourn_raw)
    if normalized:
        tournament_rally[normalized] = {"rally_avg": avg, "n_matches": len(matches)}

# -------------------------------------------------------------------
# 5. Join con surface_speed_current.json
# -------------------------------------------------------------------
result = []
matched = 0
unmatched = []

for d in speed_data:
    name = d["tournament"]
    if name in tournament_rally:
        result.append({
            "tournament": name,
            "surface":    d["surface"],
            "speed":      d["speed"],
            "rally_avg":  tournament_rally[name]["rally_avg"],
            "n_matches":  tournament_rally[name]["n_matches"]
        })
        matched += 1
    else:
        unmatched.append(name)

match_pct = matched / len(speed_data) * 100
print(f"Join: {matched}/{len(speed_data)} tornei ({match_pct:.0f}%)")
if unmatched:
    print(f"Non trovati ({len(unmatched)}):", ", ".join(unmatched))

# -------------------------------------------------------------------
# 6. Salva
# -------------------------------------------------------------------
if match_pct >= 70:
    result.sort(key=lambda x: x["speed"], reverse=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Salvato: {OUT_JSON}")
else:
    print("ATTENZIONE: join < 70% — verifica NAME_MAP e usa solo speed data per la sezione 2.")

# -------------------------------------------------------------------
# 7. Versione 2025-only per lo scatterplot
# -------------------------------------------------------------------
print("\n─── Sezione 1b: rally length per torneo (solo 2025) ───")

match_data_2025 = defaultdict(lambda: defaultdict(dict))

with open(RALLY_CSV, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        mid = row["match_id"]
        year_str = mid[:4]
        if not year_str.isdigit() or int(year_str) != 2025:
            continue
        r = row["row"]
        if r not in MIDPOINTS:
            continue
        tourn_raw = extract_tournament(mid)
        if not tourn_raw:
            continue
        pts = int(row["pts"]) if row["pts"].isdigit() else 0
        match_data_2025[tourn_raw][mid][r] = match_data_2025[tourn_raw][mid].get(r, 0) + pts

tournament_rally_2025 = {}
for tourn_raw, matches in match_data_2025.items():
    total_numerator = 0
    total_pts = 0
    for mid, ranges in matches.items():
        match_pts = sum(ranges.values())
        if match_pts == 0:
            continue
        match_num = sum(MIDPOINTS[r] * p for r, p in ranges.items())
        total_numerator += match_num
        total_pts += match_pts
    if total_pts == 0:
        continue
    avg = round(total_numerator / total_pts, 2)
    normalized = normalize_name(tourn_raw)
    if normalized:
        tournament_rally_2025[normalized] = {"rally_avg": avg, "n_matches": len(matches)}

result_2025 = []
matched_2025 = 0
for d in speed_data:
    name = d["tournament"]
    if name in tournament_rally_2025:
        result_2025.append({
            "tournament": name,
            "surface":    d["surface"],
            "speed":      d["speed"],
            "rally_avg":  tournament_rally_2025[name]["rally_avg"],
            "n_matches":  tournament_rally_2025[name]["n_matches"],
        })
        matched_2025 += 1

match_pct_2025 = matched_2025 / len(speed_data) * 100
print(f"Join 2025: {matched_2025}/{len(speed_data)} tornei ({match_pct_2025:.0f}%)")
result_2025.sort(key=lambda x: x["speed"], reverse=True)
with open(OUT_JSON_2025, "w", encoding="utf-8") as f:
    json.dump(result_2025, f, ensure_ascii=False, indent=2)
print(f"Salvato: {OUT_JSON_2025}")

# ===================================================================
# SEZIONE 2 — Rally length per anno e superficie (tutti gli anni)
# Metodo: media pesata — ogni punto conta ugualmente (più corretto
# della media delle medie che tratta ogni match come uguale
# indipendentemente da quanti punti contiene).
# Formula: Σ(midpoint × n_punti) / Σ(n_punti) per anno+superficie
# ===================================================================

print("\n─── Sezione 2: rally length per anno e superficie ───")

if not MATCHES_CSV.exists():
    print(f"ATTENZIONE: {MATCHES_CSV} non trovato.")
    print("Scarica il file da:")
    print("  https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/charting-m-matches.csv")
    print("e salvalo in static/data/charting-m-matches.csv")
else:
    SURFACES_KEEP = {"Hard", "Clay", "Grass"}

    # -------------------------------------------------------------------
    # 1. Carica metadata partite: match_id → {year, surface}
    # -------------------------------------------------------------------
    match_meta = {}
    with open(MATCHES_CSV, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mid = row.get("match_id", "").strip()
            if not mid or len(mid) < 4 or not mid[:4].isdigit():
                continue
            year    = int(mid[:4])
            surface = row.get("Surface", "").strip()
            if surface not in SURFACES_KEEP:
                continue
            match_meta[mid] = {"year": year, "surface": surface}

    print(f"Match con superficie valida (Hard/Clay/Grass): {len(match_meta)}")

    # -------------------------------------------------------------------
    # 2. Aggrega punti per (year, surface) — media pesata
    # -------------------------------------------------------------------
    # Struttura: (year, surface) → {numerator, total_pts, matches}
    yearly = defaultdict(lambda: {"numerator": 0.0, "total_pts": 0, "matches": set()})

    with open(RALLY_CSV, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mid = row["match_id"]
            r   = row["row"]
            if r not in MIDPOINTS or mid not in match_meta:
                continue
            pts = int(row["pts"]) if row["pts"].isdigit() else 0
            if pts == 0:
                continue
            key = (match_meta[mid]["year"], match_meta[mid]["surface"])
            yearly[key]["numerator"]  += MIDPOINTS[r] * pts
            yearly[key]["total_pts"]  += pts
            yearly[key]["matches"].add(mid)

    # -------------------------------------------------------------------
    # 3. Calcola media e salva
    # -------------------------------------------------------------------
    yearly_result = []
    for (year, surface), agg in sorted(yearly.items()):
        if agg["total_pts"] == 0:
            continue
        yearly_result.append({
            "year":      year,
            "surface":   surface,
            "rally_avg": round(agg["numerator"] / agg["total_pts"], 2),
            "n_matches": len(agg["matches"]),
        })

    with open(OUT_YEARLY, "w", encoding="utf-8") as f:
        json.dump(yearly_result, f, ensure_ascii=False, indent=2)

    if not yearly_result:
        print("ATTENZIONE: nessun dato prodotto — verifica le colonne del CSV.")
    else:
        years = [r["year"] for r in yearly_result]
        print(f"Anni coperti: {min(years)}–{max(years)}")
        print(f"Record totali: {len(yearly_result)} (anno × superficie)")
        print(f"Salvato: {OUT_YEARLY}")
