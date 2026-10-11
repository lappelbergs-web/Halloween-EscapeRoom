# Haunted Rooms – förklaring av app.js

Oct 11, 2026 · @Peter A

## Översikt

`app.js` är den enda JavaScript-filen och laddas av alla fem sidor. Den sköter två saker: navigeringen, som finns på alla sidor, och bokningen, som bara körs på de fyra rumssidorna.

Filen läses uppifrån och ned i den här ordningen:

| Del | Innehåll | Körs på |
| --- | --- | --- |
| Data | Konstanterna `MIN_QUANTITY` och `MAX_QUANTITY` samt objektet `ACTIVITIES` med alla erbjudanden | Alla sidor (läses in direkt) |
| Start | `DOMContentLoaded` som anropar fyra startfunktioner | Alla sidor |
| Navigering och sidfot | `setupMobileMenu`, `markCurrentPage`, `showCurrentYear` | Alla sidor |
| Bokning | Tillstånd, erbjudanden, pris, validering, bekräftelse och Start over | Bara sidor med `data-activity` |
| Hjälpfunktioner | `formatPrice`, `formatQuantity` | Används av bokningen |

Scriptet laddas med `<script src="app.js" defer></script>`. Ordet `defer` betyder att webbläsaren läser in hela HTML-sidan först och kör JavaScript efteråt, så att alla element finns när koden letar efter dem.

Allra överst står `"use strict";`. Det slår på strikt läge, där webbläsaren säger ifrån vid vanliga misstag, till exempel om man råkar använda en variabel som aldrig har deklarerats.

## Data: konstanter och erbjudanden

All data som kan ändras ligger samlad överst i filen, så att ett nytt pris eller en ny gräns bara behöver ändras på ett ställe.

```javascript
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 5;
```

`const` betyder att variabeln inte kan få ett nytt värde. Namnen i versaler är en vanlig konvention för fasta värden. Gränserna 1 och 5 används både i prisvisningen, valideringen och felmeddelandena, så om gränsen någon gång blir 1 till 8 räcker det att ändra `MAX_QUANTITY`.

`ACTIVITIES` är ett objekt med en nyckel per rum: `mansion`, `doll`, `asylum` och `clown`. Varje rum är i sin tur ett objekt med enheten och en array med erbjudanden:

```javascript
mansion: {
  unitSingular: "player",
  unitPlural: "players",
  offers: [
    { id: "mansion-classic", name: "Classic Haunting",
      description: "60 minutes with hints whenever you need them. A good first scare.",
      pricePerUnit: 250 },
    …
  ]
}
```

Varje erbjudande har fyra egenskaper:

| Egenskap | Datatyp | Används till |
| --- | --- | --- |
| `id` | sträng | Ett unikt namn som koden känner igen erbjudandet på när det väljs |
| `name` | sträng | Rubriken på kortet och i sammanfattningen |
| `description` | sträng | Den korta beskrivningen på kortet |
| `pricePerUnit` | tal | Priset per spelare, som används i prisberäkningen |

`unitSingular` och `unitPlural` finns för att texten ska bli rätt grammatiskt: "1 player" men "3 players".

Vilket rum som gäller avgörs av HTML-sidan. Varje rumssida har till exempel `<body data-activity="mansion">`, och koden hämtar sedan `ACTIVITIES.mansion`. Samma JavaScript kan därför användas på alla fyra sidor.

## Start och navigering

När sidan har laddats körs fyra funktioner i tur och ordning. De tre första gäller alla sidor, den sista bara bokningssidorna.

```javascript
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  markCurrentPage();
  showCurrentYear();
  setupBookingPage();
});
```

Den första raden lägger klassen `js` på `<html>`-elementet. CSS-filen använder den för att bara fälla ihop mobilmenyn när JavaScript faktiskt körs. Utan JavaScript syns menyn alltid, så navigeringen fungerar ändå.

`DOMContentLoaded` är ett event som webbläsaren skickar när hela HTML-sidan är inläst. `addEventListener` kopplar en funktion till eventet. Funktionen skrivs här som en pilfunktion, `() => { … }`, som är ett kortare sätt att skriva en funktion utan namn.

