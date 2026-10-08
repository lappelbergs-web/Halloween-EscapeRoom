# Haunted Rooms – WorkHub

En bokningswebbplats för det fiktiva företaget **WorkHub**, som driver fyra escape rooms med Halloween-tema. Besökare kan se rummens erbjudanden, räkna ut ett pris och skicka en bokningsförfrågan. Förfrågan simuleras i webbläsaren och skickas inte till någon server.

Projektet är en gruppuppgift i JavaScript och utvecklas löpande. README-filen fylls på efter hand.

## Gruppen

| Namn | Ansvar |
|---|---|
| Minna | _Fylls i_ |
| Jon | _Fylls i_ |
| Leo | _Fylls i_ |
| Peter | _Fylls i_ |

## Sidor

| Sida | Fil | Ansvarig |
|---|---|---|
| Startsida | `index.html` | _Fylls i_ |
| The Haunted Mansion | `haunted-mansion.html` | _Fylls i_ |
| The Possessed Doll | `possessed-doll.html` | _Fylls i_ |
| The Abandoned Asylum | `abandoned-asylum.html` | _Fylls i_ |
| The Creepy Clown Room | `creepy-clown.html` | _Fylls i_ |

Varje bokningssida går att öppna direkt, utan att man först behöver gå via startsidan eller någon annan bokningssida.

## Så kör du projektet

Projektet behöver ingen installation och ingen server.

1. Klona repot eller ladda ner filerna.
2. Öppna `index.html` i en webbläsare.

Typsnitten hämtas från Google Fonts. Utan internetanslutning används reservtypsnitt, men allt fungerar ändå.

## Filer

```
index.html               Startsida: presenterar WorkHub och länkar till alla rum
haunted-mansion.html     Bokningssida
possessed-doll.html      Bokningssida
abandoned-asylum.html    Bokningssida
creepy-clown.html        Bokningssida
styles.css               Gemensam design för alla sidor
app.js                   Navigering och bokningslogik
```

## Så fungerar en bokning

1. **Välj ett erbjudande.** Varje rum har tre spelvarianter. Det valda kortet markeras med mörk bakgrund, en bock och texten "Selected: …".
2. **Ange antal spelare.** Ett heltal mellan 1 och 5. Totalpriset (pris per spelare × antal) uppdateras direkt.
3. **Fyll i namn och e-postadress.** Felaktiga uppgifter visas med ett felmeddelande direkt under fältet.
4. **Skicka förfrågan.** En sammanfattning visas utan att sidan laddas om, och formuläret låses.
5. **Start over.** Tömmer formuläret och gör det möjligt att göra en ny förfrågan. Knappen fungerar både under ifyllnaden och efter bekräftelsen.

## Teknik

- HTML, CSS och JavaScript utan ramverk eller bibliotek.
- Erbjudandena ligger som arrayer av objekt i `app.js` och ritas ut på sidan med en loop.
- Webbläsarens inbyggda formulärvalidering är avstängd med `novalidate`. All validering görs i JavaScript.
- Varje bokningssida anger sitt rum med `<body data-activity="...">`, så att samma JavaScript-kod kan användas på alla sidor.

## Design

Färgerna ligger som variabler överst i `styles.css`. Gruppens gemensamma färgtema är inte bestämt än, så variablerna kan komma att ändras.

| Variabel | Färg |
|---|---|
| `--background` | `#f2e8d5` |
| `--foreground` | `#1b1b1f` |
| `--accent-orange` | `#ff6a00` |
| `--accent-purple` | `#5a2a82` |
| `--accent-green` | `#2f6b3a` |

## Arbetssätt med Git

- Varje gruppmedlem arbetar i en egen gren, till exempel `peter-branch`.
- Ingen pushar direkt till `main`. Ändringar kommer in via en pull request som gruppen granskar.
- Använd aldrig `git push --force` på en gemensam gren.

## Att göra

- [ ] Bestämma gemensamt färgtema
- [ ] Fördela vem som ansvarar för vilken sida
- [ ] Bestämma om JavaScript ska ligga i en gemensam fil eller en fil per sida
