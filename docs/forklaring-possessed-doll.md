# The Possessed Doll – förklaring av possessed-doll.js och possessed-doll.css

Ansvarig: Peter

Sidan `possessed-doll.html` laddar fyra filer: de gemensamma `styles.css` och `app.js`, och rummets egna `possessed-doll.css` och `possessed-doll.js`. Den här texten beskriver rummets egna filer.

## Översikt

| Del | Var den finns |
| --- | --- |
| Tre erbjudanden med pris per spelare och "Fear level" | `OFFERS` i `possessed-doll.js` |
| Medaljongernas utseende | `<template id="offer-template">` i HTML och `possessed-doll.css` |
| Pris, validering, bekräftelse och Start over | `possessed-doll.js` |
| Layout med två kolumner och lägre inledning | `possessed-doll.css` |

## possessed-doll.js

### Upplägget

Filen bygger på fyra idéer:

1. **Tillståndet styr sidan.** Allt som ändras ligger i objektet `state`. Händelserna ändrar bara `state` och anropar sedan `render()`, som uppdaterar sidan. Sidan kan därför aldrig visa något annat än det som står i `state`.
2. **Valideringen är data.** Varje fält har en lista med kontroller i objektet `CHECKS`, och samma funktion, `findProblem()`, går igenom listan för alla fält.
3. **Medaljongerna byggs från en mall** i HTML-koden, som kopieras en gång per erbjudande.
4. **En enda klicklyssnare** på listan tar hand om alla medaljonger.

### Data

```javascript
const PLAYERS = { min: 1, max: 5, singular: "player", plural: "players" };

const OFFERS = [
  { id: "doll-playroom", name: "The Playroom", description: "…", pricePerUnit: 190, fearLevel: 1 },
  { id: "doll-hide-and-seek", name: "Hide and Seek", description: "…", pricePerUnit: 340, fearLevel: 2 },
  { id: "doll-night", name: "Night of the Doll", description: "…", pricePerUnit: 490, fearLevel: 3 }
];
```

Allt som gäller antalet spelare ligger i `PLAYERS`. Om gränsen ändras till exempel till 1–8 räcker det att ändra `max`, eftersom priset, valideringen och felmeddelandena hämtar värdet därifrån.

### Tillståndet och render()

```javascript
const state = {
  selectedId: null,   // id för valt erbjudande
  confirmed: false,   // true när förfrågan är bekräftad
  booking: null       // den bekräftade förfrågan
};
```

`render()` är den enda funktionen som visar tillståndet på sidan. Den markerar valt erbjudande, visar priset, låser eller låser upp formuläret, visar eller döljer bekräftelsen och fyller i sammanfattningen från `state.booking`. Eftersom sammanfattningen skrivs över med `textContent` kan det aldrig bli dubbla bekräftelser.

### Medaljongerna

`renderOffers()` går igenom `OFFERS` med en `for...of`-loop. För varje erbjudande kopieras mallen:

```javascript
const button = el.template.content.firstElementChild.cloneNode(true);
```

`content` är mallens innehåll, som inte visas på sidan förrän det kopieras. `cloneNode(true)` kopierar knappen med allt inuti. Sedan fyller `fillText()` i texterna med `textContent`.

"Fear level" visas med prickar, till exempel `●●○`, som skapas med `"●".repeat(level)`. Prickarna är dolda för skärmläsare, som i stället läser texten "Fear level 2 of 3".

### Välja ett erbjudande

```javascript
el.offers.addEventListener("click", onOfferClick);
```

Lyssnaren sitter på listan, inte på varje medaljong. Det kallas event delegation. `event.target.closest(".doll-offer")` tar reda på vilken medaljong som klickades, även om man klickar på texten inuti. Funktionen sparar id:t i `state.selectedId`, tar bort ett eventuellt felmeddelande och anropar `render()`.

`paintSelection()` visar valet på tre sätt: klassen `is-selected`, attributet `aria-pressed` och texten "Selected: …".

### Pris

| Funktion | Uppgift |
| --- | --- |
| `calculateTotalPrice(pricePerUnit, quantity)` | Multiplicerar pris per spelare med antal |
| `toPlayerCount(text)` | Tolkar antal-fältet. `/^\d+$/` släpper bara igenom siffror, och talet måste vara mellan 1 och 5. Annars returneras `null` |
| `describePrice()` | Bestämmer vilket av tre meddelanden som ska visas: startmeddelande, varning eller totalpris |
| `showPrice()` | Skriver ut meddelandet och sätter klassen `is-warning` eller `is-total` |

