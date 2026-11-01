#!/usr/bin/env python3
"""Check external links used by the site's HTML guides.

Only confirmed missing resources (HTTP 404/410) fail the check. A timeout,
rate limit, authentication wall, or server error is reported separately:
it is not evidence that the referenced page has been removed.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
URL_PATTERN = re.compile(r'href="(https?://[^"]+)"')
OWN_DOMAIN = "https://findialab.me"
PROTECTED_STATUSES = {401, 403}
INCONCLUSIVE_STATUSES = {408, 425, 429, 500, 502, 503, 504}
MISSING_STATUSES = {404, 410}


def collect_urls() -> set[str]:
    urls: set[str] = set()
    for path in ROOT.rglob("*.html"):
        if path.name in {"404.html", "buscar.html"}:
            continue
        text = path.read_text(encoding="utf-8")
        for match in URL_PATTERN.finditer(text):
            url = match.group(1).replace("&amp;", "&")
            if not url.startswith(OWN_DOMAIN):
                urls.add(url)
    return urls


def check_url(url: str) -> tuple[str, str]:
    request = Request(
        url,
        headers={"User-Agent": "FindIA-Link-Checker/1.1"},
        method="HEAD",
    )
    try:
        with urlopen(request, timeout=20) as response:
            return "ok", str(response.status)
    except HTTPError as error:
        if error.code in MISSING_STATUSES:
            return "broken", str(error.code)
        if error.code in PROTECTED_STATUSES:
            return "protected", str(error.code)
        if error.code in INCONCLUSIVE_STATUSES:
            return "inconclusive", str(error.code)
        return "warning", str(error.code)
    except (TimeoutError, URLError, OSError) as error:
        # HEAD timeouts and connection-level failures are inconclusive:
        # they do not prove that the destination URL returns 404 or 410.
        detail = "timeout" if isinstance(error, TimeoutError) else type(error).__name__
        if isinstance(error, URLError) and isinstance(error.reason, TimeoutError):
            detail = "timeout"
        return "inconclusive", detail


def main() -> int:
    urls = sorted(collect_urls())
    broken: list[tuple[str, str]] = []
    protected = 0
    warnings: list[tuple[str, str]] = []
    inconclusive: list[tuple[str, str]] = []

    for url in urls:
        state, detail = check_url(url)
        if state == "broken":
            broken.append((detail, url))
        elif state == "protected":
            protected += 1
        elif state == "inconclusive":
            inconclusive.append((detail, url))
        elif state == "warning":
            warnings.append((detail, url))

    print(f"Checked {len(urls)} unique external URLs.")
    print(f"Protected responses (not publicly readable): {protected}")
    print(f"Inconclusive network responses (not treated as broken): {len(inconclusive)}")
    print(f"Other HTTP warnings: {len(warnings)}")
    print(f"Confirmed broken links (HTTP 404/410): {len(broken)}")

    for detail, url in inconclusive:
        print(f"INCONCLUSIVE\t{detail}\t{url}")
    for detail, url in warnings:
        print(f"WARNING\t{detail}\t{url}")
    for detail, url in broken:
        print(f"BROKEN\t{detail}\t{url}")

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
