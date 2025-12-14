"""
subsidy_ranker.py

Library-style functions to:
1) Filter a municipal regulation/subsidy index CSV for a given user profile
2) (Optionally) call an OpenAI-compatible LLM to rank + summarize the best matches

Designed for backend integration (e.g., FastAPI) where you call functions with arguments
instead of using CLI flags.

Expected CSV columns (best-effort; missing columns are handled gracefully):
- title, url, municipality, category, year, doc_type
- single_parent_relevant, mentions_single_parent_explicitly
- single_parent_signals, benefit_signals, eligibility_signals, application_data_signals
- eligibility_snippet, application_snippet
- cvdr_id (optional)

"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from difflib import get_close_matches
from typing import Any, Dict, Iterable, List, Optional, Tuple

import pandas as pd

# -----------------------------
# Data models
# -----------------------------
@dataclass
class UserProfile:
    is_single_parent: bool
    children_u18: Optional[int] = None
    net_income_monthly_eur: Optional[float] = None
    assets_savings_eur: Optional[float] = None
    municipality: str = ""


@dataclass
class RankedItem:
    rank: int
    score: float  # 0-100 (LLM)
    title: str
    municipality: str
    category: str
    year: Optional[int]
    url: str
    benefit_summary: str
    eligibility_summary: str
    required_data_or_documents: List[str]
    why_relevant: str
    confidence: str  # "high" / "medium" / "low"
    # Optional passthrough metadata
    cvdr_id: Optional[str] = None
    doc_type: Optional[str] = None


# -----------------------------
# Utils
# -----------------------------
def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def parse_signals(cell: Any) -> List[str]:
    """
    CSV signal columns store comma-separated strings. Returns normalized list.
    """
    if cell is None:
        return []
    if isinstance(cell, float) and pd.isna(cell):
        return []
    s = str(cell).strip()
    if not s:
        return []
    return [x.strip().lower() for x in s.split(",") if x.strip()]


def _safe_col(df: pd.DataFrame, col: str, default: Any = "") -> pd.Series:
    if col in df.columns:
        return df[col]
    return pd.Series([default] * len(df), index=df.index)


def _safe_bool_col(df: pd.DataFrame, col: str) -> pd.Series:
    if col not in df.columns:
        return pd.Series([False] * len(df), index=df.index)
    s = df[col]
    # Accept booleans, 0/1, "true"/"false"
    if s.dtype == bool:
        return s.fillna(False)
    return s.fillna(False).map(lambda x: str(x).strip().lower() in ("1", "true", "yes", "y"))


def contains_any(text: str, keywords: Iterable[str]) -> bool:
    t = _norm(text)
    return any(k in t for k in keywords)


# -----------------------------
# Municipality matching
# -----------------------------
def filter_by_municipality(
    df: pd.DataFrame, municipality: str, *, fuzzy: bool = True
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Returns (filtered_df, suggestions_if_empty).
    Matching strategy:
      1) exact match on normalized municipality
      2) substring contains
      3) (optional) fuzzy suggestions
    """
    target = _norm(municipality).replace("gemeente ", "")
    if not target:
        return df.copy(), []

    munis = _safe_col(df, "municipality", "").fillna("").map(lambda x: _norm(str(x)).replace("gemeente ", ""))

    exact = df[munis == target]
    if len(exact) > 0:
        return exact.copy(), []

    partial = df[munis.str.contains(re.escape(target), na=False)]
    if len(partial) > 0:
        return partial.copy(), []

    if not fuzzy:
        return df.iloc[0:0].copy(), []

    unique_munis = sorted({m for m in munis.unique().tolist() if m})
    suggestions = get_close_matches(target, unique_munis, n=10, cutoff=0.6)
    return df.iloc[0:0].copy(), suggestions


# -----------------------------
# Prefilter & candidate scoring
# -----------------------------
def quick_relevance_score(row: pd.Series, profile: UserProfile) -> float:
    """
    Lightweight heuristic used ONLY to pick top-N candidates to send to the LLM.
    """
    score = 0.0

    title = str(row.get("title", "") or "")
    benefit = " ".join(parse_signals(row.get("benefit_signals")))
    sp = " ".join(parse_signals(row.get("single_parent_signals")))
    elig = " ".join(parse_signals(row.get("eligibility_signals")))
    app = " ".join(parse_signals(row.get("application_data_signals")))

    mun = _norm(str(row.get("municipality", "") or ""))
    if profile.municipality and _norm(profile.municipality).replace("gemeente ", "") in mun:
        score += 2.0

    if bool(row.get("mentions_single_parent_explicitly")):
        score += 3.0
    if bool(row.get("single_parent_relevant")):
        score += 1.5
    if profile.is_single_parent and ("alleenstaande ouder" in sp or "eenouder" in sp):
        score += 2.0

    if profile.children_u18 > 0:
        child_kw = ["kind", "kinderen", "jeugd", "leerling", "school", "kinderopvang", "gezins"]
        if contains_any(title, child_kw) or contains_any(benefit, child_kw) or contains_any(sp, child_kw):
            score += 2.0

    money_kw = ["bijzondere bijstand", "inkomenstoeslag", "participatie", "tegemoetkoming", "kinderopvang", "schoolkosten"]
    if any(k in benefit for k in money_kw) or any(k in title.lower() for k in money_kw):
        score += 1.0

    year = row.get("year")
    try:
        y = int(year)
        if y >= 2025:
            score += 1.0
        elif y >= 2023:
            score += 0.5
    except Exception:
        pass

    if elig:
        score += 0.2
    if app:
        score += 0.2

    return score