Eftersom bara giltiga antal släpps igenom av `toPlayerCount` kan priset aldrig bli `NaN`. Samma funktion används även av valideringen, så de kan aldrig göra olika bedömningar.

### Validering

```javascript
const CHECKS = {
  offer:    [ { test: …, message: "Choose one of the experiences …" } ],
  quantity: [ { test: …, message: "Enter the number of players." }, { test: …, message: "… whole number between 1 and 5." } ],
  name:     [ { test: …, message: "Enter your name …" } ],
  email:    EMAIL_CHECKS
};
```

Varje kontroll har ett `test`, som returnerar `true` när värdet är rätt, och ett `message`. `findProblem(field)` använder `find` för att hitta den första kontroll som inte går igenom och returnerar dess meddelande, eller en tom sträng om allt är rätt. Ordningen spelar roll: en senare kontroll körs bara om de tidigare har gått igenom.

`EMAIL_CHECKS` kontrollerar i tur och ordning att adressen inte är tom, saknar blanksteg, har exakt ett `@`, har text före och efter `@`, och att domänen har en punkt med text på båda sidor. Varje steg har ett eget meddelande, så att besökaren får veta exakt vad som är fel.

`setError(field, message)` visar meddelandet under fältet och sätter `aria-invalid="true"`, eller tar bort båda om meddelandet är tomt. När ett fält visar ett fel kontrolleras det igen vid varje tecken, så att meddelandet uppdateras eller försvinner när felet rättas.

Formuläret har attributet `novalidate`, så webbläsarens egen validering används inte.

### Skicka och bekräfta

`onSubmit(event)` stoppar omladdningen med `event.preventDefault()`. `FIELD_ORDER.map(checkField)` kontrollerar alla fyra fält, så att alla fel visas på en gång, och fokus flyttas till det första felaktiga fältet. Om allt är rätt sparas en ögonblicksbild av förfrågan i `state.booking`, `state.confirmed` sätts till `true` och `render()` låser formuläret och visar bekräftelsen.

### Start over

`restart()` nollställer `state`, anropar `el.form.reset()`, som sätter fälten till sina värden i HTML-koden (namn och e-post tomma, antal 1), tar bort alla fel och anropar `render()`.

### Följ ett klick genom koden

1. Besökaren klickar på Hide and Seek. Lyssnaren på listan anropar `onOfferClick`.
2. `closest` hittar medaljongen, och `state.selectedId` blir `"doll-hide-and-seek"`.
3. `render()` anropar `paintSelection()`, som markerar medaljongen och skriver "Selected: Hide and Seek".
4. `render()` anropar `showPrice()`. `describePrice()` hittar erbjudandet och antalet 1, och `calculateTotalPrice(340, 1)` ger 340. Sidan visar "Total: 340 SEK (1 player × 340 SEK)".

Tillståndet kan följas i webbläsarens konsol med `state`, och reglerna kan testas med till exempel `findProblem("email")`.

## possessed-doll.css

Filen laddas efter `styles.css` och använder dess variabler.

**Lägre inledning.** `.page-intro` är lägre än på de andra rummen, med `min-height: clamp(16rem, 26vw, 21rem)` och en mindre rubrik, så att medaljongerna och priset syns utan att man behöver skrolla.

**Runda medaljonger.** `.doll-offer` blir rund med `aspect-ratio: 1` och `border-radius: 50%`. Porslinsytan är en `radial-gradient`, och de dubbla ringarna i kanten är två `inset`-skuggor. Den valda medaljongen, `.doll-offer.is-selected`, blir mörk med orange ring och glöd, och `::after` ritar en bock i nederkant. Efter bekräftelse blir de medaljonger som inte valdes halvt genomskinliga.

**Två kolumner.** På skärmar som är minst 960 pixlar breda blir formulärets fieldset ett grid med två kolumner. Medaljongerna och "Your details" ligger till vänster. "Count your players" ligger i en ruta till höger som sträcker sig över båda raderna, `grid-row: 1 / span 2`, och har `position: sticky`, så att priset syns medan man fyller i sina uppgifter.

**Minska rörelse.** Lyftet när man håller muspekaren över en medaljong stängs av för den som har valt det.
