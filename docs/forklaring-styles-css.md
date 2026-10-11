# Haunted Rooms – förklaring av styles.css

Oct 11, 2026 · @Peter A

## Översikt

`styles.css` är den enda stilmallen och används av alla fem sidor. Därför ser sidorna likadana ut, och en ändring på ett ställe slår igenom överallt.

Filen är ordnad från det allmänna till det specifika:

| Del | Innehåll |
| --- | --- |
| Variabler | Gruppens färger, kompletterande färger, typsnitt, mått och rummens accentfärger |
| Grundinställningar | Regler för hela sidan: `[hidden]`, `box-sizing`, typografi, länkar, fokus |
| Knappar | Tre varianter som används på alla sidor |
| Sidhuvud och navigering | Logga, meny och mobilmeny |
| Startsidan | Hero med SVG-scen, om oss, rumslistan och stegen |
| Bokningssidorna | Inledning, formulär, erbjudandekort, fält, fel, pris och bekräftelse |
| Sidfot | Gemensam för alla sidor |
| Minska rörelse | Stänger av animationer för den som har valt det |

**Kaskaden** är det som ger CSS dess namn, Cascading Style Sheets. När flera regler gäller samma element avgörs vilken som vinner av två saker. Först gäller den mest specifika selektorn: en klass slår ett elementnamn, och ett id slår en klass. Om två regler är lika specifika vinner den som står sist i filen. Det är därför allmänna regler står först och specialfall senare.

Filen använder nästan bara klasser som selektorer, till exempel `.offer-card`, och sällan id:n. Det gör reglerna lätta att återanvända och svårare att råka krocka med.

## Färger och variabler

Alla färger, typsnitt och vissa mått ligger som variabler (custom properties) överst i filen. När gruppen bestämmer sitt färgtema räcker det att ändra värdena där.

```css
:root {
  --background: #f2e8d5;
  --foreground: #1b1b1f;
  --accent-orange: #ff6a00;
  --accent-purple: #5a2a82;
  --accent-green: #2f6b3a;
}
```

`:root` betyder det yttersta elementet, `<html>`, så variablerna gäller på hela sidan. En variabel skapas med två bindestreck först i namnet och används med `var()`, till exempel `color: var(--foreground);`.

### Gruppens färger och de kompletterande

De fem första variablerna kommer från gruppens första `styles.css` och har samma namn. De kompletterande ligger i ett eget `:root`-block, så att det syns vad som är gemensamt och vad som har lagts till.

| Variabel | Värde | Används till |
| --- | --- | --- |
| `--background` | `#f2e8d5` | Pergamentbakgrund och ljus text på mörka ytor |
| `--foreground` | `#1b1b1f` | Text, sidhuvud, valt kort, prisrutan |
| `--accent-orange` | `#ff6a00` | Knappar, markering av vald sida, bocken, fokusram |
| `--accent-purple` | `#5a2a82` | Herrgårdens accent, dörren i SVG-scenen |
| `--accent-green` | `#2f6b3a` | Mentalsjukhusets accent |
| `--night` | `#121116` | Heron, sidans inledning, bekräftelsen, sidfoten |
| `--paper` | `#fbf5ea` | Kort och fält på pergamentbakgrunden |
| `--line` | `#ddcfb4` | Tunna linjer |
| `--muted` | `#5b5560` | Sekundär text, till exempel beskrivningar |
| `--error` | `#a3171f` | Felmeddelanden |
| `--accent-red` | `#b3122b` | Clownrummets accent |

`--error` är ett mörkare rött än `--accent-red`, för att felmeddelanden ska vara lätta att läsa mot den ljusa bakgrunden.

### Typsnitt och mått

`--font-display` är IM Fell English, ett typsnitt som liknar gammalt tryck, och används för stora rubriker. `--font-body` är Familjen Grotesk för brödtext. Efter typsnittets namn står reservtypsnitt, som används om Google Fonts inte går att nå. `--content-width: 68rem` bestämmer hur brett innehållet får bli.

### Rummens accentfärger

Varje rum får en egen färg genom att variabeln `--room-accent` skrivs om beroende på ett HTML-attribut:

```css
[data-activity="mansion"], [data-room="mansion"] { --room-accent: var(--accent-purple); }
[data-activity="doll"],    [data-room="doll"]    { --room-accent: var(--accent-orange); }
[data-activity="asylum"],  [data-room="asylum"]  { --room-accent: var(--accent-green); }
[data-activity="clown"],   [data-room="clown"]   { --room-accent: var(--accent-red); }
```

Hakparenteserna är en attributselektor. På bokningssidan har `<body>` attributet `data-activity`, och i rumslistan på startsidan har varje rad `data-room`. Variabler ärvs nedåt till alla element inuti, så en regel som `border-left: 6px solid var(--room-accent);` får automatiskt rätt färg i varje rum. Samma CSS-kod ger alltså fyra olika färger. Det är samma attribut som JavaScript använder för att välja rätt erbjudanden.

## Grundinställningar

### `[hidden]` döljer alltid

```css
[hidden] {
  display: none !important;
}
```

JavaScript döljer felmeddelanden, bekräftelsen och skicka-knappen med attributet `hidden`. Utan den här regeln fungerade det inte på knappen, eftersom `.button` sätter `display: inline-block`, och den regeln vann över webbläsarens egen regel för `hidden`. `!important` gör att den här regeln alltid gäller. Det är ett av få tillfällen där `!important` är motiverat.

### `box-sizing: border-box`

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

`*` betyder alla element. Normalt läggs ram och utfyllnad (padding) till utöver bredden, så en ruta med `width: 100%` och `padding: 1rem` blir bredare än sin förälder. Med `border-box` räknas ram och utfyllnad in i bredden, vilket gör layouten förutsägbar.

### Typografi

`body` får brödtextens typsnitt, storleken `1.0625rem` (17 pixlar) och radhöjden `1.6`, som gör längre text lätt att läsa. `h1` och `h2` använder det gammaldags typsnittet, medan `h3` använder brödtextens typsnitt i fetstil.

`p { max-width: 65ch; }` begränsar stycken till ungefär 65 tecken per rad. Enheten `ch` är bredden av tecknet "0". Raderna blir då inte för långa att läsa på stora skärmar.

`rem` är en enhet relativt till webbläsarens grundstorlek, vanligtvis 16 pixlar. Om besökaren har valt större text i webbläsaren växer allt som är angivet i `rem`.

### `.container`

```css
.container {
  width: min(100% - 2.5rem, var(--content-width));
  margin-inline: auto;
}
```

`min()` väljer det minsta av två värden. På en mobil blir innehållet hela bredden minus 2,5 rem marginal, och på en stor skärm högst 68 rem. `margin-inline: auto` centrerar innehållet vågrätt.

### Fokus

```css
:focus-visible {
  outline: 3px solid var(--accent-orange);
  outline-offset: 3px;
}
```

`:focus-visible` är en pseudoklass som gäller när ett element har fokus och webbläsaren bedömer att fokusmarkeringen ska synas, till exempel vid Tab-tangenten men inte vid musklick. Den som använder tangentbordet ser då alltid var den är.

`.skip-link` är länken "Skip to content" som ligger utanför skärmen tills den får fokus. Den låter tangentbordsanvändare hoppa förbi menyn. `.visually-hidden` gömmer text för ögat men låter skärmläsare läsa den, och används för formulärets osynliga rubrik.

## Knappar, sidhuvud och mobilmeny

### Knappar

Alla knappar har klassen `.button`, som ger form, typsnitt och utfyllnad. En andra klass bestämmer färgerna. Det kallas modifierarklass och betyder att grunden skrivs en gång.

| Klass | Utseende | Används på |
| --- | --- | --- |
| `.button-primary` | Orange med mörk text | Huvudhandlingar: boka, skicka, välj rum |
| `.button-secondary` | Mörk kantlinje på ljus bakgrund | Start over |
| `.button-light` | Ljus kantlinje på mörk bakgrund | How it works i heron |

På de orange knapparna är texten mörk i stället för vit. Vit text på orange har för låg kontrast för att vara lättläst, medan mörk text på orange ger god kontrast.

`:hover` ändrar färgen när muspekaren är över knappen, och `transition` gör att färgen glider över på 0,15 sekunder i stället för att hoppa. `border-radius: 999px` ger helt rundade kortsidor oavsett knappens höjd.

### Sidhuvud

`.site-header` har `position: sticky` och `top: 0`. Sidhuvudet följer då med och stannar överst när man skrollar. `z-index: 10` lägger det ovanpå innehållet som skrollar under.

