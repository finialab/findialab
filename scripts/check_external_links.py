#!/usr/bin/env python3
"""Check external links used by the site's HTML guides."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
URL_PATTERN = re.compile(r'href="(https?://[^"]+)"')
OWN_DOMAIN = "https://findialab.me"
PROTECTED_STATUSES = {401, 403, 429}


def collect_urls() -> set[str]:
    urls: set[str] = set()
    for path in (ROOT / "guias").rglob("index.html"):
        text = path.read_text(encoding="utf-8")
        for match in URL_PATTERN.finditer(text):
            url = match.group(1).replace("&amp;", "&")
            if not url.startswith(OWN_DOMAIN):
                urls.add(url)
    return urls


def check_url(url: str) -> tuple[str, str]:
    request = Request(
        url,
        headers={"User-Agent": "FindIA-Link-Checker/1.0"},
        method="HEAD",
    )
    try:
        with urlopen(request, timeout=20) as response:
            return "ok", str(response.status)
    except HTTPError as error:
        if error.code in PROTECTED_STATUSES:
            return "protected", str(error.code)
        if error.code in {404, 410}:
            return "broken", str(error.code)
        return "warning", str(error.code)
    except (TimeoutError, URLError, OSError) as error:
        return "broken", type(error).__name__


def main() -> int:
    urls = sorted(collect_urls())
    broken: list[tuple[str, str]] = []
    protected = 0
    warnings = 0

    for url in urls:
        state, detail = check_url(url)
        if state == "broken":
            broken.append((detail, url))
        elif state == "protected":
            protected += 1
        elif state == "warning":
            warnings += 1

    print(f"Checked {len(urls)} unique external URLs.")
    print(f"Protected responses (accepted): {protected}")
    print(f"Other warnings: {warnings}")
    print(f"Broken links: {len(broken)}")
    for detail, url in broken:
        print(f"{detail}\t{url}")

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
