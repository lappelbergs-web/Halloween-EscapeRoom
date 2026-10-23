# Haunted Rooms – förklaring av app.js

`app.js` är den gemensamma JavaScript-filen för hela webbplatsen. Den laddas av alla fem sidor och sköter bara det som är gemensamt: mobilmenyn, markeringen av den sida man står på och årtalet i sidfoten.

Bokningslogiken ligger inte här. Varje rum har en egen JavaScript-fil, till exempel `possessed-doll.js`, som rummets ansvariga har skrivit. Se de andra dokumenten i `docs/`.

## Hur filen laddas

```html
<script src="app.js" defer></script>
```

`defer` betyder att webbläsaren läser in hela HTML-sidan först och kör JavaScript efteråt, så att alla element finns när koden letar efter dem.

## Filens delar

```javascript
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  markCurrentPage();
  showCurrentYear();
});
```

**Klassen `js` på `<html>`.** Den första raden talar om för CSS att JavaScript är igång. `styles.css` fäller bara ihop mobilmenyn när klassen finns. Om JavaScript inte körs syns menyn alltid, så att navigeringen fungerar ändå.

**`DOMContentLoaded`** är ett event som webbläsaren skickar när HTML-sidan är inläst. Då anropas de tre funktionerna.

| Funktion | Vad den gör |
| --- | --- |
| `setupMobileMenu()` | Letar upp knappen "Menu" och menyn. Vid klick vänds värdet på `aria-expanded`, och klassen `is-open` läggs till eller tas bort på menyn. `aria-expanded` talar även om för skärmläsare om menyn är öppen |
| `markCurrentPage()` | Tar fram filnamnet ur adressen med `window.location.pathname.split("/").pop()` och sätter `aria-current="page"` på den menylänk som har samma `href`. CSS ritar en orange linje under länken |
| `showCurrentYear()` | Skriver in innevarande år i sidfoten med `new Date().getFullYear()` |

Tack vare `markCurrentPage()` kan sidhuvudet vara exakt likadant på alla sidor. Ingen sida behöver själv ange vilken länk som är aktiv.

Varje funktion kontrollerar först att elementen den behöver finns, och avbryter annars med `return`. Därför fungerar filen på alla sidor, även om någon sida skulle sakna till exempel sidfoten.
