# amz_scraper.py
from __future__ import annotations

import time
import re
import random
import os
import csv
import json
from dataclasses import dataclass, asdict, is_dataclass
from typing import List, Optional, Dict, Any, Iterable, Tuple, Callable

from bs4 import BeautifulSoup, Tag

# Optional deps: installed only if you actually use them.
try:
    from fake_headers import Headers as FakeHeaders  # pip install fake-headers html5lib bs4
except Exception:
    FakeHeaders = None

try:
    from requests_tor import RequestsTor  # pip install requests_tor
except Exception:
    RequestsTor = None  # handled below

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# -----------------------------
# Selectors
# -----------------------------
DEFAULT_SELECTORS: Dict[str, Any] = {
    "navbar": {
        "search_result_input": "#twotabsearchtextbox",
        "search_button": "#nav-search-submit-button",
        "zipcode": {
            "open_zipcode": "#nav-global-location-popover-link",
            "zipcode_input": "#GLUXZipUpdateInput",
            "apply_button": "#GLUXZipUpdate-announce",
            "done_button": "#a-autoid-51-announce",
        },
    },
    "page_result_products": {
        "product_container": ".a-section.a-spacing-base.desktop-grid-content-view",
        "price": '[data-a-size="xl"]',
        "is_coupon_exist": ".a-size-base.s-highlighted-text-padding.s-coupon-highlight-color.aok-inline-block",
        "product_link_to_extra_data": "a.a-link-normal.s-no-outline",
        "title": "h2.a-size-base-plus.a-spacing-none.a-color-base.a-text-normal",
        "is_limited_time_deal": 'span[data-a-badge-color="sx-red-mvt"]',
    },
    "product_page": {
        "title": "#productTitle, h1#title",
        "images": "#canvasCaption",
        "seller_name": "#sellerProfileTriggerId",
        "description": "#feature-bullets",
        "is_on_stock": "#availability",
        "return_policy": "#returnsInfoFeature_feature_div > div.offer-display-feature-text.a-size-small > span > a > span",
        "details_table_rows": (
            "#productDetails_techSpec_section_1 tr, "
            "#productDetails_detailBullets_sections1 tr, "
            "#productDetails_techSpec_section_2 tr, "
            "table.prodDetTable tr"
        ),
        "details_th": "th, td.prodDetSectionEntry",
        "details_td": "td, td.prodDetAttrValue",
        "is_more_deals_on_releated_products": "#sp_detail_thematic-hercules_hybrid_deals_T1",
        "stock_positive_keywords": "in stock|available|ships soon",
    },
}


# -----------------------------
# Header factory (fake-headers integrated)
# -----------------------------
UA_OK = re.compile(r"(Chrome/(8\d|9\d|1\d{2})|Firefox/(8\d|9\d|1\d{2}))", re.I)

