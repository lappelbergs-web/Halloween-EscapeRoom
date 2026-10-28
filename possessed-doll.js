"use strict";

/*
 * The Possessed Doll – JavaScript för bokningssidan possessed-doll.html
 * Ansvarig: Peter
 *
 * Upplägget i den här filen:
 * - Tillståndet styr sidan. Allt som ändras ligger i objektet state.
 *   Händelserna ändrar bara state och anropar sedan render(), som
 *   uppdaterar sidan utifrån state. Sidan kan då aldrig visa något
 *   annat än det som står i state.
 * - Valideringen är data. Varje fält har en lista med kontroller,
 *   och samma funktion, findProblem(), går igenom listan för alla fält.
 * - Medaljongerna byggs från en <template> i HTML-koden, som kopieras
 *   en gång per erbjudande.
 * - En enda klicklyssnare på listan tar hand om alla medaljonger
 *   (event delegation).
 *
 * Navigeringen ligger i den gemensamma filen app.js.
 */

/* ==========================================================
   Data
   ========================================================== */

// Allt som gäller antalet spelare samlat på ett ställe
const PLAYERS = {
  min: 1,
  max: 5,
  singular: "player",
  plural: "players"
};

const MAX_FEAR_LEVEL = 3;

const OFFERS = [
  {
    id: "doll-playroom",
    name: "The Playroom",
    description: "60 minutes in the nursery where it all began. Hints included.",
    pricePerUnit: 190,
    fearLevel: 1
  },
  {
    id: "doll-hide-and-seek",
    name: "Hide and Seek",
    description: "She hunts by sound. Stay quiet or the clock speeds up.",
    pricePerUnit: 340,
    fearLevel: 2
  },
  {
    id: "doll-night",
    name: "Night of the Doll",
    description: "No hints, no light. She moves when you look away.",
    pricePerUnit: 490,
    fearLevel: 3
  }
];

/* ==========================================================
   Tillstånd och element
   ========================================================== */

// Allt som ändras medan besökaren använder sidan
const state = {
  selectedId: null,   // id för valt erbjudande, eller null
  confirmed: false,   // true när förfrågan är bekräftad och låst
  booking: null       // den bekräftade förfrågan, eller null
};

// Referenser till element på sidan, fylls i init()
const el = {};

// Ordningen fälten kontrolleras i – samma ordning som på sidan
const FIELD_ORDER = ["offer", "quantity", "name", "email"];

/* ==========================================================
   Start
   ========================================================== */

document.addEventListener("DOMContentLoaded", init);

function init() {
  el.form = document.getElementById("booking-form");
  if (!el.form) {
    return;
  }

  el.fields = document.getElementById("booking-fields");
  el.offers = document.getElementById("offer-list");
  el.template = document.getElementById("offer-template");
  el.selectedText = document.getElementById("selected-offer");
  el.price = document.getElementById("price-output");
  el.submit = document.getElementById("submit-button");
  el.restart = document.getElementById("restart-button");
  el.confirmation = document.getElementById("confirmation");

  el.inputs = {
    offer: el.offers,
    quantity: document.getElementById("quantity"),
    name: document.getElementById("customer-name"),
    email: document.getElementById("customer-email")
  };

  // Felelementen och sammanfattningen hämtas med loopar, eftersom
  // deras id:n följer ett mönster: "offer-error", "summary-name" och så vidare.
  el.errors = {};
  for (const field of FIELD_ORDER) {
    el.errors[field] = document.getElementById(`${field}-error`);
  }

  el.summary = {};
  for (const key of ["name", "email", "offer", "quantity", "total"]) {
    el.summary[key] = document.getElementById(`summary-${key}`);
  }

  renderOffers();
  render();

  // En enda lyssnare för alla erbjudanden
  el.offers.addEventListener("click", onOfferClick);
  el.form.addEventListener("submit", onSubmit);
  el.restart.addEventListener("click", restart);

  for (const field of ["quantity", "name", "email"]) {
    el.inputs[field].addEventListener("input", () => onFieldInput(field));
  }
}

/* ==========================================================
   Uppdatera sidan utifrån state
   ========================================================== */

// Den enda funktionen som visar tillståndet på sidan.
// Den anropas efter varje ändring av state.
function render() {
  paintSelection();
  showPrice();

  // Låst efter bekräftelse, öppet annars
  el.fields.disabled = state.confirmed;
  el.submit.hidden = state.confirmed;
  el.confirmation.hidden = !state.confirmed;

  // Sammanfattningen visar state.booking, eller töms om det inte finns någon.
  // textContent skriver över, så det kan aldrig bli dubbla bekräftelser.
  for (const [key, element] of Object.entries(el.summary)) {
    element.textContent = state.booking ? state.booking[key] : "";
  }
}

