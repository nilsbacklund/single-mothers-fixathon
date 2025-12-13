def rank_schemes(schemes):
    return sorted(
        schemes,
        key=lambda s: s["money"] - 0.2 * s["time"],
        reverse=True
    )
