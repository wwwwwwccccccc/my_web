from playwright.sync_api import sync_playwright

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
URL = 'http://127.0.0.1:4173/'


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME,
            headless=True,
            args=['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader'],
        )
        page = browser.new_page(viewport={'width': 1700, 'height': 1000})
        errors = []
        bad = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        page.add_init_script(
            """
            window.__lcp = [];
            window.__long = [];
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) window.__lcp.push({t: e.startTime, s: e.size, u: e.url});
            }).observe({type: 'largest-contentful-paint', buffered: true});
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) window.__long.push({t: e.startTime, d: e.duration});
            }).observe({type: 'longtask', buffered: true});
            """
        )
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(1500)

        data = page.evaluate(
            """() => {
              const r = performance.getEntriesByType('resource').map((e) => ({
                n: e.name.split('/').pop(), i: e.initiatorType, t: e.transferSize,
                d: e.decodedBodySize, dur: e.duration, url: e.name
              }));
              return {
                resources: r,
                nav: performance.getEntriesByType('navigation').map((e) => ({
                  ttfb: e.responseStart, dom: e.domContentLoadedEventEnd,
                  load: e.loadEventEnd, transfer: e.transferSize, decoded: e.decodedBodySize
                })),
                lcp: window.__lcp, long: window.__long,
                canvases: [...document.querySelectorAll('canvas')].map((c) => ({
                  w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight
                }))
              };
            }"""
        )
        print('INITIAL bytes', sum(x['t'] for x in data['resources']), 'requests', len(data['resources']), 'nav', data['nav'])
        print('LCP', data['lcp'][-5:])
        print('LONG', data['long'][:8])
        print('CANVAS', data['canvases'])
        print('RESOURCES')
        for x in sorted(data['resources'], key=lambda x: x['t'], reverse=True)[:20]:
            print(x['t'], x['i'], x['n'], x['d'])

        cdp = page.context.new_cdp_session(page)
        cdp.send('Performance.enable')
        m1 = cdp.send('Performance.getMetrics')['metrics']
        page.wait_for_timeout(3000)
        m2 = cdp.send('Performance.getMetrics')['metrics']
        keys = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'JSHeapUsedSize']
        print('IDLE3S', {
            k: round((next(x['value'] for x in m2 if x['name'] == k) -
                      next(x['value'] for x in m1 if x['name'] == k)), 3)
            for k in keys
        })

        page.locator('.nav__link', has_text='快生活').click()
        page.wait_for_timeout(3500)
        works = page.evaluate(
            """() => performance.getEntriesByType('resource')
              .filter((e) => e.name.includes('/images/work-') || e.name.includes('Works-'))
              .map((e) => ({n: e.name.split('/').pop(), t: e.transferSize, d: e.decodedBodySize}))"""
        )
        print('WORKS images/chunk', works)
        print('errors', errors[:5], 'bad', bad[:5])
        browser.close()


if __name__ == '__main__':
    main()