class HeaderFactory:
    """
    Builds one realistic header set per session.
    Uses fake-headers if available and patches stale UAs.
    """
    def __init__(
        self,
        browser: str = "chrome",     # chrome/firefox/opera
        os_name: str = "win",        # win/mac/lin
        include_misc: bool = True,   # fake-headers 'headers=True'
        referer: Optional[str] = "https://www.amazon.com/",
        accept_language: str = "en-US,en;q=0.9",
        accept_encoding: str = "gzip, deflate, br",
    ):
        self.browser = browser
        self.os_name = os_name
        self.include_misc = include_misc
        self.referer = referer
        self.accept_language = accept_language
        self.accept_encoding = accept_encoding

    def generate(self) -> Dict[str, str]:
        h: Dict[str, str] = {}
        if FakeHeaders:
            gen = FakeHeaders(browser=self.browser, os=self.os_name, headers=self.include_misc).generate()
            h.update(gen)
        # Patch obviously stale or missing UA
        ua = h.get("User-Agent", "")
        if not UA_OK.search(ua):
            h["User-Agent"] = (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        # Normalize essentials
        h.setdefault("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        h.setdefault("Accept-Language", self.accept_language)
        h.setdefault("Accept-Encoding", self.accept_encoding)
        h.setdefault("Connection", "keep-alive")
        if self.referer and "Referer" not in h:
            h["Referer"] = self.referer
        h.setdefault("Upgrade-Insecure-Requests", "1")
        h.setdefault("DNT", "1")
        return h


# -----------------------------
# Robust fetcher (requests Session + retries + bot detection)
# -----------------------------
BOT_PATTERNS = re.compile(r"(Robot Check|not a robot|captcha|enter the characters you see)", re.I)

class RobustFetcher:
    """
    HTTP client with:
      stable per-session headers, cookies, connection reuse;
      retry/backoff on 429/5xx;
      optional Tor identity rotation (avoid for Amazon).
    """
    def __init__(
        self,
        use_tor: bool = False,
        tor_ports: Tuple[int, ...] = (9150,),
        tor_cport: int = 9151,
        per_req_sleep: Tuple[float, float] = (2.5, 5.0),
        max_retries: int = 2,
        backoff_base: float = 1.5,
        timeout: int = 30,
        header_factory: Optional[Callable[[], Dict[str, str]]] = None,
    ):
        self.use_tor = use_tor
        self.rt = None
        if use_tor:
            if not RequestsTor:
                raise RuntimeError("requests_tor is not installed but use_tor=True")
            self.rt = RequestsTor(tor_ports=tor_ports, tor_cport=tor_cport)

        self.per_req_sleep = per_req_sleep
        self.backoff_base = backoff_base
        self.timeout = timeout

        self.headers = (header_factory or HeaderFactory().generate)()

        self.sess = requests.Session()
        self.sess.headers.update(self.headers)

        retries = Retry(
            total=max_retries,
            connect=max_retries,
            read=max_retries,
            status=max_retries,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=frozenset(["GET", "HEAD"]),
            backoff_factor=self.backoff_base,
            raise_on_status=False,
        )
        adapter = HTTPAdapter(pool_connections=10, pool_maxsize=10, max_retries=retries)
        self.sess.mount("http://", adapter)
        self.sess.mount("https://", adapter)

    def _rotate_identity(self):
        if self.rt:
            self.rt.new_id()
            time.sleep(3)  # Tor circuit build time

    def _polite_sleep(self):
        lo, hi = self.per_req_sleep
        time.sleep(random.uniform(lo, hi))

    def fetch(self, url: str, rotate_on_fail: bool = True) -> str:
        """
        GET with retries/backoff and bot-page detection.
        On 429/503 or bot page, optionally rotate identity and retry once.
        """
        self._polite_sleep()
        html, status = self._get(url)
        if status in (429, 503) or BOT_PATTERNS.search(html):
            if rotate_on_fail:
                self._rotate_identity()
            time.sleep(random.uniform(8.0, 15.0))  # cool down
            html, status = self._get(url)

        if status >= 400:
            raise RuntimeError(f"HTTP {status} while fetching {url}")

        if BOT_PATTERNS.search(html):
            raise RuntimeError("Bot detection page returned (captcha/robot check).")

        return html

    def _get(self, url: str) -> tuple[str, int]:
        if self.rt:
            r = self.rt.get(url, headers=self.sess.headers, timeout=self.timeout)
        else:
            r = self.sess.get(url, timeout=self.timeout)
        return r.text or "", r.status_code


# -----------------------------
# Data models
# -----------------------------
@dataclass
class SearchCard:
    title: Optional[str]
    price_text: Optional[str]
    has_coupon: bool
    is_limited_time_deal: bool
    product_url: Optional[str]


@dataclass
class ProductDetails:
    name: Optional[str]
    seller_name: Optional[str]
    description_text: Optional[str]
    is_in_stock: Optional[bool]
    return_policy_text: Optional[str]
    images_text: Optional[str]
    details_kv: Dict[str, str]
    has_related_deals: bool


# -----------------------------
# CSV Exporters
# -----------------------------
def _ensure_dir(path: str) -> None:
    d = os.path.dirname(os.path.abspath(path))
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)

def export_search_cards_csv(path: str, cards: List[SearchCard], append: bool = False) -> None:
    """
    Write search cards to CSV.
    - UTF-8 BOM for Excel compatibility.
    - Writes header once (overwrites unless append=True and file exists).
    """
    if not cards:
        return
    _ensure_dir(path)
    fieldnames = ["title", "price_text", "has_coupon", "is_limited_time_deal", "product_url"]
    mode = "a" if append and os.path.exists(path) else "w"
    with open(path, mode, newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        if mode == "w":
            w.writeheader()
        for c in cards:
            row = asdict(c) if is_dataclass(c) else c
            w.writerow({k: row.get(k) for k in fieldnames})

def export_product_details_csv(
    path: str,
    products: List[ProductDetails],
    append: bool = False,
    flatten_details: bool = False,
) -> None:
    """
    Write product details to CSV.
    - If flatten_details=True, expands details_kv keys into separate columns (detail:<key>).
      Keys are the union across all products.
    - Otherwise, serializes details_kv as JSON string.
    """
    if not products:
        return
    _ensure_dir(path)

    base_fields = [
        "name", "seller_name", "description_text", "is_in_stock",
        "return_policy_text", "images_text", "has_related_deals"
    ]

    if flatten_details:
        # Union of all detail keys
        all_keys: set[str] = set()
        for p in products:
            all_keys.update((p.details_kv or {}).keys())
        detail_cols = [f"detail:{k}" for k in sorted(all_keys)]
        fieldnames = base_fields + detail_cols
    else:
        fieldnames = base_fields + ["details_kv"]  # as JSON

    mode = "a" if append and os.path.exists(path) else "w"
    with open(path, mode, newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        if mode == "w":
            w.writeheader()
        for p in products:
            row = asdict(p) if is_dataclass(p) else p
            out = {k: row.get(k) for k in base_fields}
            if flatten_details:
                # Fill each detail column
                dv = row.get("details_kv") or {}
                for col in fieldnames[len(base_fields):]:
                    key = col.replace("detail:", "", 1)
                    out[col] = dv.get(key)
            else:
                out["details_kv"] = json.dumps(row.get("details_kv") or {}, ensure_ascii=False)
            w.writerow(out)


# -----------------------------
# Scraper
# -----------------------------
class AmzScraper:
    """
    Composable scraper for an Amazon-style clone.
    Networking via RobustFetcher; DOM helpers kept simple.
    """

    def __init__(
        self,
        selectors: Dict[str, Any] | None = None,
        use_tor: bool = False,
        tor_ports: Tuple[int, ...] = (9150,),
        tor_cport: int = 9151,
        timeout: int = 30,
        header_factory: Optional[Callable[[], Dict[str, str]]] = None,
    ):
        self.sel = selectors or DEFAULT_SELECTORS
        self.fetcher = RobustFetcher(
            use_tor=use_tor,
            tor_ports=tor_ports,
            tor_cport=tor_cport,
            timeout=timeout,
            header_factory=header_factory,
        )

    # Network
    def fetch(self, url: str, rotate_ip: bool = True) -> str:
        return self.fetcher.fetch(url, rotate_on_fail=rotate_ip)

    # Soup / DOM
    @staticmethod
    def soup(html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "lxml")

    @staticmethod
    def _clean_text(s: Optional[str]) -> Optional[str]:
        return re.sub(r"\s+", " ", s).strip() if s else None

    def query_exists(self, root: BeautifulSoup | Tag, selector: str) -> bool:
        return bool(root.select_one(selector))

    def query_text(self, root: BeautifulSoup | Tag, selector: str) -> Optional[str]:
        node = root.select_one(selector)
        return self._clean_text(node.get_text(separator=" ", strip=True)) if node else None

    def query_attr(self, root: BeautifulSoup | Tag, selector: str, attr: str) -> Optional[str]:
        node = root.select_one(selector)
        return node.get(attr) if node and node.has_attr(attr) else None

    # Product page getters
    def get_product_name(self, root: BeautifulSoup | Tag) -> Optional[str]:
        return self.query_text(root, self.sel["product_page"]["title"])

    def get_seller_name(self, root: BeautifulSoup | Tag) -> Optional[str]:
        return self.query_text(root, self.sel["product_page"]["seller_name"])

    def get_description(self, root: BeautifulSoup | Tag) -> Optional[str]:
        return self.query_text(root, self.sel["product_page"]["description"])

    def get_return_policy(self, root: BeautifulSoup | Tag) -> Optional[str]:
        return self.query_text(root, self.sel["product_page"]["return_policy"])

    def is_in_stock(self, root: BeautifulSoup | Tag) -> Optional[bool]:
        avail = self.query_text(root, self.sel["product_page"]["is_on_stock"])
        if avail is None:
            return None
        pattern = self.sel["product_page"].get("stock_positive_keywords", "in stock")
        return bool(re.search(pattern, avail, re.I))

    def get_images_text(self, root: BeautifulSoup | Tag) -> Optional[str]:
        return self.query_text(root, self.sel["product_page"]["images"])

    def has_related_deals(self, root: BeautifulSoup | Tag) -> bool:
        return self.query_exists(root, self.sel["product_page"]["is_more_deals_on_releated_products"])

    def get_details_kv(self, root: BeautifulSoup | Tag) -> Dict[str, str]:
        rows_sel = self.sel["product_page"]["details_table_rows"]
        th_sel = self.sel["product_page"]["details_th"]
        td_sel = self.sel["product_page"]["details_td"]
        kv: Dict[str, str] = {}
        for row in root.select(rows_sel):
            k = self.query_text(row, th_sel)
            v = self.query_text(row, td_sel)
            if k and v:
                kv[k] = v
        return kv

    def parse_product_page(self, html: str) -> ProductDetails:
        root = self.soup(html)
        return ProductDetails(
            name=self.get_product_name(root),
            seller_name=self.get_seller_name(root),
            description_text=self.get_description(root),
            is_in_stock=self.is_in_stock(root),
            return_policy_text=self.get_return_policy(root),
            images_text=self.get_images_text(root),
            details_kv=self.get_details_kv(root),
            has_related_deals=self.has_related_deals(root),
        )

    # Search results parsing
    def _iter_product_cards(self, root: BeautifulSoup | Tag) -> Iterable[Tag]:
        return root.select(self.sel["page_result_products"]["product_container"])

    def get_card_title(self, card: Tag) -> Optional[str]:
        return self.query_text(card, self.sel["page_result_products"]["title"])

    def get_card_price_text(self, card: Tag) -> Optional[str]:
        return self.query_text(card, self.sel["page_result_products"]["price"])

    def card_has_coupon(self, card: Tag) -> bool:
        return self.query_exists(card, self.sel["page_result_products"]["is_coupon_exist"])

    def card_is_limited_time_deal(self, card: Tag) -> bool:
        return self.query_exists(card, self.sel["page_result_products"]["is_limited_time_deal"])

    def get_card_product_url(self, card: Tag) -> Optional[str]:
        return self.query_attr(card, self.sel["page_result_products"]["product_link_to_extra_data"], "href")

    def parse_search_results(self, html: str) -> List[SearchCard]:
        root = self.soup(html)
        out: List[SearchCard] = []
        for card in self._iter_product_cards(root):
            out.append(
                SearchCard(
                    title=self.get_card_title(card),
                    price_text=self.get_card_price_text(card),
                    has_coupon=self.card_has_coupon(card),
                    is_limited_time_deal=self.card_is_limited_time_deal(card),
                    product_url=self.get_card_product_url(card),
                )
            )
        return out

    # Orchestration
    def fetch_and_parse_product(self, url: str, rotate_ip: bool = True) -> ProductDetails:
        html = self.fetch(url, rotate_ip=rotate_ip)
        return self.parse_product_page(html)

    def fetch_and_parse_search(self, url: str, rotate_ip: bool = True) -> List[SearchCard]:
        html = self.fetch(url, rotate_ip=rotate_ip)
        return self.parse_search_results(html)


# -----------------------------
# Example usage with retry loop + CSV export
# -----------------------------
if __name__ == "__main__":
    hf = HeaderFactory(browser="chrome", os_name="win", include_misc=True, referer="https://www.amazon.com/")
    scraper = AmzScraper(selectors=DEFAULT_SELECTORS, use_tor=True, header_factory=hf.generate)

    url = "https://www.amazon.com/s?k=hats&crid=3UD0HZDEGZ2PT&sprefix=ha%2Caps%2C230&ref=nb_sb_noss_2"

    max_attempts = 50   # safety guard
    attempt = 0
    cards: List[SearchCard] = []
    while True:
        attempt += 1
        try:
            print(f"Attempt {attempt} fetching {url}...")
            search_html = scraper.fetch(url, rotate_ip=True)
            cards = scraper.parse_search_results(search_html)
            if cards:
                print(f"Parsed {len(cards)} cards.")
                break
            else:
                print("No products parsed, retrying...")
        except Exception as e:
            print(f"Fetch failed: {e}")
        sleep_time = min(30, 3 * attempt)  # backoff up to 30s
        time.sleep(sleep_time)
        if attempt >= max_attempts:
            raise RuntimeError("Exceeded maximum retry attempts without success.")

    # Export search results to CSV
    export_search_cards_csv("out/search_results.csv", cards, append=False)
    print("Wrote CSV: out/search_results.csv")