**`setupMobileMenu()`** letar upp knappen "Menu" och menyn. Om någon av dem saknas avbryter funktionen med `return`. Vid klick läser den av `aria-expanded` på knappen, vänder på värdet och lägger till eller tar bort klassen `is-open` på menyn. `aria-expanded` talar även om för skärmläsare om menyn är öppen.

**`markCurrentPage()`** tar fram filnamnet ur adressen med `window.location.pathname.split("/").pop()`. Adressen `/mapp/haunted-mansion.html` delas vid varje snedstreck, och `pop()` ger sista delen. Om den är tom används `"index.html"`. Sedan går `forEach` igenom alla menylänkar och sätter `aria-current="page"` på den länk vars `href` är samma filnamn. CSS ritar då en orange linje under länken. Tack vare detta är sidhuvudet exakt likadant på alla sidor.

**`showCurrentYear()`** skriver in innevarande år i sidfoten med `new Date().getFullYear()`.

## Tillstånd och elementreferenser

Bokningen håller reda på tre saker i variabler som deklareras med `let`, eftersom deras värden ändras medan besökaren använder sidan:

```javascript
let activity = null;          // Aktuellt rum ur ACTIVITIES
let selectedOfferId = null;   // id för valt erbjudande, eller null
let isConfirmed = false;      // true när förfrågan är bekräftad och låst
```

`null` betyder "inget värde än". `isConfirmed` är en boolean, alltså `true` eller `false`. Den används som spärr, så att ingenting kan ändras eller skickas en gång till efter bekräftelsen.

Observera att koden aldrig sparar själva erbjudandet, bara dess `id`. När erbjudandet behövs hämtar `getSelectedOffer()` det ur arrayen. Då finns uppgifterna om erbjudandet på ett enda ställe.

**`setupBookingPage()`** börjar med att läsa `document.body.dataset.activity`, som är värdet av `data-activity` på `<body>`. Startsidan har inget sådant attribut, och då avbryter funktionen direkt med `return`. På en rumssida hämtas rätt rum ur `ACTIVITIES`. Om nyckeln inte finns skrivs ett fel till konsolen.

Sedan hämtar funktionen alla element den behöver med `document.getElementById` och sparar dem i objektet `ui`. Det görs en gång, så att resten av koden inte behöver leta efter elementen om och om igen. Tre delobjekt hjälper valideringen:

| Objekt | Innehåll |
| --- | --- |
| `ui.inputs` | Fälten som valideras: `offer` (listan med kort), `quantity`, `name`, `email` |
| `ui.errors` | Felmeddelandet som hör till varje fält, med samma nycklar |
| `ui.summary` | De fem platserna i bekräftelsen där uppgifterna skrivs in |

Eftersom `ui.inputs` och `ui.errors` har samma nycklar kan en och samma funktion visa eller ta bort felet för vilket fält som helst, till exempel `showError("email", …)`.

Till sist ritar funktionen ut erbjudandena, visar startmeddelandet för priset och kopplar alla event:

- `submit` på formuläret anropar `handleSubmit`.
- `click` på Start over anropar `restartBooking`.
- `input` på antal, namn och e-post kontrollerar fältet igen om det just nu visar ett fel. För antalet uppdateras även priset.

## Erbjudanden: rita ut och välja

**`renderOffers()`** skapar ett kort per erbjudande genom att iterera över arrayen med en `for...of`-loop:

```javascript
for (const offer of activity.offers) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "offer-card";
  card.dataset.offerId = offer.id;
  card.setAttribute("aria-pressed", "false");
  …
  card.append(name, description, price);
  card.addEventListener("click", () => selectOffer(offer.id));
  ui.offerList.append(card);
}
```

Varje varv i loopen ger variabeln `offer` nästa objekt i arrayen. Kortet är en `<button>` och inte en `<div>`. Då går det att välja med tangentbordet (Tab och Enter) utan extra kod. `type = "button"` behövs, annars skulle ett klick på kortet skicka formuläret.

Texten sätts med `textContent` och aldrig med `innerHTML`. `textContent` visar texten exakt som den är och tolkar den inte som HTML, vilket är säkrare. Priset skrivs som `` `${formatPrice(offer.pricePerUnit)} per ${activity.unitSingular}` ``, en mallsträng där värden stoppas in med `${ … }`.

