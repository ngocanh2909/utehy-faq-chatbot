# -*- coding: utf-8 -*-
"""
crawl_utehy.py - Thu thập dữ liệu công khai từ Cổng thông tin đào tạo UTEHY
(https://qldaotao.utehy.edu.vn/) để làm kho tri thức cho Chatbot FAQ.

Cách dùng:
    python crawl_utehy.py              # crawl toàn bộ, ghi ra assets/js/utehy-data.js
    python crawl_utehy.py --max 400    # giới hạn ID tối đa
Chỉ dùng thư viện chuẩn của Python (không cần pip install).
"""
import argparse
import html
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

BASE = "https://qldaotao.utehy.edu.vn"
UA = "Mozilla/5.0 (UTEHY-FAQ-Chatbot crawler; educational project)"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "js", "utehy-data.js")

LIST_PAGES = {
    "Tin mới nhất": "/ThongTin/ThongBao?CatID=5",
    "Thông báo": "/ThongTin/ThongBao?CatID=2",
    "Văn bản biểu mẫu": "/ThongTin/ThongBao?CatID=1",
    "Quy chế Thạc sĩ": "/ThongTin/ThongBao?CatID=6&nhom=1",
    "Quy chế Tiến sĩ": "/ThongTin/ThongBao?CatID=6&nhom=2",
    "Quy chế Đại học": "/ThongTin/ThongBao?CatID=6&nhom=3",
    "Quy chế Văn bằng chứng chỉ": "/ThongTin/ThongBao?CatID=6&nhom=4",
}


def fetch(path, retries=2):
    url = path if path.startswith("http") else BASE + path
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                raw = r.read().decode("utf-8", errors="replace")
            # Trang hiện bị chèn link SEO rác trước <!DOCTYPE> -> cắt bỏ
            raw = unicodedata.normalize("NFC", raw)
            k = raw.find("<!DOCTYPE")
            return raw[k:] if k > 0 else raw
        except Exception as e:  # noqa
            if i == retries:
                return None
            time.sleep(1.5)


def clean_text(fragment):
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", fragment)
    s = re.sub(r"(?i)<br\s*/?>|</p>|</li>|</tr>|</h\d>", "\n", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = unicodedata.normalize("NFC", html.unescape(s))
    s = re.sub(r"[ \t\u00a0]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()


def parse_date(s):
    s = (s or "").strip()
    for fmt in ("%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return s


def parse_detail(aid):
    page = fetch(f"/Common/ChiTietTin/{aid}")
    if not page:
        return None
    m = re.search(r'(?s)<h2 style="margin: 5px 0;font-size: 26px;">\s*<a[^>]*>(.*?)</a>', page)
    if not m:
        return None
    title = clean_text(m.group(1))
    if not title:
        return None
    date = re.search(r'(?s)Ngày đăng:.*?<span[^>]*>(.*?)</span>', page)
    author = re.search(r'(?s)Người đăng:.*?</span><span[^>]*>(.*?)</span>', page)
    cat = re.search(r'(?s)Chuyên mục: </span><span[^>]*>(.*?)</span>', page)
    body = ""
    attachments = []
    b = re.search(r'(?s)col-md-10 col-md-offset-1"[^>]*>(.*?)TIN KHÁC CÙNG CHUYÊN MỤC', page)
    if b:
        frag = b.group(1)
        for href, txt in re.findall(r'(?s)<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', frag):
            if "/FileManager/" in href or href.lower().endswith((".pdf", ".doc", ".docx", ".xls", ".xlsx", ".rar", ".zip")):
                url = href if href.startswith("http") else BASE + href
                attachments.append({"name": clean_text(txt) or os.path.basename(href), "url": url})
        body = clean_text(frag)
    return {
        "id": aid,
        "title": title,
        "date": parse_date(clean_text(date.group(1))) if date else "",
        "author": clean_text(author.group(1)) if author else "",
        "category": clean_text(cat.group(1)) if cat else "",
        "content": body[:4000],
        "attachments": attachments[:10],
        "url": f"{BASE}/Common/ChiTietTin/{aid}",
    }


def discover_max_id():
    ids = set()
    for path in ["/"] + list(LIST_PAGES.values()):
        p = fetch(path)
        if p:
            ids.update(int(x) for x in re.findall(r"/Common/ChiTietTin/(\d+)", p))
    return max(ids) if ids else 300, ids


def list_membership():
    """Ánh xạ id bài -> các chuyên mục (theo trang danh sách)."""
    member = {}
    for name, path in LIST_PAGES.items():
        p = fetch(path)
        if not p:
            continue
        for x in set(re.findall(r"/Common/ChiTietTin/(\d+)", p)):
            member.setdefault(int(x), []).append(name)
    return member


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max", type=int, default=0, help="ID bài viết tối đa cần quét")
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()

    print("[1/3] Đang dò ID bài viết mới nhất ...")
    max_id, _ = discover_max_id()
    max_id = args.max or (max_id + 10)
    member = list_membership()
    print(f"      -> quét ID 1..{max_id}")

    print("[2/3] Đang tải chi tiết bài viết ...")
    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for i, item in enumerate(ex.map(parse_detail, range(1, max_id + 1)), 1):
            if item:
                item["sections"] = member.get(item["id"], [])
                results.append(item)
            if i % 25 == 0:
                print(f"      {i}/{max_id} (thu được {len(results)})")

    results.sort(key=lambda x: (x["date"], x["id"]), reverse=True)
    data = {
        "source": BASE,
        "crawledAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "count": len(results),
        "articles": results,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Tự động sinh bởi crawl_utehy.py - KHÔNG sửa tay */\n")
        f.write("window.UTEHY_SNAPSHOT = ")
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"[3/3] Đã lưu {len(results)} bài viết vào {OUT}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
