# Haunted Rooms – förklaring av styles.css

`styles.css` är den gemensamma stilmallen. Den laddas av alla fem sidor och ger webbplatsen dess gemensamma design: färger, typsnitt, sidhuvud, meny, sidfot, startsidan och grunden för bokningssidorna.

Varje rum har dessutom en egen CSS-fil, till exempel `possessed-doll.css`, som laddas **efter** `styles.css`:

```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="possessed-doll.css">
```

Rummets egna regler går därför före de gemensamma när två regler är lika specifika. Se dokumenten för respektive rum i `docs/`.

## Filens delar

| Del | Innehåll |
| --- | --- |
| Variabler | Gruppens färger, kompletterande färger, typsnitt, mått, samt rummens accentfärger och bilder |
| Grundinställningar | Regler för hela sidan: `[hidden]`, `box-sizing`, typografi, länkar, fokus |
| Knappar | `.button` med varianterna `.button-primary`, `.button-secondary` och `.button-light` |
| Sidhuvud och meny | Logga, meny, markering av aktuell sida och mobilmenyn |
| Startsidan | Heron med spökhuset, om oss, rumslistan med bilder och stegen |
| Bokningssidorna | Inledningen med rummets bild, formuläret, kort, fält, fel, pris och bekräftelse |
| Sidfot | Gemensam för alla sidor |
| Minska rörelse | Stänger av animationer för den som har valt det |

## Kaskaden

CSS står för Cascading Style Sheets. När flera regler gäller samma element vinner den mest specifika selektorn: en klass slår ett elementnamn, och ett id slår en klass. Om två regler är lika specifika vinner den som står sist. Därför står allmänna regler först i filen och specialfall senare, och därför laddas rummens egna filer sist.

## Färger och variabler

```css
:root {
  --background: #f2e8d5;
  --foreground: #1b1b1f;
  --accent-orange: #ff6a00;
  --accent-purple: #5a2a82;
  --accent-green: #2f6b3a;
}
```

De fem första variablerna är gruppens gemensamma färger. Kompletterande variabler, som `--night`, `--paper`, `--line`, `--muted` och `--error`, ligger i ett eget `:root`-block. En variabel används med `var()`, till exempel `color: var(--foreground);`. När gruppen vill byta färgtema räcker det att ändra värdena här.

### Rummens färg och bild

Varje rum får en accentfärg och en bild genom attributet `data-activity` på `<body>`, och genom `data-room` på raderna i rumslistan på startsidan:

```css
[data-activity="doll"], [data-room="doll"] { --room-accent: var(--accent-orange); }
[data-activity="doll"] { --room-image: url("images/possessed-doll.jpg"); }
[data-activity="doll"] { --room-image-position: 25% 30%; }
```

Hakparenteserna är en attributselektor. Variablerna ärvs nedåt, så en regel som `border-bottom: 10px solid var(--room-accent);` får rätt färg i varje rum. `--room-image-position` anger vilken del av bilden som syns när den beskärs, så att rummets motiv inte hamnar utanför.

## Grundinställningar

- **`[hidden] { display: none !important; }`** gör att JavaScript alltid kan dölja element med attributet `hidden`, även om en klass sätter `display`.
- **`box-sizing: border-box`** räknar in ram och utfyllnad i bredden, så att layouten blir förutsägbar.
- **`p { max-width: 65ch; }`** begränsar stycken till ungefär 65 tecken per rad, så att texten blir lätt att läsa.
- **`.container`** centrerar innehållet och gör det högst 68 rem brett med `width: min(100% - 2.5rem, var(--content-width))`.
- **`:focus-visible`** ger en tydlig orange fokusram för den som använder tangentbordet.

## Sidhuvud och meny

Sidhuvudet har `position: sticky`, så att det stannar överst när man skrollar. Den aktuella sidan får en orange linje under länken med selektorn `.site-nav a[aria-current="page"]`. Attributet sätts av `app.js`.

På skärmar smalare än 900 pixlar fälls menyn ihop bakom knappen "Menu". Reglerna börjar med `.js`, så att de bara gäller när JavaScript är igång:

```css
@media (max-width: 900px) {
  .js .nav-toggle { display: block; }
  .js .site-nav { display: none; }
  .js .site-nav.is-open { display: block; }
}
```

## Startsidan

**Heron** är mörk, och himlen ljusnar mot horisonten med en `linear-gradient`, så att spökhusets siluett syns tydligt.

**Spökhuset** är ritat i SVG direkt i `index.html`. Formerna har klasser, och CSS ger färgerna med `fill` och `stroke`, till exempel `.window { fill: var(--accent-orange); }`. Scenens höjd följer bredden med `aspect-ratio: 1200 / 400`, så att huset och månen syns hela på alla skärmar. `min-height` och `max-height` hindrar att den blir för liten eller för stor. Ett fönster flimrar svagt med animationen `flicker`.

**Rumslistan** har en bild per rum. `.room-image` behåller formatet 16:9 med `aspect-ratio` och beskärs med `object-fit: cover` i stället för att förvrängas. Raden är ett grid som får fler kolumner på bredare skärmar.

**Stegen** "How it works" numreras av CSS med en räknare: `counter-reset`, `counter-increment` och `content: counter(step)` i `::before`.

## Bokningssidorna

**Inledningen**, `.page-intro`, visar rummets bild från `--room-image`. Ett mörkt lager som börjar genomskinligt upptill och blir mörkt nedtill gör att texten längst ned alltid går att läsa, samtidigt som motivet syns. En tjock kant i rummets accentfärg avslutar inledningen.

**Formuläret** har regler för stegrubriker, fält, felmeddelanden, prisrutan och bekräftelsen. Några exempel:

| Selektor | Vad den gör |
| --- | --- |
| `.field input[aria-invalid="true"]` | Röd ram på fält med fel. Attributet sätts av rummets JavaScript |
| `.field-error` | Felmeddelande med röd text och en röd linje till vänster |
| `.price-output.is-warning` och `.is-total` | Prisrutan i varningsläge och med beräknat pris |
| `.offer-card.is-selected` | Valt erbjudande, med mörk bakgrund och en bock |
| `.confirmation` | Bekräftelsen, en mörk ruta med kant i rummets färg |

Rummen använder dessa regler i olika grad. Den som vill ha en egen design skriver sina regler i rummets CSS-fil.

## Layout och responsivitet

Allt ligger under varandra på smala skärmar, och mediafrågor lägger saker bredvid varandra när det finns plats. Flexbox används för saker på en rad, som sidhuvudet och knapparna. Grid används för rader och kolumner som ska linjera, som rumslistan och stegen. `clamp(minsta, önskat, största)` låter storlekar växa med skärmen inom fasta gränser.

## Tillgänglighet

- Tillstånd visas med mer än färg: bockar, text och linjer.
- Text och bakgrund har hög kontrast. Lila och grönt används bara till kanter och detaljer.
- `@media (prefers-reduced-motion: reduce)` stänger av animationer för den som har valt "minska rörelse".
