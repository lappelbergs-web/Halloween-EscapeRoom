# The Haunted Mansion – förklaring av haunted-mansion.js och haunted-mansion.css

Ansvarig: Minna

Sidan `haunted-mansion.html` laddar de gemensamma `styles.css` och `app.js` för sidhuvud, meny och sidfot, och rummets egna `haunted-mansion.css` och `haunted-mansion.js`. Den här texten beskriver i grova drag rummets egna filer.

## haunted-mansion.js

### Data

```javascript
const offers = [
  { id: 1, name: "The Haunted Beginning", description: "…", price: 300 },
  { id: 2, name: "The Dark Secrets", description: "…", price: 350 },
  { id: 3, name: "The Ultimate Nightmare", description: "…", price: 400 }
];
```

Tre erbjudanden i en array av objekt, med id, namn, beskrivning och pris per person.

### Flödet

| Del | Hur den fungerar |
| --- | --- |
| Erbjudandena | `offers.forEach` skapar ett `div`-kort per erbjudande och lägger in namn, beskrivning och pris med `innerHTML` |
| Välja | Varje kort har en egen klicklyssnare. Vid klick sparas erbjudandet i `selectedOffer`, alla kort får sin markering borttagen och det klickade kortet får en orange ram |
| Pris | `updateTotalPrice()` kontrollerar att ett erbjudande är valt och att antalet är ett heltal mellan 1 och 5, och visar sedan pris per person gånger antal. Annars visas ett meddelande. Funktionen körs när ett kort väljs och när antalet ändras |
| Validering | Vid `submit` stoppas omladdningen med `event.preventDefault()`. Namnet kontrolleras med `trim()`, och e-posten med `indexOf` och `lastIndexOf` för att hitta `@` och punkten i domänen. Fel för erbjudande och antal visas i en gemensam ruta, `booking-error` |
| Bekräftelse | Om allt är giltigt skrivs en sammanfattning in i `booking-confirmation`. Fälten låses med `disabled`, korten med `pointerEvents = "none"` och knappen för att bekräfta inaktiveras |
| Börja om | Knappen är av typen `reset`. Formulärets `reset`-event nollställer valt erbjudande, låser upp fälten, sätter antalet till 1, tar bort fel, bekräftelse och markeringar och återställer prismeddelandet |

### Följ ett klick genom koden

1. Besökaren klickar på "The Dark Secrets". Kortets klicklyssnare sparar erbjudandet i `selectedOffer`.
2. Alla kort får `outline: none`, och det klickade kortet får en orange ram.
3. `updateTotalPrice()` läser antalet, och med 1 spelare visas "Total Price: 350 SEK".

## haunted-mansion.css

**Bakgrund.** Hela `.haunted-mansion` har Minnas bakgrundsbild, `images/haunted-background.jpg`, med ett mörkt lager ovanpå så att texten syns.

**Rubrik.** Rubriken har en lila glöd, `text-shadow`, och animationen `hauntedGlow` som gör att glöden pulserar.

**Erbjudandena** ligger i ett grid med tre kolumner. Korten har en mörklila gradient, rundade hörn och skugga, och lyfts uppåt med `transform: translateY(-8px)` när man håller muspekaren över dem.

**Formuläret** är en egen mörk ruta med lila kant. Fälten får en lila glöd när de har fokus, och hela formuläret lyser starkare med `:focus-within` när något fält i det har fokus.

**Dimma.** `.haunted-mansion::before` är ett extra lager med två `radial-gradient` som suddas ut med `filter: blur()`. Animationen `movingFog` flyttar dimman fram och tillbaka.

**Mobil.** Under 768 pixlar ligger erbjudandena i en kolumn och utfyllnaden minskar.

**Anpassning till styles.css.** Sist i filen tas gränsen på 65 tecken per stycke från `styles.css` bort, så att Minnas centrerade stycken kan vara fullt breda.
