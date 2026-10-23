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
docs/                        Förklaringar av koden, se avsnittet Dokumentation
```

Varje bokningssida laddar två CSS-filer och två JavaScript-filer: de gemensamma `styles.css` och `app.js`, och rummets egna filer. Rummets CSS-fil laddas efter den gemensamma, så att egna regler går före. Var och en ändrar bara i sina egna filer, så att arbetet i olika grenar inte krockar.

## Dokumentation

Mappen `docs/` innehåller förklaringar av koden.

**Den gemensamma delen**, som gruppen tagit fram tillsammans:

- [Förklaring av app.js](docs/forklaring-app-js.md): mobilmenyn, markeringen av aktuell sida och årtalet i sidfoten.
- [Förklaring av styles.css](docs/forklaring-styles-css.md): färgvariabler, startsidan med spökhuset, rummens färger och bilder, grunden för bokningssidorna, layout och tillgänglighet.

**Varje rum**, med rummets egen JavaScript- och CSS-fil:

| Rum | Ansvarig | Dokument |
|---|---|---|
| The Haunted Mansion | Minna | [forklaring-haunted-mansion.md](docs/forklaring-haunted-mansion.md) |
| The Possessed Doll | Peter | [forklaring-possessed-doll.md](docs/forklaring-possessed-doll.md) |
| The Abandoned Asylum | Leo | [forklaring-abandoned-asylum.md](docs/forklaring-abandoned-asylum.md) |
| The Creepy Clown Room | Jon | [forklaring-creepy-clown.md](docs/forklaring-creepy-clown.md) |

Den som ansvarar för ett rum går igenom och uppdaterar dokumentet för sitt rum när koden ändras.

## Så fungerar en bokning

Varje rum har sin egen design och sin egen kod, men flödet är detsamma:

1. **Välj ett erbjudande.** Varje rum har tre erbjudanden. Det valda erbjudandet markeras tydligt.
2. **Ange antal.** Ett heltal mellan 1 och 5. Antalet avser spelare eller timmar beroende på rum, och totalpriset (pris per enhet × antal) uppdateras direkt.
3. **Fyll i namn och e-postadress.** Felaktiga uppgifter visas med ett felmeddelande vid fältet.
4. **Skicka förfrågan.** En sammanfattning visas utan att sidan laddas om, och formuläret låses.
5. **Börja om.** Tömmer formuläret och gör det möjligt att göra en ny förfrågan, både under ifyllnaden och efter bekräftelsen.

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
| `redovisning-branch` | **Den gren alla arbetar mot.** Här ligger de senaste versionerna av alla sidor, och det är den här versionen som redovisas |
| `main` | Gruppens gemensamma huvudgren från början av projektet |
| `peter-branch` | Tidigare arbetsgren där de fyra bokningssidorna samlades och passades in i den gemensamma designen. Används inte längre |

## Arbetssätt med Git

- Alla arbetar mot `redovisning-branch`.
- Börja varje arbetspass med `git pull --rebase origin redovisning-branch`, så att du har den senaste versionen innan du ändrar något.
- Ändra bara i dina egna filer. Ändringar i gemensamma filer, som `index.html`, `styles.css` och `app.js`, stäms av med gruppen först.
- Kontrollera med `git status` före varje commit att bara de filer du har ändrat finns med.
- Använd aldrig `git push --force` på en gemensam gren.

## Att göra

- [ ] Bestämma gemensamt färgtema
- [x] Fördela vem som ansvarar för vilken sida
- [x] Bestämma om JavaScript ska ligga i en gemensam fil eller en fil per sida
- [x] Uppdatera förklaringen av JavaScript-koden i `docs/` efter uppdelningen i en fil per rum