`.header-inner` använder flexbox: `display: flex` lägger loggan och menyn på rad, `justify-content: space-between` trycker isär dem och `flex-wrap: wrap` låter menyn hamna på en ny rad om utrymmet inte räcker.

Den aktuella sidan får en orange linje under länken:

```css
.site-nav a[aria-current="page"] {
  border-bottom-color: var(--accent-orange);
}
```

Selektorn betyder "en länk i menyn som har attributet `aria-current` med värdet `page`". JavaScript sätter attributet, och CSS ritar linjen.

### Mobilmenyn

På skärmar smalare än 900 pixlar fälls menyn ihop bakom knappen "Menu":

```css
@media (max-width: 900px) {
  .js .nav-toggle { display: block; }
  .js .site-nav { display: none; width: 100%; }
  .js .site-nav.is-open { display: block; }
}
```

`@media` är en mediafråga: reglerna inuti gäller bara när villkoret är uppfyllt. `.js` i början av varje selektor betyder att regeln bara gäller när JavaScript har lagt klassen `js` på `<html>`. Om JavaScript inte körs syns menyn alltid. `.is-open` läggs till och tas bort av JavaScript när knappen klickas.

Brytpunkten 900 pixlar är vald för att de fem menylänkarna med långa rumsnamn inte får plats på en rad bredvid loggan på smalare skärmar.

## Startsidan

### Hero

Heron är den mörka inledningen med rubriken "Haunted Rooms". `.hero` har `display: flex` och `flex-direction: column`, så att texten och SVG-scenen läggs under varandra. `overflow: hidden` klipper bort det som sticker ut, så att scenen aldrig ger en vågrät rullningslist.

Rubrikens storlek anges med `clamp()`:

```css
.hero h1 {
  font-size: clamp(3.2rem, 11vw, 7.5rem);
}
```

`clamp(minsta, önskat, största)` låter storleken växa med skärmen men aldrig bli mindre än 3,2 rem eller större än 7,5 rem. `vw` betyder procent av skärmens bredd, så `11vw` är 11 procent av bredden. Rubriken blir därmed stor på en datorskärm och lagom på en mobil, utan någon mediafråga.

### SVG-scenen

Spökhuset, månen, träden och staketet är ritade i SVG direkt i HTML-koden, utan bildfiler. Varje del har en klass, och CSS ger färgerna med `fill` (fyllning) och `stroke` (linje):

| Klass | Färg | Del av bilden |
| --- | --- | --- |
| `.moon` | `--background` | Månen |
| `.hills` | `--night-soft` | Kullarna bakom huset |
| `.house`, `.ground`, `.fence` | nästan svart | Huset, marken och staketet |
| `.tree` | linje, nästan svart | De kala träden |
| `.window` | `--accent-orange` | Upplästa fönster |
| `.window-dark` | `--night-soft` | Mörka fönster |
| `.door` | `--accent-purple` | Dörren |

Eftersom färgerna styrs av variablerna följer bilden med om gruppen byter färgtema.

Ett fönster flimrar svagt med en animation:

```css
.window-flicker {
  animation: flicker 7s infinite;
}

@keyframes flicker {
  0%, 18%, 22%, 60%, 64%, 100% { opacity: 1; }
  20%, 62% { opacity: 0.25; }
}
```

`@keyframes` beskriver vad som händer under animationens gång, angivet i procent av tiden. Under sju sekunder dimmas fönstret två korta gånger, och sedan börjar det om. Det är den enda rörelsen på sidan som sker av sig själv.

### Om oss och rumslistan

`.about-grid` använder grid. På smala skärmar ligger rubrik och text under varandra, och från 860 pixlar ligger de bredvid varandra med `grid-template-columns: 1fr 1.6fr`. `fr` betyder en andel av det lediga utrymmet, så textkolumnen blir 1,6 gånger bredare än rubrikkolumnen.

Varje rad i rumslistan, `.room-row`, har en färgad kant till vänster i rummets accentfärg. Från 800 pixlar delas raden i tre kolumner: `15rem 1fr auto`. Rumsnamnet får en fast bredd, beskrivningen tar resten av platsen och knappen blir så bred den behöver.

### Stegen

"How it works" är en numrerad lista, `<ol>`. Siffrorna ritas av CSS med en räknare:

