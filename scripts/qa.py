import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5173/"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True, args=["--hide-scrollbars"])
    page = browser.new_page(viewport={"width": 1700, "height": 1000})
    errors = []
    bad = []
    page.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(2500)

    info = page.evaluate(
        """() => {
          const hero = document.querySelector('.hero__image');
          return {
            heroImage: !!hero && hero.complete && hero.naturalWidth > 0,
            heroWidth: hero?.naturalWidth,
            fontsSans: document.fonts.check('16px "Noto Sans SC"'),
            fontsSerif: document.fonts.check('16px "Noto Serif SC"'),
            fontsDIN: document.fonts.check('16px "DIN"'),
            fontsBrush: document.fonts.check('16px "Xingkai"'),
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            sections: [...document.querySelectorAll('section')].map(s => s.id),
            images: [...document.images].map(i => ({src: i.currentSrc, w: i.naturalWidth})),
          };
        }"""
    )
    print(info)
    print("hero image loaded:", info["heroImage"], info["heroWidth"])

    for width, height in [(1440, 900), (1024, 800), (390, 844)]:
        page.set_viewport_size({"width": width, "height": height})
        page.wait_for_timeout(400)
        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        print(f"{width}x{height} horizontal overflow: {overflow}px")

    page.set_viewport_size({"width": 1700, "height": 1000})
    page.wait_for_timeout(300)

    # Open the horizontal 02 panel before testing the carousel.
    page.locator(".nav__link", has_text="快生活").click()
    page.wait_for_timeout(3200)

    carousel = page.locator(".flex-carousel")
    print(
        "carousel:",
        "canvas=", page.locator(".flex-carousel canvas").count(),
        "labels=", page.locator(".flex-carousel__card-label").all_inner_texts(),
    )

    # Each centered project opens the existing case dialog.
    for i in range(4):
        carousel.focus()
        page.wait_for_timeout(250)
        page.keyboard.press("Enter")
        page.wait_for_timeout(600)
        modal = page.locator(".modal")
        title = page.locator(".project-sheet__title").inner_text() if modal.count() else "(none)"
        img_ok = (
            page.locator(".project-sheet__image").evaluate("i => i.naturalWidth > 0 && i.complete")
            if modal.count()
            else False
        )
        print(f"modal {i}: {title} visible={modal.is_visible() if modal.count() else False} img={img_ok}")
        if modal.count():
            page.keyboard.press("Escape")
            page.wait_for_timeout(350)
        if i < 3:
            carousel.focus()
            page.keyboard.press("ArrowRight")
            page.wait_for_timeout(750)

    # Nav anchors.
    page.locator(".nav__link", has_text="快生活").click()
    page.wait_for_timeout(1200)
    print("after nav click, scrollY:", page.evaluate("window.scrollY"), "works top:", page.evaluate("document.querySelector('#works').getBoundingClientRect().top"))

    print("errors:", errors)
    print("bad responses:", bad)
    browser.close()
