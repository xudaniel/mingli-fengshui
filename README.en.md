# Mingli Fengshui · BaZi Four Pillars Chart

**中文** [README.md](README.md) | **English** (this page)

> Enter your **birthplace** and **birth date & time** to cast a complete Four Pillars (BaZi) chart — with Five-Element strength analysis and Eight Mansions feng shui directions — entirely in your browser.

**🌐 Live app: <https://xudaniel.github.io/mingli-fengshui/>**

A pure-frontend Chinese metaphysics charting app: from a single birth record it derives the full four-pillar chart (including hidden stems and Ten Gods), a weighted Five-Element strength verdict with favorable elements, practical element-remedy suggestions, an Eight Mansions (八宅) auspicious-directions compass, and the ten-year luck cycles. Everything is computed locally — no backend, no data upload.

## ✨ Features

### 🕐 True solar time correction
Traditional BaZi reckons the hour by the sun's position in the local sky, not by the clock of an administrative time zone. The app:

- corrects by the birthplace **longitude** (about 4 minutes per degree away from the zone's central meridian);
- optionally adds the **equation of time** (the seasonal ±16-minute wobble between apparent and mean solar time, via the Spencer 1971 approximation);
- shows both the original and the corrected moment, so you can cross-check against other charting tools.

For places like Ürümqi (87.6°E on UTC+8 clock time) the correction approaches two hours — enough to change the hour pillar and even the day pillar.

### 📜 Four Pillars chart
The core calendar engine is the battle-tested open-source library [lunar-javascript](https://github.com/6tail/lunar-javascript), which computes stems and branches from the 24 solar terms with minute precision:

- year, month, day, and hour pillars, every character colored by its element;
- each pillar's **hidden stems** (principal/middle/residual qi) with their **Ten God** roles;
- **Nayin**, **Void (空亡)**, **Conception Palace (胎元)**, **Life Palace (命宫)**, **Body Palace (身宫)**;
- lunar date, **zodiac animal** (Lichun boundary) and Western star sign;
- **ten-year luck cycles** (大运) with starting ages, plus the current **annual pillar (流年)** checked against your favorable elements.

### ⚖️ Element strength & favorable elements (simplified Zi Ping method)
A step beyond naive "count the eight characters":

- each visible stem scores 100; each branch splits 100 across its hidden stems (60/30/10 principal/middle/residual, 70/30 for two);
- the **month branch is weighted ×1.5** — "the month commands the season";
- supporters = the day master's own element (peers) + the element that generates it (resource); a support share ≥55% reads **strong**, ≤45% **weak**, otherwise **balanced**;
- weak day masters favor resource & peers; strong ones favor output, wealth, and officer elements; balanced charts top up the weakest element;
- the full reasoning is displayed in the UI, with a strength gauge — the judgment is transparent, not a black box.

### 🧭 Eight Mansions (八宅) life gua & directions
The feng shui module uses the classic Eight Mansions system, which derives directly from birth data:

- your **life gua** (Kan/Kun/Zhen/Xun/Qian/Dui/Gen/Li) from the Lichun-bounded birth year and gender;
- your **East/West group** and matching house orientations;
- a compass diagram plus a detail table of the **four auspicious directions** (生气 Vitality, 天医 Heavenly Doctor, 延年 Longevity, 伏位 Stability) and **four inauspicious ones** (祸害, 五鬼, 六煞, 绝命), each annotated with suitable room placements (main door, bedroom, study, bathroom…).

### 🎨 Element remedy suggestions
Actionable daily guidance for each favorable element: directions, colors, materials, numbers, peak season, and home-arrangement dos & don'ts.

### 🗺️ Birthplace lookup
- 50+ curated coordinates covering China's provincial capitals / major cities and common overseas cities;
- unknown places resolve through OpenStreetMap Nominatim search (the app's only network request — just the place name text);
- longitude and UTC offset stay hand-editable for historical time-zone quirks.

### 💾 Extras
- **Chart history**: last 10 charts kept in browser localStorage, one click to recall;
- **Copy as text**: export the whole chart summary as plain text for sharing;
- elegant dark UI, responsive on desktop and mobile;
- in-app **About** dialog documenting the algorithms and privacy policy.

## 🚀 Getting started

Requires Node.js 18+.

```bash
# install dependencies
npm install

# local dev server (http://localhost:5173)
npm run dev

# production build (outputs to dist/)
npm run build

# preview the production build
npm run preview
```

The build is fully static — deploy it to GitHub Pages, Vercel, Netlify, or any static file server. This repo auto-deploys to GitHub Pages on every push to `main`.

## 🏗️ Project structure

```
mingli-fengshui/
├── index.html              # entry page
├── src/
│   ├── main.ts             # UI: form, place search, rendering, history, about dialog
│   ├── style.css           # all styles (dark theme)
│   └── lib/
│       ├── bazi.ts         # chart pipeline: aggregates library output & analyses
│       ├── analysis.ts     # element cycles, weighted strength, favorable elements
│       ├── bagua.ts        # Eight Mansions gua & direction tables
│       ├── fengshui.ts     # element → direction/color/material remedies
│       ├── solarTime.ts    # true solar time (longitude + equation of time)
│       ├── cities.ts       # curated city coordinates + Nominatim search
│       ├── history.ts      # localStorage chart history
│       └── lunar.d.ts      # minimal typings for lunar-javascript
├── LICENSE                 # MIT
└── package.json
```

## 🔬 Methods & trade-offs

| Step | Method | Notes |
| --- | --- | --- |
| Stem/branch calc | lunar-javascript (solar terms to the minute) | Year pillar bounded by Lichun, month by the 12 Jie; late Zi hour uses school 2 (23:00 starts the next day pillar) |
| True solar time | 4 min/degree longitude + Spencer 1971 EoT | Each independently switchable; historical zones (e.g. Republican-era five zones) need a manual UTC-offset tweak |
| Element strength | Hidden-stem weighting + month ×1.5 + support share | Simplified Zi Ping; excludes seasonal adjustment (调候), combinations/clashes, and chart structures (格局) |
| Favorable elements | Support-the-weak / restrain-the-strong (扶抑) | Weak → support; strong → drain; balanced → top up the weakest |
| Life gua | Universal digit-root formula, Lichun-bounded year | A result of 5 maps to Kun for men, Gen for women |
| Feng shui directions | Standard Eight Mansions wandering-stars table | 生气/天医/延年/伏位 + 祸害/五鬼/六煞/绝命 |

## ⚠️ Disclaimer

All output is derived from published traditional rules via transparent, simplified algorithms, and is provided **for cultural education, reference, and entertainment only**. A full professional reading weighs many additional factors (seasonal balance, chart structure, combinations and clashes) and varies by practitioner. Please do not base medical, financial, marital, or other major life decisions on this app.

## 🔒 Privacy

- All computation happens 100% locally in your browser; birth data is never uploaded to any server;
- chart history lives only in your browser's localStorage and can be cleared with one click;
- only when you search for a place outside the built-in list is that place name sent to the public OpenStreetMap Nominatim service.

## 🙏 Credits

- [lunar-javascript](https://github.com/6tail/lunar-javascript) (6tail) — the dependency-free solar/lunar/stem-branch/solar-term library at the heart of this project;
- [OpenStreetMap Nominatim](https://nominatim.org/) — place search;
- UI typefaces: [Noto Serif SC / Noto Sans SC](https://fonts.google.com/noto).

## 📄 License

[MIT](LICENSE) © 2026 Daniel Xu
