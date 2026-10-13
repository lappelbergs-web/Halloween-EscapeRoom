"use strict";

/*
 * The Possessed Doll – JavaScript för bokningssidan possessed-doll.html
 * Ansvarig: Peter
 *
 * Samma funktioner som de andra rummen, men med ett eget upplägg:
 * - Allt som ändras under bokningen ligger samlat i objektet state.
 * - Valideringsreglerna ligger i objektet rules, med en regel per fält.
 * - Erbjudandena har en gemensam klicklyssnare på listan (event delegation)
 *   i stället för en lyssnare per erbjudande.
 * - Prisvisningen är uppdelad i en funktion som bestämmer meddelandet
 *   och en som skriver ut det på sidan.
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
  confirmed: false    // true när förfrågan är bekräftad och låst
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

  // Hämtar felelementen med en loop: "offer" -> "offer-error" och så vidare
  el.errors = {};
  FIELD_ORDER.forEach((field) => {
    el.errors[field] = document.getElementById(`${field}-error`);
  });

  el.summary = {
    name: document.getElementById("summary-name"),
    email: document.getElementById("summary-email"),
    offer: document.getElementById("summary-offer"),
    quantity: document.getElementById("summary-quantity"),
    total: document.getElementById("summary-total")
  };

  renderOffers();
  showPrice();

  // En enda lyssnare för alla erbjudanden
  el.offers.addEventListener("click", onOfferClick);
  el.form.addEventListener("submit", onSubmit);
  el.restart.addEventListener("click", restart);

  ["quantity", "name", "email"].forEach((field) => {
    el.inputs[field].addEventListener("input", () => onFieldInput(field));
  });
}

/* ==========================================================
   Erbjudanden
   ========================================================== */

// Ritar ut erbjudandena som runda medaljonger.
function renderOffers() {
  el.offers.replaceChildren();
  OFFERS.forEach((offer) => {
    el.offers.append(createOfferElement(offer));
  });
}

function createOfferElement(offer) {
  const button = makeElement("button", "doll-offer");
  button.type = "button";
  button.dataset.offerId = offer.id;
  button.setAttribute("aria-pressed", "false");

  const fear = makeElement("span", "doll-offer-fear");
  const dots = makeElement("span", "", fearDots(offer.fearLevel));
  dots.setAttribute("aria-hidden", "true");
  const fearText = makeElement("span", "visually-hidden", `Fear level ${offer.fearLevel} of ${MAX_FEAR_LEVEL}`);
  fear.append(dots, fearText);

  const price = makeElement("span", "doll-offer-price", formatSek(offer.pricePerUnit));
  price.append(makeElement("small", "", ` per ${PLAYERS.singular}`));

  button.append(
    fear,
    makeElement("span", "doll-offer-name", offer.name),
    makeElement("span", "doll-offer-description", offer.description),
    price
  );
  return button;
}

// Skapar ett element med klass och text. Texten sätts med textContent.
function makeElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
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
  selectOffer(button.dataset.offerId);
}

function selectOffer(offerId) {
  state.selectedId = offerId;
  paintSelection();
  showPrice();
  setError("offer", "");
}

// Visar valet med klass, aria-pressed och text.
function paintSelection() {
  el.offers.querySelectorAll(".doll-offer").forEach((button) => {
    const isSelected = button.dataset.offerId === state.selectedId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

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

// En regel per fält. Varje regel returnerar ett felmeddelande, eller "" om allt är rätt.
const rules = {
  offer: () => {
    return findOffer(state.selectedId)
      ? ""
      : "Choose one of the experiences above before you send your request.";
  },

  quantity: (value) => {
    if (value.trim() === "") {
      return `Enter the number of ${PLAYERS.plural}.`;
    }
    if (toPlayerCount(value) === null) {
      return `The number of ${PLAYERS.plural} must be a whole number between ${PLAYERS.min} and ${PLAYERS.max}.`;
    }
    return "";
  },

  name: (value) => {
    return value.trim() === ""
      ? "Enter your name. The field can't be empty or contain only spaces."
      : "";
  },

  email: (value) => {
    if (value === "") {
      return "Enter your email address.";
    }
    if (/\s/.test(value)) {
      return "The email address can't contain spaces.";
    }

    const at = value.indexOf("@");
    if (at === -1 || at !== value.lastIndexOf("@")) {
      return "The email address must contain exactly one @, for example name@example.com.";
    }

    const localPart = value.slice(0, at);
    const domain = value.slice(at + 1);
    if (localPart === "") {
      return "There must be text before the @ in the email address.";
    }
    if (domain === "") {
      return "There must be text after the @ in the email address.";
    }

    // Domänen ska ha minst en punkt, och varje del runt punkterna ska innehålla text.
    const domainParts = domain.split(".");
    if (domainParts.length < 2 || domainParts.includes("")) {
      return "The part after @ needs a dot with text on both sides, for example example.com.";
    }
    return "";
  }
};

// Hämtar värdet som regeln för ett fält ska kontrollera.
function readValue(field) {
  return field === "offer" ? state.selectedId : el.inputs[field].value;
}

// Kontrollerar ett fält, visar resultatet och returnerar true om fältet är giltigt.
function checkField(field) {
  const message = rules[field](readValue(field));
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

// Vid inmatning: uppdatera priset, och kontrollera fältet igen om det visar ett fel.
function onFieldInput(field) {
  if (field === "quantity") {
    showPrice();
  }
  if (!el.errors[field].hidden) {
    checkField(field);
  }
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

  confirmBooking(buildBooking());
}

function focusField(field) {
  const target = field === "offer"
    ? el.offers.querySelector(".doll-offer")
    : el.inputs[field];
  target.focus();
}

// Ögonblicksbild av det som bekräftas, färdig att visa.
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

function confirmBooking(booking) {
  state.confirmed = true;

  // Nycklarna i booking är desamma som i el.summary.
  // textContent skriver över, så det kan aldrig bli dubbla bekräftelser.
  Object.entries(booking).forEach(([key, value]) => {
    el.summary[key].textContent = value;
  });

  // Lås formuläret så att de bekräftade uppgifterna inte kan ändras.
  el.fields.disabled = true;
  el.submit.hidden = true;

  el.confirmation.hidden = false;
  el.confirmation.focus();
}

/* ==========================================================
   Start over
   ========================================================== */

function restart() {
  state.selectedId = null;
  state.confirmed = false;

  // Låser upp formuläret och tömmer det. reset() sätter varje fält till sitt
  // värde i HTML-koden: namn och e-post blir tomma och antal blir 1 (value="1").
  el.fields.disabled = false;
  el.form.reset();

  paintSelection();
  FIELD_ORDER.forEach((field) => setError(field, ""));

  Object.values(el.summary).forEach((element) => {
    element.textContent = "";
  });
  el.confirmation.hidden = true;
  el.submit.hidden = false;

  showPrice();
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