```css
.steps { counter-reset: step; }
.steps li { counter-increment: step; }
.steps li::before { content: counter(step); }
```

`counter-reset` startar räknaren, `counter-increment` ökar den med ett för varje listpunkt och `::before` skriver ut värdet i en rund ruta före texten. `::before` är ett pseudoelement, ett extra element som CSS skapar utan att det finns i HTML-koden.

## Bokningssidorna

### Sidans inledning

`.page-intro` är den mörka rutan med rummets namn. Den har en tjock kant i nederkant i rummets accentfärg, `border-bottom: 10px solid var(--room-accent)`, så att varje rum känns igen direkt.

### Formulärets uppbyggnad

```css
.booking-layout > * {
  max-width: 48rem;
}
```

`>` betyder direkta barn. Formuläret och bekräftelsen blir högst 48 rem breda men börjar i samma vänsterkant som rubriken ovanför. Ett formulär som är för brett är svårare att fylla i.

Webbläsaren ritar normalt en ram runt `<fieldset>`. `.booking-fields` och `.form-step` tar bort den med `border: 0`, `margin: 0` och `padding: 0`. `min-width: 0` behövs eftersom en fieldset annars vägrar bli smalare än sitt innehåll, vilket kan ge vågrät rullning på mobilen.

Stegrubrikerna har ett nummer i en rund ruta, `.step-number`. `display: grid` och `place-items: center` centrerar siffran både vågrätt och lodrätt.

### Erbjudandekorten

Korten ligger i ett grid som är en kolumn på mobil och tre kolumner från 640 pixlar, `repeat(3, 1fr)`. Varje kort har en tjockare överkant i rummets accentfärg.

Det valda kortet ska synas tydligt på flera sätt samtidigt:

| Selektor | Effekt |
| --- | --- |
| `.offer-card.is-selected` | Mörk bakgrund, ljus text och orange ram |
| `.offer-card.is-selected .offer-price` | Priset blir orange |
| `.offer-card.is-selected::after` | En orange rund bock i hörnet |

Två klasser direkt efter varandra utan mellanslag, `.offer-card.is-selected`, betyder ett element som har båda klasserna. Med mellanslag, `.offer-card.is-selected .offer-price`, betyder det ett element med klassen `offer-price` inuti ett valt kort.

Bocken skapas med `::after` och `content: "✓"`. Kortet har `position: relative`, och bocken har `position: absolute` med `top` och `right`. Det placerar bocken i kortets hörn, oavsett hur stort kortet är.

Efter bekräftelsen är korten avstängda. `.offer-card:disabled:not(.is-selected)` gör de kort som inte valdes halvt genomskinliga med `opacity: 0.45`. Det valda kortet syns som vanligt, så att man ser vad som bokades.

### Fält och felmeddelanden

Fälten får ram, utfyllnad och samma typsnitt som resten av sidan med `font: inherit`. Utan det använder webbläsaren ofta ett eget, mindre typsnitt i fält.

```css
.field input[aria-invalid="true"] {
  border-color: var(--error);
}
```

JavaScript sätter `aria-invalid="true"` på ett fält med fel, och CSS ger då fältet röd ram. Samma attribut talar om för skärmläsare att fältet är felaktigt. CSS styr alltså utseendet utifrån tillståndet i stället för utifrån en extra klass.

`.field-error` är texten under fältet. Den är mörkröd, halvfet och har en röd linje till vänster, så att den syns tydligt och hör ihop med fältet ovanför.

### Prisvisningen

`.price-output` har tre utseenden som styrs av klasserna från JavaScript:

| Klass | Utseende | När |
| --- | --- | --- |
| ingen | Grå ruta med dämpad text | Startmeddelandet |
| `.is-warning` | Ljusröd ruta med röd text | Ogiltigt antal |
| `.is-total` | Mörk ruta, större fet text och orange kant | Ett beräknat totalpris |

### Bekräftelsen

`.confirmation` är en mörk ruta med en tjock kant i rummets färg. Den skiljer sig tydligt från det ljusa formuläret, så att det syns att förfrågan är avslutad. Sammanfattningen är en definitionslista, `<dl>`, som ställs upp i två kolumner med `grid-template-columns: max-content 1fr`: rubrikerna blir precis så breda de behöver, och värdena får resten. Under 480 pixlar läggs de under varandra.