def prefilter_candidates(
    df: pd.DataFrame,
    profile: UserProfile,
    *,
    require_municipality_match: bool = True,
    max_candidates: int = 60,
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Main "fast filter" you can call from your API.

    Returns:
      (candidates_df_sorted, municipality_suggestions_if_empty)

    Notes:
      - If require_municipality_match=True, this will first filter to the specified municipality.
        If no match, candidates_df will be empty and suggestions populated.
      - Then filters by single-parent relevance (if is_single_parent)
      - Then filters by children-related (if children_u18 > 0)
      - Then sorts by a quick heuristic score and truncates to max_candidates
    """
    base = df

    suggestions: List[str] = []
    if require_municipality_match and profile.municipality:
        base, suggestions = filter_by_municipality(base, profile.municipality, fuzzy=True)
        if len(base) == 0:
            return base.copy(), suggestions

    # Ensure boolean cols exist
    base = base.copy()
    if "single_parent_relevant" not in base.columns:
        base["single_parent_relevant"] = False
    if "mentions_single_parent_explicitly" not in base.columns:
        base["mentions_single_parent_explicitly"] = False

    # Single parent filter
    if profile.is_single_parent:
        sp_signals = _safe_col(base, "single_parent_signals", "").fillna("")
        mask = (
            _safe_bool_col(base, "single_parent_relevant")
            | _safe_bool_col(base, "mentions_single_parent_explicitly")
            | sp_signals.str.contains("alleenstaande ouder|eenouder", case=False, regex=True)
        )
        base = base[mask].copy()

    # Children-related filter
    if profile.children_u18 is None:
        profile.children_u18 = 0
    if profile.children_u18 > 0:
        child_regex = r"kind|kinderen|jeugd|leerling|school|kinderopvang|gezins"
        title = _safe_col(base, "title", "").fillna("")
        benefit = _safe_col(base, "benefit_signals", "").fillna("")
        sp_signals = _safe_col(base, "single_parent_signals", "").fillna("")
        mask = (
            title.str.contains(child_regex, case=False, regex=True)
            | benefit.str.contains(child_regex, case=False, regex=True)
            | sp_signals.str.contains(child_regex, case=False, regex=True)
        )
        base = base[mask].copy()

    # Score + top-N
    base["_prefilter_score"] = base.apply(lambda r: quick_relevance_score(r, profile), axis=1)
    base = base.sort_values("_prefilter_score", ascending=False).head(max_candidates).copy()

    return base, suggestions


def candidates_for_llm(candidates_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Converts the candidate dataframe into a compact list of dicts for LLM input.
    """
    out: List[Dict[str, Any]] = []
    for _, r in candidates_df.iterrows():
        year = r.get("year", None)
        year_val: Optional[int] = None
        try:
            if year is not None and str(year).isdigit():
                year_val = int(year)
        except Exception:
            year_val = None

        out.append(
            {
                "title": r.get("title"),
                "municipality": r.get("municipality"),
                "category": r.get("category"),
                "year": year_val,
                "doc_type": r.get("doc_type"),
                "benefit_signals": parse_signals(r.get("benefit_signals")),
                "eligibility_signals": parse_signals(r.get("eligibility_signals")),
                "application_data_signals": parse_signals(r.get("application_data_signals")),
                "eligibility_snippet": r.get("eligibility_snippet"),
                "application_snippet": r.get("application_snippet"),
                "url": r.get("url"),
                "cvdr_id": r.get("cvdr_id"),
            }
        )
    return out


# -----------------------------
# LLM ranking
# -----------------------------
def rank_with_llm(
    llm_candidates: List[Dict[str, Any]],
    profile: UserProfile,
    *,
    model: str,
    api_key: str,
    base_url: Optional[str] = None,
    top_k: int = 15,
    temperature: float = 0.2,
) -> List[RankedItem]:
    """
    OpenAI-compatible chat completion call that ranks and summarizes candidates.

    You can use this with:
      - OpenAI (default base_url)
      - GreenPT or any compatible provider by passing base_url

    Returns a list of RankedItem objects sorted by rank ascending.
    """
    from openai import OpenAI  # type: ignore

    client = OpenAI(api_key=api_key, base_url=base_url)

    payload = {
        "user_profile": {
            "is_single_parent": profile.is_single_parent,
            "children_u18": profile.children_u18,
            "net_income_monthly_eur": profile.net_income_monthly_eur,
            "assets_savings_eur": profile.assets_savings_eur,
            "municipality": profile.municipality,
        },
        "candidates": llm_candidates,
        "instructions": {
            "output_format": "json",
            "max_results": top_k,
            "ranking_goal": "Most likely applicable and valuable support/subsidies for the user",
            "grounding_rule": "Use only the provided fields/snippets; if uncertain, say so.",
        },
    }

    system = (
        "You are a careful assistant that helps people find municipal support/subsidies in the Netherlands. "
        "You will be given a user profile and candidate regulation summaries/snippets. "
        "Rank the candidates by likely applicability and usefulness for this user. "
        "Do NOT hallucinate details. If eligibility requirements are not clearly stated in the snippet, say 'unknown'. "
        "Prefer more recent rules if everything else is equal.\n\n"
        "Return ONLY valid JSON as a list of objects with fields:\n"
        "rank (int), score (0-100 float), title (string), municipality (string), category (string), year (int|null), url (string),\n"
        "benefit_summary (string), eligibility_summary (string), required_data_or_documents (array of strings), why_relevant (string), confidence ('high'|'medium'|'low'),\n"
        "cvdr_id (string|null), doc_type (string|null)."
    )

    user = "Here is the data:\n" + json.dumps(payload, ensure_ascii=False)

    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": system}, {"role": "user", "content": user}],
        temperature=temperature,
    )

    text = resp.choices[0].message.content or ""

    # Parse JSON robustly (some models wrap it)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"(\[.*\])", text, flags=re.DOTALL)
        if not m:
            raise RuntimeError("LLM did not return JSON. Raw output:\n" + text)
        data = json.loads(m.group(1))

    ranked: List[RankedItem] = []
    for obj in data:
        ranked.append(
            RankedItem(
                rank=int(obj.get("rank")),
                score=float(obj.get("score")),
                title=str(obj.get("title", "")),
                municipality=str(obj.get("municipality", "")),
                category=str(obj.get("category", "")),
                year=(int(obj["year"]) if obj.get("year") not in (None, "", "null") else None),
                url=str(obj.get("url", "")),
                benefit_summary=str(obj.get("benefit_summary", "")),
                eligibility_summary=str(obj.get("eligibility_summary", "")),
                required_data_or_documents=list(obj.get("required_data_or_documents", []) or []),
                why_relevant=str(obj.get("why_relevant", "")),
                confidence=str(obj.get("confidence", "low")),
                cvdr_id=(str(obj.get("cvdr_id")) if obj.get("cvdr_id") not in (None, "", "null") else None),
                doc_type=(str(obj.get("doc_type")) if obj.get("doc_type") not in (None, "", "null") else None),
            )
        )

    ranked.sort(key=lambda x: x.rank)
    return ranked