I loopen skapas en ny pilfunktion för varje kort. Den kommer ihåg just sitt eget `offer.id`, så ett klick på andra kortet anropar `selectOffer("mansion-candlelight")`.

**`selectOffer(offerId)`** gör ingenting om förfrågan redan är bekräftad. Annars sparar den id:t i `selectedOfferId` och anropar tre funktioner: `updateOfferMarking()` för markeringen, `updatePriceDisplay()` för priset och `clearError("offer")`, eftersom ett val alltid rättar felet "inget erbjudande valt".

**`updateOfferMarking()`** går igenom alla kort och jämför kortets `data-offer-id` med det valda id:t. Resultatet används på två sätt:

- `classList.toggle("is-selected", isSelected)` lägger till klassen om villkoret är sant och tar bort den annars. CSS ger det valda kortet mörk bakgrund, orange ram och en bock.
- `aria-pressed` sätts till `"true"` eller `"false"`, så att skärmläsare läser upp att knappen är vald.

Till sist skrivs texten "Selected: …" eller "No experience selected yet." ut med ett villkor skrivet som `villkor ? omSant : omFalskt`. Valet syns alltså både som färg, som symbol och som text.

**`getSelectedOffer()`** letar upp det valda erbjudandet med `find`, som returnerar det första objektet där `offer.id === selectedOfferId`. Om inget hittas returneras `null`. Funktionen används av både markeringen, priset, valideringen och bekräftelsen.

## Prisberäkning

Priset bygger på tre funktioner med var sin uppgift: en räknar, en tolkar inmatningen och en uppdaterar sidan.

**`calculateTotalPrice(pricePerUnit, quantity)`** gör bara multiplikationen och returnerar svaret:

```javascript
function calculateTotalPrice(pricePerUnit, quantity) {
  return pricePerUnit * quantity;
}
```

Den används både för prisvisningen och för totalpriset i bekräftelsen. Om prisregeln ändras, till exempel med rabatt från fyra spelare, räcker det att ändra här.

**`parseQuantity(text)`** tar emot det besökaren har skrivit i fältet och returnerar antingen ett heltal mellan 1 och 5 eller `null`:

1. Mellanslag före och efter tas bort med `trim()`. Om ingenting återstår returneras `null`.
2. `[...trimmed].every(...)` delar upp texten i enskilda tecken och kontrollerar att alla är siffror mellan "0" och "9". Därmed stoppas "2.5", "-1", "2a" och "1e2".
3. `Number(trimmed)` gör om texten till ett tal.
4. Talet jämförs med `MIN_QUANTITY` och `MAX_QUANTITY`. Är det utanför returneras `null`, annars talet.

Värdet från ett textfält är alltid en sträng, även om besökaren skriver en siffra. Det är därför omvandlingen behövs. Eftersom bara godkända tal släpps igenom kan en multiplikation aldrig ge `NaN` (Not a Number, "inte ett tal").

`parseQuantity` är den enda regeln för vad som är ett giltigt antal. Både prisvisningen och valideringen använder den, så de kan aldrig göra olika bedömningar.

**`updatePriceDisplay()`** väljer ett av tre meddelanden:

| Läge | Text som visas | Klass på elementet |
| --- | --- | --- |
| Inget erbjudande valt | Choose an experience to see the price. | ingen |
| Erbjudande valt, ogiltigt antal | Enter the number of players as a whole number between 1 and 5 to see the price. | `is-warning` |
| Båda giltiga | Total: 600 SEK (2 players × 300 SEK) | `is-total` |

Funktionen börjar med att ta bort båda klasserna och lägger sedan till den som passar. Varje gren avslutas med `return`, så att bara ett meddelande kan visas. Funktionen anropas när sidan laddas, vid varje val av erbjudande, vid varje tecken i antal-fältet och vid Start over.

Exemplet i uppgiften stämmer: Candlelight Only kostar 300 SEK per spelare, och med 2 spelare blir totalpriset 600 SEK.

## Validering

