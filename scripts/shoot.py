"""Capture review screenshots of the running site with Playwright + Chrome."""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "shots"
OUT.mkdir(parents=True, exist_ok=True)
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5173/"


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME,
            headless=True,
            args=["--hide-scrollbars", "--force-device-scale-factor=1"],
        )
        page = browser.new_page(viewport={"width": 1700, "height": 1000}, device_scale_factor=1)
        errors: list[str] = []
        page.on(
            "console",
            lambda msg: errors.append(f"console.{msg.type}: {msg.text}")
            if msg.type == "error"
            else None,
        )
        page.on("pageerror", lambda err: errors.append(f"pageerror: {err}"))

        page.goto(URL, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(2600)

        page.evaluate(
            """() => { const v = document.querySelector('video');
                if (v) { try { v.currentTime = 4.2; v.pause(); } catch (e) {} } }"""
        )
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / "01-hero-1700.png"))
        print("hero 1700")

        page.set_viewport_size({"width": 1440, "height": 900})
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "02-hero-1440.png"))
        print("hero 1440")
        page.set_viewport_size({"width": 1700, "height": 1000})

        # Everything visible for the deterministic section captures.
        page.add_style_tag(
            content="""[data-reveal]{opacity:1!important;transform:none!important;}
            .nav{display:none!important;} .skip-link{display:none!important;}"""
        )
        page.wait_for_timeout(300)

        # Walk the page to trigger lazy images / counters.
        height = page.evaluate("document.documentElement.scrollHeight")
        for y in range(0, height, 700):
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(120)
        page.wait_for_timeout(1600)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(300)

        for anchor, name in [
            ("#archive", "03-archive"),
            ("#works", "04-works"),
            ("#capabilities", "05-capabilities"),
            ("#contact", "06-contact"),
        ]:
            page.locator(anchor).scroll_into_view_if_needed()
            page.wait_for_timeout(600)
            page.locator(anchor).screenshot(path=str(OUT / f"{name}.png"))
            print(name)

        # Full page overview.
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT / "07-full-page.png"), full_page=True)
        print("full page")

        # Nav in scrolled state.
        page.evaluate("window.scrollTo(0, 900)")
        page.wait_for_timeout(700)
        page.screenshot(path=str(OUT / "08-nav-scrolled.png"))

        # Project dialog.
        page.locator("#works").scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        page.locator(".work").first.click()
        page.wait_for_timeout(900)
        page.screenshot(path=str(OUT / "09-modal.png"))
        print("modal")
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)

        # Mobile-ish check (site is desktop-first, just make sure it holds).
        mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        mobile.goto(URL, wait_until="networkidle")
        mobile.evaluate("document.fonts.ready")
        mobile.wait_for_timeout(2200)
        mobile.screenshot(path=str(OUT / "10-mobile-hero.png"))
        print("mobile")

        if errors:
            print("--- ERRORS ---")
            for error in errors[:20]:
                print(error)
        else:
            print("no console errors")

        browser.close()


if __name__ == "__main__":
    main()
