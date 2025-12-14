import requests
from bs4 import BeautifulSoup
from pathlib import Path

DATA_DIR = Path("pages")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def clean_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text(separator=" ")
    return " ".join(text.split())

def fetch_all():
    with open("sources.txt") as f:
        urls = [u.strip() for u in f if u.strip()]

    for url in urls:
        print(f"Fetching {url}")
        r = requests.get(url, timeout=15)
        r.raise_for_status()

        text = clean_html(r.text)

        fname = url.replace("https://", "").replace("/", "_")
        Path(DATA_DIR / f"{fname}.txt").write_text(text, encoding="utf-8")

if __name__ == "__main__":
    fetch_all()