All validering görs i JavaScript. Formuläret har attributet `novalidate`, som stänger av webbläsarens egen kontroll, och HTML-koden använder varken `required`, `pattern`, `min` eller `max`.

Valideringen är byggd i tre lager:

1. **En funktion per regel** kontrollerar ett värde och returnerar ett felmeddelande, eller en tom sträng om värdet är giltigt.
2. **`validateField(key)`** väljer rätt regel, visar eller tar bort felet och returnerar `true` eller `false`.
3. **`showError` och `clearError`** sköter själva sidan: texten, synligheten och markeringen av fältet.

### Reglerna

| Funktion | Kontroll |
| --- | --- |
| `validateOffer()` | Ett erbjudande är valt, via `getSelectedOffer()` |
| `validateQuantity(value)` | Fältet är inte tomt och `parseQuantity` godkänner värdet |
| `validateName(value)` | `value.trim()` är inte tomt, alltså inte bara mellanslag |
| `validateEmail(value)` | Se stegen nedan |

`validateEmail` kontrollerar i tur och ordning, och returnerar första felet den hittar:

1. Fältet är inte tomt.
2. Inget tecken är ett blanksteg. `char.trim() === ""` är sant för mellanslag, tabbar och radbrytningar.
3. `value.split("@")` ger exakt två delar, vilket betyder exakt ett `@`.
4. Delen före `@` är inte tom.
5. Delen efter `@` är inte tom.
6. Domänen delad vid punkter ger minst två delar, och ingen av dem är tom. Det stoppar `a@b`, `a@.com`, `a@b.` och `a@b..com`.

Tack vare att varje steg har ett eget meddelande får besökaren veta exakt vad som är fel, till exempel "There must be text before the @ in the email address." Inga reguljära uttryck används.

E-postfältet är `type="text"` och inte `type="email"`. Med `email` tar webbläsaren bort blanksteg i början och slutet innan koden ser värdet, och då skulle regeln om blanksteg inte gå att kontrollera.

### Visa och ta bort fel

`validateField` använder en `switch` för att välja regel utifrån nyckeln:

```javascript
switch (key) {
  case "offer":
    message = validateOffer();
    break;
  case "quantity":
    message = validateQuantity(ui.inputs.quantity.value);
    break;
  …
}
```

En tom sträng räknas som falsk i ett villkor. Därför betyder `if (message)` "om det finns ett felmeddelande".

`showError(key, message)` skriver in texten, tar bort `hidden` från felelementet och sätter `aria-invalid="true"` på fältet. CSS ger då fältet en röd ram. `clearError(key)` gör det omvända. Felet visas alltså som text direkt under fältet, inte bara som färg.

### När felet rättas

**`revalidateIfShowingError(key)`** körs vid varje tecken som skrivs i ett fält. Den kontrollerar fältet igen, men bara om ett fel redan visas. Då uppdateras meddelandet medan besökaren skriver, till exempel från "exactly one @" till "needs a dot", och försvinner när adressen är giltig. Ett fält som inte har visat något fel får vara i fred medan man skriver.

Fält som redan är korrekt ifyllda rörs aldrig av valideringen, så de finns kvar när ett annat fält behöver rättas.

## Skicka och bekräfta

**`handleSubmit(event)`** körs när besökaren klickar på "Send booking request" eller trycker Enter i ett fält.

```javascript
function handleSubmit(event) {
  event.preventDefault();
  if (isConfirmed) {
    return;
  }
  const fieldOrder = ["offer", "quantity", "name", "email"];
  const invalidFields = fieldOrder.filter((key) => !validateField(key));

  if (invalidFields.length > 0) {
    focusField(invalidFields[0]);
    return;
  }
  …
}
```

1. `event.preventDefault()` stoppar webbläsarens vanliga beteende, som är att ladda om sidan och skicka formuläret. Förfrågan simuleras i stället helt i webbläsaren.
2. Om förfrågan redan är bekräftad avbryts funktionen, så att det aldrig blir två bekräftelser.
3. `filter` går igenom alla fyra fält och behåller dem där `validateField` svarade `false`. Alla fält kontrolleras, så att alla fel visas på en gång och inte ett i taget.
4. Om något fält är fel flyttas fokus till det första med `focusField`, och funktionen avbryts. Ordningen i `fieldOrder` är densamma som på sidan.