# -----------------------------
# Convenience: one-call pipeline
# -----------------------------
def filter_then_rank(
    df: pd.DataFrame,
    profile: UserProfile,
    *,
    model: str,
    api_key: str,
    base_url: Optional[str] = None,
    max_candidates: int = 60,
    top_k: int = 15,
) -> Dict[str, Any]:
    """
    One-call pipeline for your backend:
      - prefilter_candidates
      - candidates_for_llm
      - rank_with_llm

    Returns a dict with:
      - "ranked": list[dict]
      - "candidates_used": int
      - "municipality_suggestions": list[str]
    """
    candidates_df, suggestions = prefilter_candidates(
        df, profile, require_municipality_match=True, max_candidates=max_candidates
    )
    print(f"Prefiltered to {len(candidates_df)} candidates. Municipality suggestions: {suggestions}")
    if len(candidates_df) == 0:
        return {"ranked": [], "candidates_used": 0, "municipality_suggestions": suggestions}

    llm_items = candidates_for_llm(candidates_df)
    print(f"Sending {len(llm_items)} candidates to LLM for ranking...")
    ranked_items = rank_with_llm(
        llm_items,
        profile,
        model=model,
        api_key=api_key,
        base_url=base_url,
        top_k=top_k,
    )
    print(len(ranked_items))
    return {
        "ranked": [asdict(x) for x in ranked_items],
        "candidates_used": len(llm_items),
        "municipality_suggestions": [],
    }
