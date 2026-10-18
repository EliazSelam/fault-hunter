"""Self-check for Fault Hunter.

1. Numbers and logic: runs runVerify() inside the page (every numeric answer and
   formula example, every latch/flip-flop truth table and counter sequence).
2. Crawl: opens every tab, component, system step, board, fault and question
   (answer and investigation mode) and fails on JS errors or broken values.
Exit code 0 = all good. Run after ./build.sh:  python tests/verify.py
"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

INDEX = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri()
BAD = "() => /NaN|undefined|\\[object/.test(document.getElementById('content').innerHTML)"

async def main():
    problems = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1200, 'height': 1200})
        pg.on('pageerror', lambda e: problems.append(('js error', str(e))))
        await pg.goto(INDEX); await pg.wait_for_timeout(300)
        r = await pg.evaluate('runVerify()')
        problems += [('number', x[0]) for x in r['num'] if not x[3]]
        problems += [('logic', x[0]) for x in r['logic'] if not x[1]]
        print(f"numbers: {len(r['num'])} checks, logic: {len(r['logic'])} checks")
        n = 0
        async def chk(tag):
            nonlocal n; n += 1
            if await pg.evaluate(BAD): problems.append(('page', tag))
        for s in await pg.evaluate("[...document.querySelectorAll('nav.sheets button')].map(b=>b.dataset.sheet)"):
            await pg.evaluate(f"go('{s}')"); await chk(s)
        for sub in await pg.evaluate('DIG_NAV.map(n=>n[0])'):
            await pg.evaluate(f"go('dig','{sub}')"); await chk('dig:' + sub)
        for t in ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill']:
            await pg.evaluate(f"showB('{t}')"); await chk('b:' + t)
        for c in await pg.evaluate('COMPONENTS.map(c=>c.id)'):
            await pg.evaluate(f"showS1('{c}')"); await chk('s1:' + c)
        for sid in await pg.evaluate('Object.keys(SYSX)'):
            for st in ['intro', 'normal', 'prin', 'worked', 'guided', 'solo']:
                await pg.evaluate(f"showSys('{sid}','{st}')"); await chk(f'sys:{sid}:{st}')
        for bid in await pg.evaluate('BOARDS.map(b=>b.id)'):
            await pg.evaluate(f"showLib('{bid}')"); await chk('lib:' + bid)
        for sid in await pg.evaluate('SCN.map(s=>s.id)'):
            await pg.evaluate(f"playScn('{sid}')"); await chk('scn:' + sid)
        for q in await pg.evaluate('QB.map(q=>q.id)'):
            await pg.evaluate(f"showQ('{q}',['{q}'])"); await pg.click('[data-sh="3"]'); await chk('q:' + q)
        await b.close()
    print(f'pages crawled: {n}')
    if problems:
        print('PROBLEMS:'); [print(' ', *x) for x in problems]; sys.exit(1)
    print('ALL CHECKS PASSED')

asyncio.run(main())