`overflow-wrap: anywhere` på värdena gör att en lång e-postadress kan brytas i stället för att sticka ut ur rutan.

## Layout och responsivitet

Sidan anpassar sig till skärmens bredd. Grundregeln är att allt ligger under varandra på smala skärmar, och mediafrågor lägger saker bredvid varandra när det finns plats. Det kallas mobile first.

### Flexbox och grid

Filen använder två layoutverktyg, och de har olika styrkor:

| Verktyg | Passar för | Exempel i filen |
| --- | --- | --- |
| Flexbox, `display: flex` | Saker på en rad som får radbrytas | Sidhuvudet, knapparna i heron och under formuläret, sidfoten |
| Grid, `display: grid` | Rader och kolumner som ska linjera | Om oss, rumslistan, stegen, erbjudandekorten, sammanfattningen |

`gap` anger avståndet mellan delarna i både flexbox och grid, så att man slipper marginaler på varje enskilt element.

### Brytpunkterna

| Bredd | Vad som ändras |
| --- | --- |
| Under 480 pixlar | Sammanfattningen läggs i en kolumn |
| Från 640 pixlar | Erbjudandekorten läggs i tre kolumner |
| Från 760 pixlar | Stegen läggs i tre kolumner |
| Från 800 pixlar | Rumslistan delas i namn, beskrivning och knapp |
| Från 860 pixlar | Om oss läggs i två kolumner |
| Under 900 pixlar | Menyn fälls ihop bakom knappen Menu |

Brytpunkterna är valda utifrån när innehållet får plats, inte utifrån särskilda enheter. Tre erbjudandekort får till exempel plats bredvid varandra tidigare än rumslistans tre delar.

### Storlekar som växer

I stället för många mediafrågor använder filen `clamp()` för rubriker, avstånd och SVG-scenens höjd. Exempel: `.section` har `padding-block: clamp(3rem, 7vw, 5.5rem)`, så avståndet mellan sektionerna växer jämnt med skärmen. `padding-block` betyder utfyllnad upptill och nedtill.

## Tillgänglighet och designval

Flera val i CSS-filen är gjorda för att sidan ska vara lättläst och fungera för alla, och de motsvarar kriteriet för väl godkänt om genomtänkt interaktion.

### Inte bara färg

Kriteriet kräver att fel och val förmedlas med mer än färg. CSS-filen visar varje tillstånd på minst två sätt:

| Tillstånd | Färg | Utöver färg |
| --- | --- | --- |
| Valt erbjudande | Orange ram och mörk bakgrund | En bock, texten "Selected: …" |
| Fel i ett fält | Röd ram och röd text | Ett skriftligt felmeddelande med en linje till vänster |
| Beräknat pris | Mörk ruta med orange kant | Större och fetare text |
| Avslutad förfrågan | Mörk ruta i rummets färg | En rubrik, låsta fält, skicka-knappen borta |
| Aktuell sida i menyn | Orange linje | Linjen är en form under länken |

### Kontrast

Text och bakgrund har valts så att kontrasten blir hög: mörk text på pergament, ljus text på de mörka ytorna och mörk text på orange knappar. Färgerna lila och grönt används bara till kanter och detaljer, inte till text, eftersom de ger för låg kontrast mot den mörka bakgrunden.

### Tangentbord och skärmläsare

- `:focus-visible` ger en tydlig orange fokusram för den som navigerar med tangentbordet.
- "Skip to content" låter tangentbordsanvändare hoppa förbi menyn.
- CSS ställer in utseendet utifrån tillgänglighetsattributen `aria-current` och `aria-invalid`. Då stämmer det som syns alltid med det som skärmläsare läser upp.

### Minska rörelse

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .window-flicker { animation: none; }
  .button { transition: none; }
}
```

Vissa personer blir illamående eller störda av rörelse på skärmen och har därför valt "minska rörelse" i sitt operativsystem. Den här mediafrågan stänger då av det flimrande fönstret, den mjuka skrollningen och övergångarna på knapparna.

### När gruppen bestämmer färgtema

Eftersom alla färger går via variablerna räcker det att ändra värdena i de två `:root`-blocken överst i filen. Knappar, kort, fel, pris, bekräftelse, rumsfärger och till och med SVG-scenen följer då med automatiskt. Kontrollera efteråt att texten fortfarande är lätt att läsa mot de nya bakgrundsfärgerna.