/* ==========================================================
   Erbjudanden
   ========================================================== */

// Gör en kopia av mallen för varje erbjudande och lägger in den på sidan.
function renderOffers() {
  el.offers.replaceChildren();
  for (const offer of OFFERS) {
    el.offers.append(createOfferElement(offer));
  }
}

function createOfferElement(offer) {
  // content är mallens innehåll. cloneNode(true) kopierar knappen med allt inuti.
  const button = el.template.content.firstElementChild.cloneNode(true);
  button.dataset.offerId = offer.id;

  // Texterna sätts med textContent, så de visas exakt som de står i OFFERS.
  fillText(button, ".fear-dots", fearDots(offer.fearLevel));
  fillText(button, ".fear-text", `Fear level ${offer.fearLevel} of ${MAX_FEAR_LEVEL}`);
  fillText(button, ".doll-offer-name", offer.name);
  fillText(button, ".doll-offer-description", offer.description);
  fillText(button, ".price-amount", formatSek(offer.pricePerUnit));
  fillText(button, ".doll-offer-price small", `per ${PLAYERS.singular}`);

  return button;
}

function fillText(parent, selector, text) {
  parent.querySelector(selector).textContent = text;
}

// Fear level 2 av 3 blir "●●○"
function fearDots(level) {
  return "●".repeat(level) + "○".repeat(MAX_FEAR_LEVEL - level);
}

// Ett klick någonstans i listan: ta reda på vilken medaljong som klickades.
function onOfferClick(event) {
  const button = event.target.closest(".doll-offer");
  if (!button || state.confirmed) {
    return;
  }

  state.selectedId = button.dataset.offerId;
  setError("offer", "");
  render();
}

// Visar valet med klass, aria-pressed och text.
function paintSelection() {
  for (const button of el.offers.querySelectorAll(".doll-offer")) {
    const isSelected = button.dataset.offerId === state.selectedId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }

  const offer = findOffer(state.selectedId);
  el.selectedText.textContent = offer
    ? `Selected: ${offer.name}`
    : "No experience selected yet.";
}

function findOffer(offerId) {
  return OFFERS.find((offer) => offer.id === offerId) || null;
}

/* ==========================================================
   Pris
   ========================================================== */

function calculateTotalPrice(pricePerUnit, quantity) {
  return pricePerUnit * quantity;
}

// Tolkar antal-fältet. Returnerar ett heltal inom gränserna, eller null.
function toPlayerCount(text) {
  const trimmed = text.trim();

  // /^\d+$/ betyder: från början till slut bara siffror, minst en
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const count = Number(trimmed);
  const withinLimits = count >= PLAYERS.min && count <= PLAYERS.max;
  return withinLimits ? count : null;
}

// Bestämmer vad prisrutan ska visa, utan att röra sidan.
function describePrice() {
  const offer = findOffer(state.selectedId);
  const count = toPlayerCount(el.inputs.quantity.value);

  if (!offer) {
    return { kind: "start", text: "Choose an experience to see the price." };
  }
  if (count === null) {
    return {
      kind: "warning",
      text: `Enter the number of ${PLAYERS.plural} as a whole number between ${PLAYERS.min} and ${PLAYERS.max} to see the price.`
    };
  }

  const total = calculateTotalPrice(offer.pricePerUnit, count);
  return {
    kind: "total",
    text: `Total: ${formatSek(total)} (${formatPlayers(count)} × ${formatSek(offer.pricePerUnit)})`
  };
}

// Skriver ut det describePrice() har bestämt.
function showPrice() {
  const { kind, text } = describePrice();
  el.price.textContent = text;
  el.price.classList.toggle("is-warning", kind === "warning");
  el.price.classList.toggle("is-total", kind === "total");
}

/* ==========================================================
   Validering
   ========================================================== */

// Kontrollerna för e-post, i den ordning de ska göras.
// En senare kontroll körs bara om de tidigare har gått igenom, så till
// exempel den sista kan lita på att det finns exakt ett @ och text efter det.
const EMAIL_CHECKS = [
  {
    test: (value) => value !== "",
    message: "Enter your email address."
  },
  {
    test: (value) => !/\s/.test(value),
    message: "The email address can't contain spaces."
  },
  {
    test: (value) => value.split("@").length === 2,
    message: "The email address must contain exactly one @, for example name@example.com."
  },
  {
    test: (value) => value.split("@")[0] !== "",
    message: "There must be text before the @ in the email address."
  },
  {
    test: (value) => value.split("@")[1] !== "",
    message: "There must be text after the @ in the email address."
  },
  {
    test: (value) => {
      const domainParts = value.split("@")[1].split(".");
      return domainParts.length >= 2 && domainParts.every((part) => part !== "");
    },
    message: "The part after @ needs a dot with text on both sides, for example example.com."
  }
];