Om allt är giltigt skapas ett objekt med en ögonblicksbild av förfrågan:

```javascript
const booking = {
  name: ui.inputs.name.value.trim(),
  email: ui.inputs.email.value,
  offerName: offer.name,
  quantity: quantity,
  total: calculateTotalPrice(offer.pricePerUnit, quantity)
};
```

Uppgifterna läses alltså en enda gång, i samma ögonblick som de bekräftas. Därför stämmer sammanfattningen alltid med det som bekräftades. Totalpriset räknas med samma `calculateTotalPrice` som prisvisningen.

**`showConfirmation(booking)`** gör fyra saker:

- Sätter `isConfirmed = true`.
- Skriver in uppgifterna i sammanfattningen med `textContent`. Eftersom texten skrivs över i befintliga element, och inga nya element läggs till, kan det aldrig bli dubbla sammanfattningar.
- Låser formuläret med `ui.fields.disabled = true`. När en `<fieldset>` är `disabled` går inget av fälten eller korten inuti att ändra. Knappen för att skicka döljs med `hidden`.
- Visar bekräftelsen och flyttar fokus dit med `focus()`, så att den syns och läses upp av skärmläsare.

Knappen Start over ligger utanför den låsta `<fieldset>`-delen. Det är därför den fortfarande fungerar efter bekräftelsen.

## Start over

**`restartBooking()`** ställer tillbaka sidan till samma läge som när den laddades. Funktionen fungerar likadant under ifyllnaden och efter en bekräftelse.

| Kravet i uppgiften | Koden som gör det |
| --- | --- |
| Tömma namn och e-postadress | `ui.inputs.name.value = ""` och samma för e-post |
| Sätta antalet till 1 | `ui.inputs.quantity.value = String(MIN_QUANTITY)` |
| Ta bort valt erbjudande och markeringen | `selectedOfferId = null` och sedan `updateOfferMarking()` |
| Ta bort felmeddelanden | `Object.keys(ui.errors).forEach(clearError)` |
| Ta bort bekräftelsen | Sammanfattningens texter töms och bekräftelsen döljs med `hidden` |
| Låsa upp formuläret | `isConfirmed = false`, `ui.fields.disabled = false` och skicka-knappen visas igen |
| Återställa prisvisningen | `updatePriceDisplay()`, som visar "Choose an experience to see the price." när inget är valt |

Två detaljer är värda att nämna:

- `Object.keys(ui.errors)` ger en array med nycklarna `["offer", "quantity", "name", "email"]`. `forEach(clearError)` anropar `clearError` en gång för varje nyckel. Funktionen skickas alltså in som ett värde.
- Markeringen och prisvisningen återställs genom att anropa samma funktioner som annars uppdaterar dem. Då finns logiken för hur de ska se ut bara på ett ställe.

Till sist skrollar sidan upp till formuläret med `scrollIntoView`, så att besökaren ser att allt är tomt och kan börja om.

## Följ en användarhandling genom koden

Här följer tre vanliga handlingar steg för steg, från event till synligt resultat. Det är just den här förmågan som betygskriterierna frågar efter.

### 1. Besökaren klickar på kortet Candlelight Only

1. Kortets `click`-event, som kopplades i `renderOffers`, anropar `selectOffer("mansion-candlelight")`.
2. `isConfirmed` är `false`, så funktionen fortsätter och sparar id:t i `selectedOfferId`.
3. `updateOfferMarking()` lägger klassen `is-selected` på kortet och sätter `aria-pressed="true"`. Kortet blir mörkt med en bock, och texten ändras till "Selected: Candlelight Only".
4. `updatePriceDisplay()` hämtar erbjudandet med `getSelectedOffer()` och antalet med `parseQuantity("1")`. Båda är giltiga, så `calculateTotalPrice(300, 1)` ger 300, och sidan visar "Total: 300 SEK (1 player × 300 SEK)".
5. `clearError("offer")` tar bort ett eventuellt felmeddelande om att inget erbjudande är valt.

### 2. Besökaren skickar med en felaktig e-postadress

