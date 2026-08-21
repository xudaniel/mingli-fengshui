# Mingli Fengshui · BaZi Four Pillars Chart

**中文** [README.md](README.md) | **English** (this page)

### 👤 Author: [Daniel Xu](https://github.com/xudaniel)

> Enter your **birthplace** and **birth date & time** to cast a complete Four Pillars (BaZi) chart — with Five-Element strength analysis and Eight Mansions feng shui directions — entirely in your browser.

**🌐 Live app: <https://xudaniel.github.io/mingli-fengshui/>** (installable as a PWA, works offline)

[![CI & Deploy](https://github.com/xudaniel/mingli-fengshui/actions/workflows/deploy.yml/badge.svg)](https://github.com/xudaniel/mingli-fengshui/actions/workflows/deploy.yml)

![Mingli Fengshui application preview](public/og-image.png)

A pure-frontend Chinese metaphysics charting app: from a single birth record it derives the full four-pillar chart (hidden stems and Ten Gods included), a weighted Five-Element strength verdict with favorable elements, practical element-remedy suggestions, an Eight Mansions (八宅) auspicious-directions compass, luck cycles, a Tai Sui alert, a personality/career reading, and a life-curve chart — plus compatibility analysis, a personal auspicious-day calendar, and a live mobile compass. Everything is computed locally, with a bilingual (中文/English) interface.

## ✨ Features

### 🕐 True solar time correction
Traditional BaZi reckons the hour by the sun's position in the local sky, not by the clock of an administrative time zone. The app:

- corrects by the birthplace **longitude** (about 4 minutes per degree away from the zone's central meridian);
- optionally adds the **equation of time** (the seasonal ±16-minute wobble between apparent and mean solar time, via the Spencer 1971 approximation);
- shows both the original and the corrected moment, so you can cross-check against other charting tools.

For places like Ürümqi (87.6°E on UTC+8 clock time) the correction approaches two hours — enough to change the hour pillar and even the day pillar.

The app also carries **historical-clock warnings**: births during China's daylight-saving years (1986–1991, clocks advanced one hour) trigger an alert with a one-click "-1 hour" correction, and pre-1949 births get a note about the era's five regional time zones (Kunlun/Sinkiang-Tibet/Kansu-Szechwan/Chungyuan/Changpai).

### 🕛 Unknown-hour mode
Not sure of the birth hour? Toggle "Hour unknown" and the app casts all twelve traditional two-hour blocks, honestly separating:

- **stable conclusions** independent of hour — year/month/day pillars, zodiac, star sign, life gua, seasonal adjustment;
- **hour-sensitive conclusions** — a full table of each hour's pillar, strength verdict, and favorable elements, plus the most common verdict across all twelve and the favorable elements that hold true no matter the hour.

### 📜 Four Pillars chart
The core calendar engine is the battle-tested open-source library [lunar-javascript](https://github.com/6tail/lunar-javascript), which computes stems and branches from the 24 solar terms with minute precision:

- year, month, day, and hour pillars, every character colored by its element;
- each pillar's **hidden stems** (principal/middle/residual qi) with their **Ten God** roles;
- **Nayin**, **Void (空亡)**, **Conception Palace (胎元)**, **Life Palace (命宫)**, **Body Palace (身宫)**;
- lunar date, **zodiac animal** (Lichun boundary) and Western star sign;
- **ten-year luck cycles** (大运) with starting ages, plus the current **annual pillar (流年)** checked against your favorable elements; click any luck cycle to expand its year-by-year (流年) detail, colored by favorable/unfavorable and highlighting the current year.

### ⚖️ Element strength & favorable elements (simplified Zi Ping method)
A step beyond naive "count the eight characters":

- each visible stem scores 100; each branch splits 100 across its hidden stems (60/30/10 principal/middle/residual, 70/30 for two);
- the **month branch is weighted ×1.5** — "the month commands the season";
- supporters = the day master's own element (peers) + the element that generates it (resource); a support share ≥55% reads **strong**, ≤45% **weak**, otherwise **balanced**;
- weak day masters favor resource & peers; strong ones favor output, wealth, and officer elements; balanced charts top up the weakest element;
- a **seasonal-adjustment (调候) recommendation** from the standard Qiong Tong Bao Jian reference table is shown alongside — when it disagrees with the strength verdict, both are displayed with a note that practice usually favors the seasonal reading;
- the full reasoning is displayed in the UI, with a strength gauge — the judgment is transparent, not a black box.

### 🔗 Branch interactions (合冲刑害)
The four branches are automatically checked for **six harmonies, trine combinations (incl. half-trines), directional assemblies, clashes, punishments (incl. self- and triple-punishments), and harms** — each listed with the pillars involved, the resulting element where applicable, and a plain-language meaning, plus badges on the pillar cards.

### 🍑 Auspicious stars (神煞), including Peach Blossom
Automatically looks up **Heavenly Nobleman (天乙贵人), Academic Star (文昌), Prosperity Star (禄神), Yang Blade (羊刃), Traveling Horse (驿马), General Star (将星), Canopy (华盖)**, and **Peach Blossom (桃花)** (via year-branch and day-branch trine lookups), listing which pillar each lands on with a plain-language meaning, color-coded by auspiciousness.

### 🧭 Eight Mansions (八宅) life gua & directions
The feng shui module uses the classic Eight Mansions system, which derives directly from birth data:

- your **life gua** (Kan/Kun/Zhen/Xun/Qian/Dui/Gen/Li) from the Lichun-bounded birth year and gender;
- your **East/West group** and matching house orientations;
- a compass diagram plus a detail table of the **four auspicious directions** (生气 Vitality, 天医 Heavenly Doctor, 延年 Longevity, 伏位 Stability) and **four inauspicious ones** (祸害, 五鬼, 六煞, 绝命), each annotated with suitable room placements.

### 🏠 House gua matching
Pick your house's facing direction (main door / bright side) and the app derives its **house gua** (from the sitting direction opposite the facing), compares its East/West group against your own life gua, and gives room-by-room placement guidance — extending the Eight Mansions system from "just you" to "you and your home."

### 🧭📱 Live mobile compass
On a mobile device, tap "Live Compass" to read the orientation sensor — the compass rotates with your phone in real time and highlights whichever auspicious/inauspicious direction you're currently facing, with a note on magnetic declination and sensor error.

### 🐯 Tai Sui alert
Checks the next 12 years against your birth-year branch for **value (值), clash (冲), punishment (刑), harm (害), and break (破)** Tai Sui conflicts, with the affected years and a plain-language note for each.

### 🧑 Personality & career reading
A rule-based (not AI-generated) simplified reading: your day-stem personality, the dominant Ten God in your chart and its associated temperament, strength-based advice on playing to your strengths, and industry directions mapped from your favorable elements.

### 📈 Life-curve chart
A line chart showing how well each year's stem/branch aligns with your favorable elements (-3 to +3), with background bands marking each luck cycle — a rough trend for each life stage at a glance.

### 💑 Compatibility analysis
Select two saved profiles and get a simplified folk-style compatibility read across **day-stem combination, day-branch relations, zodiac relations, element complementarity, and gua grouping**, plus a 0–100 overall score.

### 📅 Personal auspicious-day calendar
Browse a month view where each day is scored against your chart — day-pillar clashes and favorable stems are flagged — layered on lunar-javascript's built-in daily do's/don'ts, filterable by event type (signing / moving / opening a business / wedding). A "find the best day" mode searches any date range (optionally filtered by event type) and returns a ranked list of the best-scoring days with a one-line reason each, instead of browsing month by month.

### 🎨 Element remedy suggestions
Actionable daily guidance for each favorable element: directions, colors, materials, numbers, peak season, and home-arrangement dos & don'ts.

### 🗺️ Birthplace lookup
- 50+ curated coordinates covering China's provincial capitals / major cities and common overseas cities;
- unknown places resolve through OpenStreetMap Nominatim search (the app's only network request — just the place name text);
- longitude and UTC offset stay hand-editable for historical time-zone quirks.

### 💾 Multi-profile storage
- charts auto-save as **named profiles** you can rename or delete (not just a short recent list);
- export all profiles as a JSON backup, import to merge (deduplicated by content);
- compatibility analysis and the calendar both draw directly from your saved profiles.

### 🌐 Bilingual UI · 📲 Installable offline
- one-click 中文/English toggle, remembered across visits, defaulting to Chinese; stems, branches, and Ten Gods carry pinyin and standard English glosses in English mode;
- installable to your home screen / desktop and fully usable offline (PWA with a precaching service worker);
- elegant dark UI, responsive on desktop and mobile;
- in-app **About** dialog documenting the algorithms and privacy policy.

### 🔗 Sharing & export
- **copy as text** exports the whole chart summary in one click;
- **copy link** encodes your birth data into a URL — whoever opens it gets the chart recomputed locally in their own browser, with no server involved;
- **save image** exports a shareable portrait-format PNG (pillars, elements, gua, luck cycles) — built for chat-app sharing.

## 🆕 v2.0: portal tools

The home page is now a portal-style tool directory (with today's almanac embedded), adding these 8 standalone tools — all local computation, code-split and lazy-loaded:

- **Zi Wei Dou Shu chart**: a simplified Central-Province-school core method — five-element bureau, life/body palace, fourteen main stars, Four Transformations. ⚠️ Zi Wei's exact day-based star placement has multiple slightly-differing traditional versions; this app commits to one self-consistent algorithm without cross-checking every classical source — treat it as a reference, not the sole authority.
- **Flying Star (玄空飞星) feng shui**: Three Cycles Nine Periods epoch + the star-flying method (forward/reverse), casting a nine-palace chart from a sitting mountain and move-in/build year, flagging Prosperous Mountain & Facing / Upside-down Mountain & Water.
- **Name analysis & naming tool**: the five-grid (五格) stroke method and its 81-number fortune table; built-in surname and common given-name-character dictionaries, with a manual Kangxi-stroke-count fallback for characters not covered; can also suggest candidate names filtered by favorable elements.
- **Dream dictionary**: about 117 traditional dream-symbol entries (not exhaustive, growing over time), searchable by keyword or browsable by category — cultural entertainment only.
- **Quick divination (Liu Yao / Plum Blossom)**: cast a hexagram via three-coin tosses (Liu Yao) or by numbers/time (Plum Blossom Numerology), producing the original hexagram, moving lines, and resulting hexagram.
- **Qi Men Dun Jia chart**: casts the current base plate (地盘) — yin/yang cycle and period number, the three spirits and six chief stems, and the doors/stars' home positions. ⚠️ Only the base plate is implemented (structural reference); the dynamic time-based overlay (转值符使) is not — this is not a complete Qi Men chart.
- **Daily almanac (老黄历)**: the twelve day officers, 28 lunar mansions, auspicious/inauspicious day classification, wealth/happiness/Tai Sui directions, and traditional do's/don'ts, with today's card embedded on the home page.
- **Full narrative report**: compiles your already-cast chart — pillars, element balance, personality/career, luck cycles, feng shui directions — into one readable narrative, printable / savable as PDF.

The existing compatibility analysis, auspicious-day calendar, and Eight Mansions compass remain available from the home page's tool sections.

> A community discussion board (for sharing and discussing charts) is not yet implemented — it would require a real backend (accounts, a database, moderation), which conflicts architecturally with this app's "everything computed locally, nothing uploaded" privacy stance. Still under evaluation.

## 🆕 v2.2: personalized home page, best-day search, Zi Wei diagram, visual report summary

- **"Your Day Today" home page card**: with a saved profile, a personalized daily brief appears alongside the generic almanac card — today's day-pillar score, whether the year is a Tai Sui conflict year, and today's Qi Men bureau, summed up in one line; switchable when multiple profiles are saved.
- **Calendar "find the best day"**: pick a start date and a day count (with an optional event-type filter) to get a ranked list of the best-scoring days in that range with a one-line reason each, instead of browsing month by month.
- **Zi Wei chart diagram**: replaces the flat grid with the traditional twelve-palace layout (palaces ring the border in forward zhi order starting at 巳, center holds the bureau/Four Transformations summary); the life palace is emphasized by styling, the body palace by an explicit badge.
- **Visual report summary**: the full narrative report now opens with a four-pillars grid, the Eight Mansions compass, and the Zi Wei chart (omitted for hour-unknown profiles) ahead of the narrative chapters, so print/PDF output is one complete packet.

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

# run the test suite (vitest, 220+ cases over core algorithms and known-chart snapshots)
npm test
```

The build is fully static — deploy it to GitHub Pages, Vercel, Netlify, or any static file server. Every push to `main` runs type checks and the full test suite first; deployment to GitHub Pages happens only when they pass.

## 🏗️ Project structure

```
mingli-fengshui/
├── index.html                # entry page
├── vite.config.ts            # build config (incl. PWA plugin)
├── src/
│   ├── main.ts                # UI orchestration: form, nav, rendering, profiles, about dialog
│   ├── style.css               # all styles (dark theme)
│   ├── views/                  # relatively self-contained views/widgets (lazy-loaded, see bundle-size note below)
│   │   ├── homeView.ts          # portal-style home page: tool nav + today's almanac card
│   │   ├── compatView.ts        # compatibility analysis page
│   │   ├── calendarView.ts      # auspicious-day calendar page
│   │   ├── compassSvg.ts        # Eight Mansions compass SVG renderer
│   │   ├── compassLive.ts       # live mobile compass (DeviceOrientation)
│   │   ├── lifeCurveSvg.ts      # life-curve SVG renderer
│   │   ├── shareImage.ts        # chart-summary image export (hand-drawn Canvas)
│   │   ├── ziweiView.ts         # Zi Wei Dou Shu chart page
│   │   ├── flyingStarView.ts    # Flying Star feng shui page
│   │   ├── namingView.ts        # name analysis & naming page
│   │   ├── dreamsView.ts        # dream dictionary page
│   │   ├── ichingView.ts        # Liu Yao / Plum Blossom divination page
│   │   ├── qimenView.ts         # Qi Men Dun Jia chart page
│   │   ├── almanacView.ts       # daily almanac page
│   │   └── reportView.ts        # full narrative report page
│   └── lib/
│       ├── bazi.ts              # chart pipeline: aggregates library output & analyses
│       ├── analysis.ts          # element cycles, weighted strength, favorable elements
│       ├── tiaohou.ts           # seasonal-adjustment reference table
│       ├── relations.ts         # branch combination/clash detection
│       ├── peachblossom.ts      # Peach Blossom (桃花) star detection
│       ├── shensha.ts           # auspicious stars: Nobleman/Academic/Prosperity/Blade/Horse/General/Canopy
│       ├── taisui.ts            # Tai Sui (value/clash/punishment/harm/break) detection
│       ├── interpret.ts         # personality/career text generation (bilingual)
│       ├── lifecurve.ts         # life-curve scoring
│       ├── bagua.ts             # Eight Mansions gua & direction tables
│       ├── houseGua.ts          # house gua matching
│       ├── compatibility.ts     # compatibility analysis
│       ├── calendar.ts          # auspicious-day scoring
│       ├── hourSensitivity.ts   # twelve-hour scan for unknown birth times
│       ├── profiles.ts          # saved profiles (localStorage + import/export)
│       ├── profileCompute.ts    # shared profile → full chart computation
│       ├── shareLink.ts         # URL-hash encode/decode for share links
│       ├── fengshui.ts          # element → direction/color/material remedies (bilingual)
│       ├── solarTime.ts         # true solar time (longitude + equation of time)
│       ├── historicalTime.ts    # 1986–1991 DST periods & pre-1949 hints
│       ├── cities.ts            # curated city coordinates + Nominatim search
│       ├── ziwei.ts             # Zi Wei Dou Shu core algorithm
│       ├── flyingStar.ts        # Flying Star epoch & star-flying algorithm
│       ├── wuge.ts              # five-grid stroke method & 81-number fortune table
│       ├── strokeData.ts        # surname / given-name-character stroke dictionaries
│       ├── namingSuggest.ts     # candidate-name filtering by favorable elements
│       ├── dreams.ts            # dream-symbol data & search
│       ├── ichingData.ts        # trigram / 64-hexagram data
│       ├── iching.ts            # Liu Yao & Plum Blossom Numerology casting
│       ├── qimen.ts             # Qi Men Dun Jia base-plate algorithm
│       ├── almanac.ts           # daily almanac data aggregation
│       ├── report.ts            # full narrative report text generation
│       ├── i18n/                # dictionary, terminology glosses, language state
│       └── lunar.d.ts           # minimal typings for lunar-javascript
├── tests/                    # vitest suite (220+ cases, jsdom environment)
├── .github/workflows/        # CI: typecheck + tests + build, then Pages deploy
├── LICENSE                   # MIT
└── package.json
```

## 🔬 Methods & trade-offs

| Step | Method | Notes |
| --- | --- | --- |
| Stem/branch calc | lunar-javascript (solar terms to the minute) | Year pillar bounded by Lichun, month by the 12 Jie; late Zi hour uses school 2 (after 23:00 the day pillar stays with the current day while the hour stem follows the next day) |
| True solar time | 4 min/degree longitude + Spencer 1971 EoT | Each independently switchable; historical zones (e.g. Republican-era five zones) need a manual UTC-offset tweak |
| Historical clocks | Exact 1986–1991 DST period table (matches tzdata) | In-range births get a warning and a one-click -1 hour correction; pre-1949 births get a five-zone note |
| Element strength | Hidden-stem weighting + month ×1.5 + support share | Simplified Zi Ping; excludes chart structures (格局) |
| Favorable elements | Support/restrain (扶抑) + seasonal (调候) side by side | Weak → support; strong → drain; balanced → top up the weakest; seasonal table from Qiong Tong Bao Jian, disagreements shown side by side |
| Branch interactions | Standard tables for harmonies/trines/assemblies/clashes/punishments/harms | Display only; not yet folded into element scoring |
| Life gua | Universal digit-root formula, Lichun-bounded year | A result of 5 maps to Kun for men, Gen for women |
| House gua | Sitting direction (opposite the facing) mapped via the standard Later Heaven trigram table | Shares the same wandering-star table as the life gua |
| Feng shui directions | Standard Eight Mansions wandering-stars table | 生气/天医/延年/伏位 + 祸害/五鬼/六煞/绝命 |
| Tai Sui | Birth-year branch vs. annual branch: value/clash/punishment/harm/break lookup | Folk reference, not a rigorous professional judgment |
| Compatibility score | Weighted sum over day-stem combination / day-branch relation / zodiac relation / element complement / gua grouping | 0–100 is a sorting aid only, not a professional matchmaking reading |
| Calendar score | Day-pillar clash −3, punishment/harm −2, six harmony +1, favorable stem +2 / unfavorable −1 | Layered on lunar-javascript's built-in daily do's/don'ts |
| Unknown hour | Casts all twelve traditional hour blocks (using each one's conventional start time) | Separates stable vs. sensitive conclusions rather than guessing one answer |
| Auspicious stars / Peach Blossom | Nobleman/Academic/Prosperity/Blade looked up by day stem; Traveling Horse/General/Canopy/Peach Blossom looked up by year- and day-branch trine group | Static lookup tables, cultural reference only |
| Bundle size | lunar-javascript is a single ~426KB file that resists tree-shaking — it dominates the main bundle; secondary views (compatibility, calendar, live compass, image export) are lazy-loaded via dynamic `import()` | Forking/replacing the calendar engine was evaluated and shelved — too much correctness risk for a birth-chart app relative to the payoff; code-splitting was the safer win |

## ⚠️ Disclaimer

All output is derived from published traditional rules via transparent, simplified algorithms, and is provided **for cultural education, reference, and entertainment only**. A full professional reading weighs many additional factors (chart structures, how combinations transform the element balance) and varies by practitioner. Please do not base medical, financial, marital, or other major life decisions on this app.

## 🔒 Privacy

- All computation happens 100% locally in your browser; birth data is never uploaded to any server;
- saved profiles live only in your browser's localStorage — export them for backup or clear them with one click;
- only when you search for a place outside the built-in list is that place name sent to the public OpenStreetMap Nominatim service.

## 🙏 Credits

- [lunar-javascript](https://github.com/6tail/lunar-javascript) (6tail) — the dependency-free solar/lunar/stem-branch/solar-term library at the heart of this project;
- [OpenStreetMap Nominatim](https://nominatim.org/) — place search;
- UI typefaces: [Noto Serif SC / Noto Sans SC](https://fonts.google.com/noto).

## 📄 License

[MIT](LICENSE) © 2026 Daniel Xu