// Kontrollerna för alla fält. Varje kontroll har ett test som ska
// returnera true när värdet är rätt, och ett meddelande om det inte är det.
const CHECKS = {
  offer: [
    {
      test: (offerId) => findOffer(offerId) !== null,
      message: "Choose one of the experiences above before you send your request."
    }
  ],
  quantity: [
    {
      test: (value) => value.trim() !== "",
      message: `Enter the number of ${PLAYERS.plural}.`
    },
    {
      test: (value) => toPlayerCount(value) !== null,
      message: `The number of ${PLAYERS.plural} must be a whole number between ${PLAYERS.min} and ${PLAYERS.max}.`
    }
  ],
  name: [
    {
      test: (value) => value.trim() !== "",
      message: "Enter your name. The field can't be empty or contain only spaces."
    }
  ],
  email: EMAIL_CHECKS
};

// Hämtar värdet som kontrollerna för ett fält ska testa.
function readValue(field) {
  return field === "offer" ? state.selectedId : el.inputs[field].value;
}

// Går igenom fältets kontroller och returnerar meddelandet från den
// första som inte går igenom, eller "" om alla går igenom.
// find stannar vid den första kontroll där test returnerar false.
function findProblem(field) {
  const value = readValue(field);
  const failedCheck = CHECKS[field].find((check) => !check.test(value));
  return failedCheck ? failedCheck.message : "";
}

// Kontrollerar ett fält, visar resultatet och returnerar true om fältet är giltigt.
function checkField(field) {
  const message = findProblem(field);
  setError(field, message);
  return message === "";
}

// Ett tomt meddelande tar bort felet, annars visas det.
function setError(field, message) {
  const error = el.errors[field];
  const hasError = message !== "";

  error.textContent = message;
  error.hidden = !hasError;

  if (hasError) {
    el.inputs[field].setAttribute("aria-invalid", "true");
  } else {
    el.inputs[field].removeAttribute("aria-invalid");
  }
}

// Vid inmatning: uppdatera sidan, och kontrollera fältet igen om det visar ett fel.
function onFieldInput(field) {
  if (!el.errors[field].hidden) {
    checkField(field);
  }
  render();
}

/* ==========================================================
   Skicka och bekräfta
   ========================================================== */

function onSubmit(event) {
  event.preventDefault(); // Ingen omladdning och inget skickas till en server

  if (state.confirmed) {
    return;
  }

  // map kontrollerar alla fält, så att alla fel visas på en gång
  const results = FIELD_ORDER.map(checkField);
  const firstInvalid = FIELD_ORDER[results.indexOf(false)];

  if (firstInvalid) {
    focusField(firstInvalid);
    return;
  }

  state.booking = buildBooking();
  state.confirmed = true;
  render();
  el.confirmation.focus();
}

function focusField(field) {
  const target = field === "offer"
    ? el.offers.querySelector(".doll-offer")
    : el.inputs[field];
  target.focus();
}

// Ögonblicksbild av det som bekräftas, färdig att visa.
// Nycklarna är desamma som i el.summary.
function buildBooking() {
  const offer = findOffer(state.selectedId);
  const count = toPlayerCount(el.inputs.quantity.value);

  return {
    name: el.inputs.name.value.trim(),
    email: el.inputs.email.value,
    offer: offer.name,
    quantity: formatPlayers(count),
    total: formatSek(calculateTotalPrice(offer.pricePerUnit, count))
  };
}

/* ==========================================================
   Start over
   ========================================================== */

function restart() {
  state.selectedId = null;
  state.confirmed = false;
  state.booking = null;

  // reset() sätter varje fält till sitt värde i HTML-koden:
  // namn och e-post blir tomma och antal blir 1 (value="1").
  el.form.reset();

  for (const field of FIELD_ORDER) {
    setError(field, "");
  }

  render();
  el.form.scrollIntoView({ block: "start" });
}

/* ==========================================================
   Hjälpfunktioner för text
   ========================================================== */

function formatSek(amount) {
  return `${amount.toLocaleString("en-US")} SEK`;
}

function formatPlayers(count) {
  return `${count} ${count === 1 ? PLAYERS.singular : PLAYERS.plural}`;
}