Namnet är "Peter" och e-posten är "peter@example".

1. `submit`-eventet anropar `handleSubmit`, som stoppar omladdningen med `preventDefault()`.
2. `filter` kör `validateField` för alla fyra fält. Erbjudande, antal och namn är giltiga.
3. För e-post kommer `validateEmail` förbi steg 1 till 5, men domänen "example" saknar punkt. Funktionen returnerar "The part after @ needs a dot with text on both sides, for example example.com."
4. `showError("email", …)` visar texten under fältet och sätter `aria-invalid="true"`, så att fältet får röd ram.
5. `invalidFields` blir `["email"]`. `focusField("email")` flyttar markören dit, och ingen bekräftelse visas. Namnet finns kvar.
6. Besökaren skriver ".com". Vid varje tecken anropar `input`-eventet `revalidateIfShowingError("email")`. När adressen blir "peter@example.com" returnerar `validateEmail` en tom sträng, och `clearError` tar bort meddelandet.

### 3. Besökaren bekräftar och väljer sedan Start over

1. `handleSubmit` hittar inga fel och skapar objektet `booking` med namn, e-post, erbjudandets namn, antal och totalpris.
2. `showConfirmation(booking)` skriver in uppgifterna, låser formuläret, döljer skicka-knappen och visar bekräftelsen.
3. Besökaren klickar på Start over. `click`-eventet anropar `restartBooking()`.
4. Alla fält töms, antalet blir 1, markeringen och felen tas bort, bekräftelsen döljs och formuläret låses upp.
5. `updatePriceDisplay()` ser att inget erbjudande är valt och visar startmeddelandet. Sidan är redo för en ny förfrågan.

## Begreppen kopplade till betygskriterierna

Kriteriet för godkänt nämner nio grundbegrepp. Tabellen visar var vart och ett används.

| Begrepp | Exempel i koden |
| --- | --- |
| Variabler | `const MIN_QUANTITY = 1;` för fasta värden, `let selectedOfferId = null;` för värden som ändras |
| Datatyper | Strängar (`"Classic Haunting"`), tal (`250`), boolean (`isConfirmed`), `null`, objekt och arrayer |
| Objekt | `ACTIVITIES`, varje erbjudande, `ui` och `booking` |
| Arrayer | `offers` i varje rum, `fieldOrder` och resultatet av `split("@")` |
| Villkor | `if` i alla valideringsfunktioner, `switch` i `validateField`, `? :` i `updateOfferMarking` |
| Iteration | `for...of` i `renderOffers`, `forEach` i `markCurrentPage`, `every`, `some`, `filter` och `find` |
| Funktioner | 25 namngivna funktioner med en uppgift var, plus pilfunktioner som skickas till event och arrayfunktioner |
| Event | `DOMContentLoaded`, `click`, `input` och `submit` med `addEventListener` |
| DOM-uppdateringar | `createElement` och `append` för korten, `textContent`, `classList`, `setAttribute`, `hidden` och `disabled` |

DOM står för Document Object Model, alltså webbläsarens bild av sidan som JavaScript kan läsa och ändra.

### Väl godkänt: kodstruktur och återanvändning

- **Funktioner med en uppgift var.** Beräkning (`calculateTotalPrice`), tolkning (`parseQuantity`), regler (`validateName` med flera), sidans uppdateringar (`updatePriceDisplay`, `showError`) och flödet (`handleSubmit`) ligger i olika funktioner.
- **En regel på ett ställe.** Regeln för antal finns bara i `parseQuantity`, gränserna bara i två konstanter och prisregeln bara i `calculateTotalPrice`. Alla delar som behöver reglerna anropar dessa.
- **En kod för fyra sidor.** Rummets data väljs med `data-activity`, så bokningslogiken är skriven en gång.

### Väl godkänt: interaktion

- Felen visas direkt under rätt fält och förklarar vad som är fel.
- Korrekt ifyllda fält finns kvar när ett annat fält behöver rättas.
- Val, fel och bekräftelse visas med text och symboler, inte bara med färg: bocken och "Selected: …" för valet, skriftliga felmeddelanden, rubriken i bekräftelsen och ett låst formulär när förfrågan är avslutad.
