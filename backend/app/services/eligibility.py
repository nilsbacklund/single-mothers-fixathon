import json
from pathlib import Path

SCHEMES = json.loads(Path("app/data/schemes.json").read_text())

def check_eligibility(profile: dict):
    results = []

    for s in SCHEMES:
        eligible = True
        rules = s.get("eligibility", {})

        # Income rule
        max_income = rules.get("max_income_year")
        if max_income is not None:
            income = profile.get("monthly_income")
            if income is None or income * 12 > max_income:
                eligible = False

        # Rent rule (if present)
        max_rent = rules.get("max_rent")
        if max_rent is not None:
            rent = profile.get("rent_amount")
            if rent is None or rent > max_rent:
                eligible = False

        if not eligible:
            continue

        results.append({
            "id": s.get("id"),
            "name": s.get("name"),
            "money": s.get("money_eur_per_month"),
            "time": s.get("time_to_apply_min"),
            "required_fields": s.get("required_fields", []),
        })

    return results
