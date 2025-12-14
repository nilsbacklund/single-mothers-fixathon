def rank_schemes(schemes):
    def score(s):
        money = s.get("money")
        time = s.get("time")

        # Defaults for missing data
        money = money if isinstance(money, (int, float)) else 0
        time = time if isinstance(time, (int, float)) else 60  # assume 1 hour

        return money - 0.2 * time

    return sorted(schemes, key=score, reverse=True)
