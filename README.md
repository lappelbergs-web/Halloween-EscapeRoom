# Haunted Rooms – WorkHub

En bokningswebbplats för det fiktiva företaget **WorkHub**, som driver fyra escape rooms med Halloween-tema. Besökare kan se rummens erbjudanden, räkna ut ett pris och skicka en bokningsförfrågan. Förfrågan simuleras i webbläsaren och skickas inte till någon server.

Projektet är en gruppuppgift i JavaScript och utvecklas löpande. README-filen fylls på efter hand.

## Gruppen

| Namn | Ansvar |
|---|---|
| Minna | The Haunted Mansion |
| Jon | The Creepy Clown Room |
| Leo | The Abandoned Asylum |
| Peter | The Possessed Doll |

## Sidor

| Sida | Fil | Ansvarig |
|---|---|---|
| Startsida | `index.html` | Gemensam, framtagen av hela gruppen |
| The Haunted Mansion | `haunted-mansion.html` | Minna |
| The Possessed Doll | `possessed-doll.html` | Peter |
| The Abandoned Asylum | `abandoned-asylum.html` | Leo |
| The Creepy Clown Room | `creepy-clown.html` | Jon |

Varje bokningssida går att öppna direkt, utan att man först behöver gå via startsidan eller någon annan bokningssida.

## Så kör du projektet

Projektet behöver ingen installation och ingen server.

1. Klona repot eller ladda ner filerna.
2. Öppna `index.html` i en webbläsare.

Typsnitten hämtas från Google Fonts. Utan internetanslutning används reservtypsnitt, men allt fungerar ändå.

## Filer

```
index.html                   Startsida: presenterar WorkHub och länkar till alla rum
haunted-mansion.html         Bokningssida (Minna)
possessed-doll.html          Bokningssida (Peter)
abandoned-asylum.html        Bokningssida (Leo)
creepy-clown.html            Bokningssida (Jon)
styles.css                   Gemensam design för alla sidor
haunted-mansion.css          Minnas design för The Haunted Mansion
possessed-doll.css           Egen design för The Possessed Doll (runda erbjudanden)
abandoned-asylum.css         Leos design för The Abandoned Asylum
creepy-clown.css             Jons design för The Creepy Clown Room
app.js                       Gemensam JavaScript: mobilmeny, aktuell sida i menyn, årtal
haunted-mansion.js           Minnas bokningslogik och erbjudanden för The Haunted Mansion
possessed-doll.js            Bokningslogik och erbjudanden för The Possessed Doll
abandoned-asylum.js          Leos bokningslogik och erbjudanden för The Abandoned Asylum
creepy-clown.js              Jons bokningslogik och erbjudanden för The Creepy Clown Room
images/                      En bild per rum samt bakgrundsbilderna till The Haunted Mansion och The Abandoned Asylum
docs/
  forklaring-app-js.md       Förklaring av JavaScript-koden
  forklaring-styles-css.md   Förklaring av koden i styles.css
```

Varje bokningssida laddar två CSS-filer och två JavaScript-filer: de gemensamma `styles.css` och `app.js`, och rummets egna filer. Rummets CSS-fil laddas efter den gemensamma, så att egna regler går före. Var och en ändrar bara i sina egna filer, så att arbetet i olika grenar inte krockar.

## Dokumentation

Mappen `docs/` innehåller utförligare förklaringar av koden:

- [Förklaring av app.js](docs/forklaring-app-js.md): data, navigering, erbjudanden, prisberäkning, validering, bekräftelse och Start over, med exempel på hur en användarhandling leder till ett resultat på sidan.
- [Förklaring av styles.css](docs/forklaring-styles-css.md): färgvariabler, layout, responsivitet, komponenterna på sidorna och tillgänglighet.

## Så fungerar en bokning

1. **Välj ett erbjudande.** Varje rum har tre spelvarianter. Det valda kortet markeras med mörk bakgrund, en bock och texten "Selected: …".
2. **Ange antal spelare.** Ett heltal mellan 1 och 5. Totalpriset (pris per spelare × antal) uppdateras direkt.
3. **Fyll i namn och e-postadress.** Felaktiga uppgifter visas med ett felmeddelande direkt under fältet.
4. **Skicka förfrågan.** En sammanfattning visas utan att sidan laddas om, och formuläret låses.
5. **Start over.** Tömmer formuläret och gör det möjligt att göra en ny förfrågan. Knappen fungerar både under ifyllnaden och efter bekräftelsen.

## Teknik

- HTML, CSS och JavaScript utan ramverk eller bibliotek.
- Varje rums erbjudanden ligger som en array av objekt i rummets egen JavaScript-fil och ritas ut på sidan med en loop.
- Webbläsarens inbyggda formulärvalidering är avstängd med `novalidate`. All validering görs i JavaScript.
- Varje bokningssida anger sitt rum med `<body data-activity="...">`, som ger rummets accentfärg och bild i `styles.css`.

## Design

Färgerna ligger som variabler överst i `styles.css`. Gruppens gemensamma färgtema är inte bestämt än, så variablerna kan komma att ändras.

| Variabel | Färg |
|---|---|
| `--background` | `#f2e8d5` |
| `--foreground` | `#1b1b1f` |
| `--accent-orange` | `#ff6a00` |
| `--accent-purple` | `#5a2a82` |
| `--accent-green` | `#2f6b3a` |

## Grenar

| Gren | Innehåll |
|---|---|
| `main` | Gruppens gemensamma huvudgren, med den första versionen av startsidan, navigeringen och färgvariablerna |
| `peter-branch` | Arbetsgren där de fyra bokningssidorna har samlats och passats in i den gemensamma designen |
| `redovisning-branch` | Slutversionen som redovisas |

## Arbetssätt med Git

- Varje gruppmedlem arbetar i en egen gren, till exempel `peter-branch`.
- Ingen pushar direkt till `main`. Ändringar kommer in via en pull request som gruppen granskar.
- Börja varje arbetspass med `git pull --rebase` på den gren du arbetar i, så att du har den senaste versionen.
- Använd aldrig `git push --force` på en gemensam gren.

## Att göra

- [ ] Bestämma gemensamt färgtema
- [x] Fördela vem som ansvarar för vilken sida
- [x] Bestämma om JavaScript ska ligga i en gemensam fil eller en fil per sida
- [ ] Uppdatera förklaringen av JavaScript-koden i `docs/` efter uppdelningen i en fil per rum
