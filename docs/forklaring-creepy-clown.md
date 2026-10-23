# The Creepy Clown Room – förklaring av creepy-clown.js och creepy-clown.css

Ansvarig: Jon

Sidan `creepy-clown.html` laddar de gemensamma `styles.css` och `app.js` för sidhuvud, meny och sidfot, och rummets egna `creepy-clown.css` och `creepy-clown.js`. Den här texten beskriver i grova drag rummets egna filer.

## creepy-clown.js

### Data

```javascript
const MIN_HOURS = 1;
const MAX_HOURS = 5;
const offers = [
  { id: "clown-funhouse", name: "Funhouse", description: "…", pricePerHour: 250 },
  { id: "clown-red-balloon", name: "Red Balloon", description: "…", pricePerHour: 310 },
  { id: "clown-showtime", name: "Showtime", description: "…", pricePerHour: 400 }
];
```

Priset räknas per timme. Felmeddelandet för antal timmar ligger i konstanten `HOURS_ERROR`, så att samma text används både i prisrutan och vid valideringen.

### Flödet

| Del | Hur den fungerar |
| --- | --- |
| Erbjudandena | `createOfferCard(offer)` bygger HTML-koden för ett kort som en mallsträng. `renderOffers()` gör ett kort per erbjudande med `offers.map(createOfferCard).join("")` och lägger in dem med `innerHTML` |
| Välja | En enda klicklyssnare sitter på listan. `event.target.closest("[data-id]")` tar reda på vilket kort som klickades (event delegation). `updateSelection()` sätter `aria-pressed` på korten, och CSS visar "✓ Vald" på det valda kortet |
| Läsa formuläret | `readBooking()` returnerar valt erbjudande och antal timmar som ett objekt. Det används av både priset, valideringen och bekräftelsen |
| Pris | `calculateTotalPrice(pricePerHour, hours)` multiplicerar. `updatePriceDisplay()` visar priset eller ett meddelande, och lägger klassen `total-price-box--ready` på prisrutan när priset går att räkna ut |
| Validering | Små funktioner med en regel var: `isValidName`, `isValidEmail` och `isValidHours`. `validateForm()` använder dem och visar ett felmeddelande vid varje fält som är fel |
| Knapparna | `updateActionButtons()` körs vid varje ändring. Bekräfta-knappen går att klicka på ända tills förfrågan är bekräftad, så att felmeddelandena kan visas om något saknas. När `isFormComplete()` säger att allt är rätt ifyllt får knappen klassen `btn-ready` och blir orange. Börja om markeras när något har fyllts i |
| Bekräftelse | `showConfirmation()` skriver in uppgifterna med `textContent`, och antalet visas med enhet, till exempel "2 timmar". `setFormLocked(true)` låser fälten och korten |
| Börja om | `resetBooking()` tömmer fälten, nollställer valt erbjudande, sätter antalet till 1, tar bort fel och bekräftelse och låser upp formuläret |

### Följ ett klick genom koden

1. Besökaren klickar på "Red Balloon". Lyssnaren på listan hittar kortet med `closest` och sparar `"clown-red-balloon"` i `selectedOfferId`.
2. `updateSelection()` sätter `aria-pressed="true"` på kortet, och CSS byter "Välj" mot "✓ Vald".
3. `updatePriceDisplay()` räknar ut `calculateTotalPrice(310, 1)` och visar 310 kr.
4. `updateActionButtons()` kontrollerar om hela formuläret är ifyllt. Om det är det blir bekräfta-knappen orange. Klickar man innan allt är ifyllt visar `validateForm()` ett felmeddelande vid varje fält som behöver rättas.

## creepy-clown.css

**Nästlad CSS.** Alla regler ligger inuti `.creepy-clown-room { … }`, med CSS nesting och tecknet `&`, till exempel `&:hover`. Reglerna gäller därför bara i Jons del av sidan och påverkar inte gruppens sidhuvud och sidfot.

**Bakgrund och kort.** Sidan har en mörk bakgrund med rummets bild. Innehållet ligger i ett ljust kort, `.room-card`, med en randig kant i orange och lila överst, gjord med `repeating-linear-gradient`.

**Erbjudandena.** Varje kort har en orange kant till vänster. Det valda kortet, `[aria-pressed="true"]`, får lila kant och ljuslila bakgrund, och texten "Välj" byts mot "✓ Vald". Valet syns alltså både med färg och med text. På skärmar som är minst 800 pixlar breda ligger de tre korten bredvid varandra.

**Steg och pris.** "Timmar och pris" och "Dina uppgifter" ligger bredvid varandra i ett grid på bredare skärmar. Prisrutan ändrar utseende med klassen `total-price-box--ready` när priset är uträknat.

**Knappar och bekräftelse.** Knapparna byter utseende med klasserna `btn-ready`, `btn-sent` och `btn-active` från JavaScript. Bekräftelsen glider in med animationen `clown-summary-in`.

**Anpassning till styles.css.** Ett avsnitt i filen återställer Jons eget utseende där regler från `styles.css` annars skulle ta över, till exempel typsnittet på rubrikerna och den röda linjen vid felmeddelandena.
