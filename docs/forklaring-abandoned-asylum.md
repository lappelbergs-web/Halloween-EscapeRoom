# The Abandoned Asylum – förklaring av abandoned-asylum.js och abandoned-asylum.css

Ansvarig: Leo

Sidan `abandoned-asylum.html` laddar de gemensamma `styles.css` och `app.js` för sidhuvud, meny och sidfot, och rummets egna `abandoned-asylum.css` och `abandoned-asylum.js`. Den här texten beskriver i grova drag rummets egna filer.

## abandoned-asylum.js

### Data

```javascript
const offers = [
  { id: 1, name: "Patient Room", description: "…", price: 100 },
  { id: 2, name: "Night Shift", description: "…", price: 150 },
  { id: 3, name: "Asylum Wing", description: "…", price: 200 }
];
const MAX_QUANTITY = 5;
const MIN_QUANTITY = 1;
```

Elementen samlas i objekt efter vad de används till: `bookingFields` för formulärets fält, `fieldErrors` för felmeddelandena och `summaryFields` för bekräftelsen.

### Flödet

| Del | Hur den fungerar |
| --- | --- |
| Start | `initializeBookingPage()` kontrollerar först att alla element som behövs finns på sidan och skriver annars ett fel i konsolen. Sedan ritas erbjudandena ut och alla event kopplas |
| Erbjudandena | `renderOffers()` skapar ett `<label>` med en **radioknapp** per erbjudande. Alla radioknappar har samma `name`, så bara en kan vara vald, och de kan väljas med tangentbordet |
| Välja | En `change`-lyssnare på listan anropar `updateSelectedOfferDisplay()`, som visar valet som text och lägger klassen `is-selected` på det valda kortet |
| Läsa formuläret | `getFormValues()` läser alla fält på en gång med `new FormData(form)` och gör om dem till ett objekt med `Object.fromEntries` |
| Pris | `calculateTotalPrice(selectedOfferId, quantity)` hittar erbjudandet och returnerar pris gånger antal, eller `null` om något är ogiltigt. `updatePriceDisplay()` visar priset eller ett meddelande |
| Validering | `validateForm(formValues)` returnerar ett objekt med ett felmeddelande per fält som är fel. `showValidationErrors(errors)` går igenom objektet och visar eller döljer felen, och sätter `aria-invalid` |
| Fel som rättas | Efter första försöket att skicka (`validationHasRun`) kontrolleras formuläret igen vid varje ändring, så att felen uppdateras medan man skriver |
| Bekräftelse | `showSummary()` skriver in uppgifterna med `textContent`, och antalet visas med enhet, till exempel "2 players". `setBookingFormLocked(true)` låser formuläret |
| Start over | `resetForm()` använder `form.reset()`, som tömmer fälten, avmarkerar radioknapparna och sätter antalet till 1. Sedan tas fel och bekräftelse bort |

### Följ ett klick genom koden

1. Besökaren klickar på "Night Shift". Radioknappen blir vald, och listan skickar ett `change`-event.
2. `updateSelectedOfferDisplay()` läser valet med `FormData`, visar "Selected experience: Night Shift …" och markerar kortet.
3. `updatePriceDisplay()` visar "Total price: 150 kr" för 1 spelare.

## abandoned-asylum.css

**Rummets färger.** Leos egna färgvariabler gäller bara inne i `<main>`, med selektorn `[data-activity="asylum"] main`. Där är bakgrunden mörk och texten ljus, medan gruppens sidhuvud och sidfot behåller gruppens färger.

**Inledningen** visar Leos bild, `images/abandoned-asylum-background.jpg`, med ett mörkt lager som är mörkast till vänster där texten ligger.

**Formuläret.** Varje steg ligger i en egen mörk ruta med rundade hörn. Erbjudandena ligger i ett grid som anpassar antalet kolumner efter bredden, `repeat(auto-fit, minmax(12rem, 1fr))`. Det valda kortet får en orange ram och ljusare bakgrund. Fält med fel får en röd ram via `aria-invalid="true"`.

**Anpassning till styles.css.** Sist i filen återställer ett avsnitt Leos eget utseende där regler från `styles.css` annars skulle ta över, till exempel typsnittet på rubrikerna, prisrutans utseende och gruppens bock på valt kort.
