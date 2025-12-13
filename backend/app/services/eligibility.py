import json
from pathlib import Path

SCHEMES = json.loads(Path("app/data/schemes.json").read_text())

def check_eligibility(profile: dict):
    results = []

    for s in SCHEMES:
        eligible = True

        if "max_income_year" in s["eligibility"]:
            income = profile.get("monthly_income")
            if income and income * 12 > s["eligibility"]["max_income_year"]:
                eligible = False

        if s["type"] == "municipal":
            if profile.get("municipality", "").lower() != s["municipality"]:
                eligible = False

        if eligible:
            results.append({
                "id": s["id"],
                "name": s["name"],
                "money": s["money_eur_per_month"],
                "time": s["time_to_apply_min"]
            })

    return results
